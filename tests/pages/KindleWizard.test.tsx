import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { KindleWizard } from '@/pages/KindleWizard'
import { db } from '@/lib/db'
import { useSparkStore } from '@/stores/sparkStore'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

const resetStores = () => {
  useSparkStore.setState({ sparks: [], loading: false, error: null })
  useFlameStore.setState({ flames: [], wildFlames: [], loading: false, error: null })
  usePrairieStore.setState({ prairies: [], archivedPrairies: [], loading: false, error: null })
}

describe('KindleWizard', () => {
  beforeEach(async () => {
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
    resetStores()
  })

  describe('rendering', () => {
    it('shows wizard title when spark exists', async () => {
      // Add a real spark first
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        expect(screen.getByText('点燃向导')).toBeInTheDocument()
      })
    })

    it('shows spark content being kindled', async () => {
      await db.sparks.add({
        id: 'spark-1',
        content: '测试火种内容',
        sourceType: 'user',
        sourceFlameId: null,
        sourcePrairieId: null,
        sourceSparkId: null,
        createdAt: Date.now(),
        isDeleted: false,
      })

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        expect(screen.getByText('测试火种内容')).toBeInTheDocument()
      })
    })

    it('shows error when spark not found', () => {
      renderWithRouter(<KindleWizard sparkId="nonexistent" />)
      expect(screen.getByText('火种不存在')).toBeInTheDocument()
    })
  })

  describe('perspective selection step', () => {
    it('shows perspective selection on first step', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        expect(screen.getByText('选择探索视角')).toBeInTheDocument()
      })
    })

    it('shows all perspective options', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        expect(screen.getByText('存在主义')).toBeInTheDocument()
        expect(screen.getByText('实用主义')).toBeInTheDocument()
        expect(screen.getByText('创造力')).toBeInTheDocument()
        expect(screen.getByText('情感共鸣')).toBeInTheDocument()
      })
    })

    it('can select a perspective and proceed to details', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const existentialBtn = buttons.find(b => b.textContent?.includes('存在主义'))
        expect(existentialBtn).toBeDefined()
        if (existentialBtn) fireEvent.click(existentialBtn)
      })

      // Click next button
      const nextBtn = screen.getByRole('button', { name: '下一步' })
      fireEvent.click(nextBtn)

      // Should show title input
      await waitFor(() => {
        expect(screen.getByPlaceholderText('给烈焰起个名字...')).toBeInTheDocument()
      })
    })

    it('next button disabled without selection', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        const nextBtn = screen.getByRole('button', { name: '下一步' })
        expect(nextBtn).toBeDisabled()
      })
    })
  })

  describe('flame creation', () => {
    it('has title and description inputs on details step', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      // Select perspective and go to next step
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const btn = buttons.find(b => b.textContent?.includes('存在主义'))
        if (btn) fireEvent.click(btn)
      })

      const nextBtn = screen.getByRole('button', { name: '下一步' })
      fireEvent.click(nextBtn)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('给烈焰起个名字...')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('描述一下这个探索...')).toBeInTheDocument()
      })
    })

    it('can create flame and navigate to prairie', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      // Select perspective and go to next step
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const btn = buttons.find(b => b.textContent?.includes('存在主义'))
        if (btn) fireEvent.click(btn)
      })

      fireEvent.click(screen.getByRole('button', { name: '下一步' }))

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('给烈焰起个名字...'), {
          target: { value: '我的第一个烈焰' },
        })
        fireEvent.change(screen.getByPlaceholderText('描述一下这个探索...'), {
          target: { value: '这是一个测试烈焰' },
        })
      })

      fireEvent.click(screen.getByRole('button', { name: '确认点燃' }))

      await waitFor(async () => {
        const flames = await db.flames.filter(f => f.title === '我的第一个烈焰').toArray()
        expect(flames.length).toBeGreaterThan(0)
        expect(flames[0]?.description).toBe('这是一个测试烈焰')
      })
    })
  })

  describe('navigation', () => {
    it('has cancel button on perspective step', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
      })
    })

    it('has back button on details step', async () => {
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

      renderWithRouter(<KindleWizard sparkId="spark-1" />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const btn = buttons.find(b => b.textContent?.includes('存在主义'))
        if (btn) fireEvent.click(btn)
      })

      fireEvent.click(screen.getByRole('button', { name: '下一步' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '上一步' })).toBeInTheDocument()
      })
    })
  })
})