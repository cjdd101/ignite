import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { OrganizePage } from '@/pages/OrganizePage'
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

describe('OrganizePage', () => {
  beforeEach(async () => {
    await db.flames.clear()
    await db.prairies.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows "整理" title in h1', () => {
      renderWithRouter(<OrganizePage />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('整理')
    })

    it('shows organize description', () => {
      renderWithRouter(<OrganizePage />)
      expect(screen.getByText('整理散落的探索')).toBeInTheDocument()
    })
  })

  describe('wild flames section', () => {
    it('shows wild flames count', async () => {
      // Add wild flames
      await db.flames.bulkAdd([
        {
          id: 'flame-1',
          title: '野火1',
          description: null,
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
        },
        {
          id: 'flame-2',
          title: '野火2',
          description: null,
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
        },
      ])

      renderWithRouter(<OrganizePage />)

      await waitFor(() => {
        expect(screen.getByText('2 朵野火待整理')).toBeInTheDocument()
      })
    })

    it('shows empty state when no wild flames', () => {
      renderWithRouter(<OrganizePage />)
      expect(screen.getByText('暂无野火需要整理')).toBeInTheDocument()
    })
  })

  describe('organize action', () => {
    it('has start organizing button when wild flames exist', async () => {
      await db.flames.add({
        id: 'flame-1',
        title: '野火1',
        description: null,
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

      renderWithRouter(<OrganizePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '开始整理' })).toBeInTheDocument()
      })
    })
  })

  describe('organization modal/step', () => {
    it('shows prairie selection when organizing', async () => {
      // Add a prairie
      await db.prairies.add({
        id: 'prairie-1',
        name: '测试草原',
        description: null,
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      // Add a wild flame
      await db.flames.add({
        id: 'flame-1',
        title: '野火1',
        description: null,
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

      renderWithRouter(<OrganizePage />)

      // Click start organizing
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: '开始整理' }))
      })

      // Should show prairie options
      await waitFor(() => {
        expect(screen.getByText('选择目标草原')).toBeInTheDocument()
      })
    })
  })
})