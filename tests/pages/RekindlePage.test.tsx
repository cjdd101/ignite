import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RekindlePage } from '@/pages/RekindlePage'
import { useFlameStore } from '@/stores/flameStore'
import { useSparkStore } from '@/stores/sparkStore'
import { api } from '@/lib/api'

vi.mock('@/stores/flameStore')
vi.mock('@/stores/sparkStore')
vi.mock('@/lib/api')

const mockUseFlameStore = useFlameStore as unknown as ReturnType<typeof vi.fn>
const mockUseSparkStore = useSparkStore as unknown as ReturnType<typeof vi.fn>
const mockApi = api as unknown as ReturnType<typeof vi.fn>

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('RekindlePage', () => {
  const mockAddSpark = vi.fn().mockResolvedValue({ id: 'spark-1' })
  const mockAddFlame = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddSpark.mockResolvedValue({ id: 'spark-1' })
    mockUseFlameStore.mockReturnValue({
      flames: [],
      fetchFlames: vi.fn(),
      addFlame: mockAddFlame,
    })
    mockUseSparkStore.mockReturnValue({
      sparks: [],
      fetchSparks: vi.fn(),
      addSpark: mockAddSpark,
    })
  })

  describe('step 1: reflection', () => {
    it('should render reflection textarea and rekindle button', () => {
      renderWithRouter(<RekindlePage />)
      expect(screen.getByPlaceholderText(/写下你的反思/)).toBeDefined()
      expect(screen.getByRole('button', { name: '重新点燃' })).toBeDefined()
    })

    it('should disable rekindle button when reflection is empty', () => {
      renderWithRouter(<RekindlePage />)
      expect(screen.getByRole('button', { name: '重新点燃' })).toBeDisabled()
    })

    it('should enable rekindle button when user types reflection', async () => {
      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: '今天学到了新东西' } })
      expect(screen.getByRole('button', { name: '重新点燃' })).not.toBeDisabled()
    })

    it('should show loading state when rekindling', () => {
      vi.mock('@/lib/api', () => ({
        api: {
          rekindle: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      }))

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))
      expect(screen.getByText('重新点燃中...')).toBeDefined()
    })

    it('should show error message when rekindle fails', async () => {
      mockApi.rekindle = vi.fn().mockRejectedValue(new Error('AI unavailable'))

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('重新点燃失败')).toBeDefined()
      })
    })
  })

  describe('step 2: review sparks', () => {
    it('should show sparks after successful rekindle', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [
          { content: '反思1', type: '阅读' },
          { content: '反思2', type: '观看' },
        ],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('反思1')).toBeDefined()
        expect(screen.getByText('反思2')).toBeDefined()
      })
    })

    it('should show RekindleSparkCard for each spark', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [
          { content: 'spark1', type: '阅读' },
          { content: 'spark2', type: '观看' },
          { content: 'spark3', type: '实践' },
        ],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getAllByText('保留')).toHaveLength(3)
        expect(screen.getAllByText('丢弃')).toHaveLength(3)
      })
    })

    it('should allow going back to step 1', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [{ content: 'spark1', type: '阅读' }],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('spark1')).toBeDefined()
      })

      fireEvent.click(screen.getByRole('button', { name: '上一步' }))

      expect(screen.getByPlaceholderText(/写下你的反思/)).toBeDefined()
    })
  })

  describe('save sparks', () => {
    it('should save only retained sparks when confirm is clicked', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [
          { content: 'spark1', type: '阅读' },
          { content: 'spark2', type: '观看' },
        ],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('spark1')).toBeDefined()
      })

      const retainButtons = screen.getAllByText('保留')
      fireEvent.click(retainButtons[0])

      fireEvent.click(screen.getByRole('button', { name: '保存火种' }))

      await waitFor(() => {
        expect(mockAddSpark).toHaveBeenCalledTimes(1)
        expect(mockAddSpark).toHaveBeenCalledWith('spark1', 'ai_rekindle')
      })
    })

    it('should not save any sparks when all are discarded', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [
          { content: 'spark1', type: '阅读' },
          { content: 'spark2', type: '观看' },
        ],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('spark1')).toBeDefined()
      })

      const discardButtons = screen.getAllByText('丢弃')
      fireEvent.click(discardButtons[0])
      fireEvent.click(discardButtons[1])

      fireEvent.click(screen.getByRole('button', { name: '保存火种' }))

      expect(mockAddSpark).not.toHaveBeenCalled()
    })

    it('should save all sparks when none are discarded', async () => {
      mockApi.rekindle = vi.fn().mockResolvedValue({
        sparks: [
          { content: 'spark1', type: '阅读' },
          { content: 'spark2', type: '观看' },
        ],
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: '重新点燃' }))

      await waitFor(() => {
        expect(screen.getByText('spark1')).toBeDefined()
      })

      fireEvent.click(screen.getByRole('button', { name: '保存火种' }))

      await waitFor(() => {
        expect(mockAddSpark).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('cooldown', () => {
    it('should show cooldown timer when flame limit exceeded', async () => {
      mockUseFlameStore.mockReturnValue({
        flames: Array(11).fill({}),
        fetchFlames: vi.fn(),
        addFlame: mockAddFlame,
      })

      renderWithRouter(<RekindlePage />)
      fireEvent.change(screen.getByPlaceholderText(/写下你的反思/), { target: { value: 'test' } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '重新点燃' })).toBeDisabled()
      })
    })
  })
})