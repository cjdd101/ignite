import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ignite', () => {
    it('should call /api/ai/ignite endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          perspectives: [
            { type: '阅读', description: 'test', firstStep: 'read', searchPhrase: 'test phrase' }
          ],
          suggestedPrairie: null,
          newPrairieSuggestion: null
        }))
      })

      const result = await api.ignite({
        sparkContent: 'test content',
        existingPrairies: []
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/ignite',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sparkContent: 'test content',
            existingPrairies: []
          })
        })
      )
      expect(result.perspectives).toHaveLength(1)
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(api.ignite({
        sparkContent: 'test',
        existingPrairies: []
      })).rejects.toThrow()
    })
  })

  describe('rekindle', () => {
    it('should call /api/ai/rekindle endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          newQuestions: ['q1', 'q2', 'q3']
        }))
      })

      const result = await api.rekindle({
        taskTitle: 'Test Task',
        taskDescription: 'description',
        userRecord: 'my reflection',
        sourcePrairie: 'My Prairie'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/rekindle',
        expect.objectContaining({
          method: 'POST'
        })
      )
      expect(result.newQuestions).toHaveLength(3)
    })
  })

  describe('organize', () => {
    it('should call /api/ai/organize endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          suggestions: [
            { action: 'merge', taskIndices: [0], targetPrairie: 'Test', reason: 'test' }
          ]
        }))
      })

      const result = await api.organize({
        unclassifiedTasks: [{ title: 'Task 1' }],
        existingPrairies: ['Prairie 1']
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/organize',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.suggestions).toHaveLength(1)
    })
  })

  describe('explore', () => {
    it('should call /api/ai/explore endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          sparks: [
            { content: 'spark 1', type: '阅读' },
            { content: 'spark 2', type: '观看' }
          ],
          suggestedPrairie: null,
          newPrairieSuggestion: 'New Prairie'
        }))
      })

      const result = await api.explore({
        query: 'coffee',
        existingPrairies: []
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/explore',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.sparks).toHaveLength(2)
      expect(result.newPrairieSuggestion).toBe('New Prairie')
    })
  })

  describe('seedBuffer', () => {
    it('should call /api/ai/seed-buffer endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          questions: ['q1', 'q2', 'q3', 'q4', 'q5']
        }))
      })

      const result = await api.seedBuffer({
        recentSparks: ['spark1', 'spark2'],
        existingPrairies: []
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/seed-buffer',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.questions).toHaveLength(5)
    })
  })
})
