import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RekindlePage } from '@/pages/RekindlePage'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { useSparkStore } from '@/stores/sparkStore'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

const resetStores = () => {
  useFlameStore.setState({ flames: [], wildFlames: [], loading: false, error: null })
  useSparkStore.setState({ sparks: [], loading: false, error: null })
}

describe('RekindlePage', () => {
  beforeEach(async () => {
    await db.flames.clear()
    await db.sparks.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows "取火" title in h1 when flame exists', async () => {
      // Add a real flame first
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
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

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toHaveTextContent('取火')
      })
    })

    it('shows flame title being rekindled', async () => {
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
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

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        expect(screen.getByText('测试烈焰')).toBeInTheDocument()
      })
    })

    it('shows error when flame not found', () => {
      renderWithRouter(<RekindlePage flameId="nonexistent" />)
      expect(screen.getByText('烈焰不存在')).toBeInTheDocument()
    })
  })

  describe('rekindle form', () => {
    it('has reflection input field', async () => {
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
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

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('这次探索给你带来了什么...')).toBeInTheDocument()
      })
    })

    it('has submit button', async () => {
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
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

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '完成探索' })).toBeInTheDocument()
      })
    })
  })

  describe('rekindle process', () => {
    it('shows cooldown message when rekindling too soon', async () => {
      // Add a flame that was recently rekindled
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
        prairieId: null,
        sourceSparkId: null,
        igniteBatchId: null,
        userRecord: null,
        completedAt: null,
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 1,
        lastRekindleTime: Date.now() - 3000, // 3 seconds ago
      })

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        expect(screen.getByText(/重新取火/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('has cancel button', async () => {
      await db.flames.add({
        id: 'flame-1',
        title: '测试烈焰',
        description: '测试描述',
        status: 'active',
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

      renderWithRouter(<RekindlePage flameId="flame-1" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
      })
    })
  })
})