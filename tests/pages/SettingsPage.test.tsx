import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SettingsPage } from '@/pages/SettingsPage'
import { db } from '@/lib/db'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
  })

  describe('rendering', () => {
    it('shows "设置" title in h1', () => {
      renderWithRouter(<SettingsPage />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('设置')
    })
  })

  describe('data management', () => {
    it('shows data statistics', async () => {
      // Add some data
      await db.sparks.add({
        id: 'spark-1',
        content: 'Test spark',
        sourceType: 'user',
        sourceFlameId: null,
        sourcePrairieId: null,
        sourceSparkId: null,
        createdAt: Date.now(),
        isDeleted: false,
      })

      await db.flames.add({
        id: 'flame-1',
        title: 'Test flame',
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

      await db.prairies.add({
        id: 'prairie-1',
        name: 'Test prairie',
        description: null,
        status: 'active',
        archivedAt: null,
        createdAt: Date.now(),
      })

      renderWithRouter(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/火种:/)).toBeInTheDocument()
        expect(screen.getByText(/烈焰:/)).toBeInTheDocument()
        expect(screen.getByText(/草原:/)).toBeInTheDocument()
      })
    })

    it('has export button', () => {
      renderWithRouter(<SettingsPage />)
      expect(screen.getByRole('button', { name: '导出数据' })).toBeInTheDocument()
    })

    it('has clear data button', () => {
      renderWithRouter(<SettingsPage />)
      expect(screen.getByRole('button', { name: '清空数据' })).toBeInTheDocument()
    })
  })

  describe('about section', () => {
    it('shows app version', () => {
      renderWithRouter(<SettingsPage />)
      expect(screen.getByText(/点燃/)).toBeInTheDocument()
    })
  })
})