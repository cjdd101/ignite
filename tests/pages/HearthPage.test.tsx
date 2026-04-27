import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { db } from '@/lib/db'
import { useSparkStore } from '@/stores/sparkStore'
import { useSeedBufferStore } from '@/stores/seedBufferStore'

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

// Reset store state between tests
const resetStores = () => {
  useSparkStore.setState({ sparks: [], loading: false, error: null })
  useSeedBufferStore.setState({ seeds: [], loading: false })
}

describe('HearthPage', () => {
  beforeEach(async () => {
    await db.sparks.clear()
    await db.seedBuffer.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows "火盆" title in h1', async () => {
      renderWithRouter(<HearthPage />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('火盆')
    })

    it('shows spark count', async () => {
      // Add some sparks
      await db.sparks.bulkAdd([
        { id: '1', content: 'Spark 1', sourceType: 'user', createdAt: Date.now(), isDeleted: false },
        { id: '2', content: 'Spark 2', sourceType: 'user', createdAt: Date.now(), isDeleted: false },
      ])

      renderWithRouter(<HearthPage />)

      await waitFor(() => {
        expect(screen.getByText('2 粒火种')).toBeInTheDocument()
      })
    })
  })

  describe('spark input', () => {
    it('has textarea for input', () => {
      renderWithRouter(<HearthPage />)
      const textarea = screen.getByPlaceholderText('写下一粒火种...')
      expect(textarea).toBeInTheDocument()
    })

    it('has submit button', () => {
      renderWithRouter(<HearthPage />)
      const button = screen.getByRole('button', { name: '投入火盆' })
      expect(button).toBeInTheDocument()
    })

    it('adds spark when form is submitted', async () => {
      renderWithRouter(<HearthPage />)

      const textarea = screen.getByPlaceholderText('写下一粒火种...')
      fireEvent.change(textarea, { target: { value: '新火种内容' } })

      const button = screen.getByRole('button', { name: '投入火盆' })
      fireEvent.click(button)

      await waitFor(async () => {
        const allSparks = await db.sparks.toArray()
        const spark = allSparks.find(s => s.content === '新火种内容')
        expect(spark).toBeDefined()
      })
    })
  })

  describe('spark list', () => {
    it('displays list of sparks', async () => {
      await db.sparks.bulkAdd([
        { id: '1', content: 'First Spark', sourceType: 'user', createdAt: Date.now(), isDeleted: false },
      ])

      renderWithRouter(<HearthPage />)

      await waitFor(() => {
        expect(screen.getByText('First Spark')).toBeInTheDocument()
      })
    })

    it('shows empty state when no sparks', () => {
      renderWithRouter(<HearthPage />)
      expect(screen.getByText('火盆空空如也')).toBeInTheDocument()
    })
  })

  describe('refresh button', () => {
    it('shows buffer count', async () => {
      // Add some seeds to buffer
      await db.seedBuffer.bulkAdd([
        { id: '1', content: 'Seed 1', createdAt: Date.now(), used: false },
        { id: '2', content: 'Seed 2', createdAt: Date.now(), used: false },
      ])

      renderWithRouter(<HearthPage />)

      await waitFor(() => {
        expect(screen.getByText('换一批 (2)')).toBeInTheDocument()
      })
    })
  })
})