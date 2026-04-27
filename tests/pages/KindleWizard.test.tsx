import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { KindleWizard } from '@/pages/KindleWizard'
import { db } from '@/lib/db'

vi.mock('@/lib/api', () => ({
  api: {
    ignite: vi.fn().mockResolvedValue({
      perspectives: [
        { type: '阅读', description: '通过书籍深入了解', firstStep: '读一本相关书籍', searchPhrase: '推荐书籍' },
        { type: '观看', description: '通过视频学习', firstStep: '看一个5分钟视频', searchPhrase: '视频教程' },
      ],
      suggestedPrairie: null,
      newPrairieSuggestion: null,
    }),
  },
}))

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('KindleWizard', () => {
  beforeEach(async () => {
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
  })

  it('should render spark content', async () => {
    const sparkId = crypto.randomUUID()
    await db.sparks.add({
      id: sparkId,
      content: '如何学习咖啡拉花？',
      sourceType: 'user',
      createdAt: Date.now(),
      isDeleted: false,
    })

    render(<KindleWizard sparkId={sparkId} />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByText('如何学习咖啡拉花？')).toBeDefined()
    })
  })

  it('should show step 1 label initially', async () => {
    const sparkId = crypto.randomUUID()
    await db.sparks.add({
      id: sparkId,
      content: '测试火种',
      sourceType: 'user',
      createdAt: Date.now(),
      isDeleted: false,
    })

    render(<KindleWizard sparkId={sparkId} />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByText(/第1步/)).toBeDefined()
    })
  })

  it('should load AI perspectives when clicking button', async () => {
    const sparkId = crypto.randomUUID()
    await db.sparks.add({
      id: sparkId,
      content: '测试火种',
      sourceType: 'user',
      createdAt: Date.now(),
      isDeleted: false,
    })

    render(<KindleWizard sparkId={sparkId} />, { wrapper: Wrapper })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('获取探索视角'))
    })

    await waitFor(() => {
      expect(screen.getByText('选择探索视角')).toBeDefined()
    })
  })

  it('should allow multi-select perspectives', async () => {
    const sparkId = crypto.randomUUID()
    await db.sparks.add({
      id: sparkId,
      content: '测试火种',
      sourceType: 'user',
      createdAt: Date.now(),
      isDeleted: false,
    })

    render(<KindleWizard sparkId={sparkId} />, { wrapper: Wrapper })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('获取探索视角'))
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })

  it('should navigate to step 2 after selecting perspectives', async () => {
    const sparkId = crypto.randomUUID()
    await db.sparks.add({
      id: sparkId,
      content: '测试火种',
      sourceType: 'user',
      createdAt: Date.now(),
      isDeleted: false,
    })

    render(<KindleWizard sparkId={sparkId} />, { wrapper: Wrapper })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('获取探索视角'))
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText('下一步'))
    })

    await waitFor(() => {
      expect(screen.getByText(/第2步/)).toBeDefined()
    })
  })
})
