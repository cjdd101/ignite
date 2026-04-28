import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ExplorePage } from '@/pages/ExplorePage'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

const resetStores = () => {
  useFlameStore.setState({ flames: [], wildFlames: [], loading: false, error: null })
  usePrairieStore.setState({ prairies: [], archivedPrairies: [], loading: false, error: null })
}

describe('ExplorePage', () => {
  beforeEach(async () => {
    await db.flames.clear()
    await db.prairies.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows "探索" title in h1', () => {
      renderWithRouter(<ExplorePage />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('探索')
    })

    it('shows exploration prompt', () => {
      renderWithRouter(<ExplorePage />)
      expect(screen.getByText('主动探索入口')).toBeInTheDocument()
    })
  })

  describe('exploration modes', () => {
    it('shows manual creation option', () => {
      renderWithRouter(<ExplorePage />)
      expect(screen.getByText('手动创建')).toBeInTheDocument()
    })

    it('shows prairie selection option', async () => {
      // Add a prairie
      await db.prairies.add({
        id: 'prairie-1',
        name: '存在主义探索',
        description: '探索人生意义',
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      renderWithRouter(<ExplorePage />)

      await waitFor(() => {
        expect(screen.getByText('存在主义探索')).toBeInTheDocument()
      })
    })

    it('shows all active prairies', async () => {
      await db.prairies.bulkAdd([
        {
          id: 'prairie-1',
          name: '草原1',
          description: null,
          status: 'active',
          archivedAt: null,
          createdAt: Date.now(),
        },
        {
          id: 'prairie-2',
          name: '草原2',
          description: null,
          status: 'active',
          archivedAt: null,
          createdAt: Date.now(),
        },
      ])

      renderWithRouter(<ExplorePage />)

      await waitFor(() => {
        expect(screen.getByText('草原1')).toBeInTheDocument()
        expect(screen.getByText('草原2')).toBeInTheDocument()
      })
    })
  })

  describe('exploration action', () => {
    it('has prairie cards that are clickable', async () => {
      await db.prairies.add({
        id: 'prairie-1',
        name: '测试草原',
        description: null,
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      renderWithRouter(<ExplorePage />)

      await waitFor(() => {
        expect(screen.getByText('测试草原')).toBeInTheDocument()
        expect(screen.getByText('→')).toBeInTheDocument()
      })
    })

    it('has manual create section', () => {
      renderWithRouter(<ExplorePage />)
      expect(screen.getByText('手动创建')).toBeInTheDocument()
      expect(screen.getByText('从空白开始新的探索')).toBeInTheDocument()
    })
  })
})