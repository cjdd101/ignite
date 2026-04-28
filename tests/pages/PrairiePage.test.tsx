import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PrairiePage } from '@/pages/PrairiePage'
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

describe('PrairiePage', () => {
  beforeEach(async () => {
    await db.flames.clear()
    await db.prairies.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows "草原" title in h1', async () => {
      renderWithRouter(<PrairiePage />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('草原')
    })

    it('shows wild flames section', async () => {
      renderWithRouter(<PrairiePage />)
      expect(screen.getByText('🌿 野火')).toBeInTheDocument()
    })

    it('shows prairies section', async () => {
      renderWithRouter(<PrairiePage />)
      expect(screen.getByText('我的草原')).toBeInTheDocument()
    })
  })

  describe('wild flames', () => {
    it('displays wild flames without prairieId', async () => {
      // Add a wild flame
      await db.flames.add({
        id: 'flame-1',
        title: 'Wild Flame Title',
        description: 'A wild flame',
        status: 'burning',
        prairieId: null,
        sourceSparkId: null,
        igniteBatchId: null,
        userRecord: null,
        completedAt: null,
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 0,
        lastRekindleTime: null,
      })

      renderWithRouter(<PrairiePage />)

      await waitFor(() => {
        expect(screen.getByText('Wild Flame Title')).toBeInTheDocument()
      })
    })

    it('shows empty state when no wild flames', () => {
      renderWithRouter(<PrairiePage />)
      expect(screen.getByText('暂无野火')).toBeInTheDocument()
    })

    it('has create flame button', () => {
      renderWithRouter(<PrairiePage />)
      const button = screen.getByRole('button', { name: '+ 创建烈焰' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('prairies', () => {
    it('displays prairie list', async () => {
      // Add a prairie
      await db.prairies.add({
        id: 'prairie-1',
        name: '存在主义探索',
        description: '探索人生意义',
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      renderWithRouter(<PrairiePage />)

      await waitFor(() => {
        expect(screen.getByText('存在主义探索')).toBeInTheDocument()
      })
    })

    it('shows archive button for each prairie', async () => {
      await db.prairies.add({
        id: 'prairie-1',
        name: 'Test Prairie',
        description: null,
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      renderWithRouter(<PrairiePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '存档' })).toBeInTheDocument()
      })
    })

    it('can toggle archived prairies visibility', async () => {
      // Add an archived prairie
      await db.prairies.add({
        id: 'prairie-archived',
        name: '已存档草原',
        description: null,
        status: 'archived',
        archivedAt: Date.now(),
        createdAt: Date.now(),
      })

      renderWithRouter(<PrairiePage />)

      // Initially, archived section should not be visible
      expect(screen.queryByText('已存档草原')).not.toBeInTheDocument()

      // Click to show archived
      const showArchivedBtn = screen.getByRole('button', { name: '查看存档' })
      fireEvent.click(showArchivedBtn)

      await waitFor(() => {
        expect(screen.getByText('已存档草原')).toBeInTheDocument()
      })
    })
  })
})