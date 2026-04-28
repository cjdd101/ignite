import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlameStore } from '@/stores/flameStore'
import { db } from '@/lib/db'

describe('useFlameStore', () => {
  beforeEach(async () => {
    await db.flames.clear()
  })

  describe('fetchWildFlames', () => {
    it('fetches only wild flames (prairieId=null) and non-deleted', async () => {
      await db.flames.bulkAdd([
        {
          id: '1',
          title: 'wild flame',
          status: 'burning',
          prairieId: null,
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
          createdAt: 1000,
          isDeleted: false,
          rekindleCount: 0,
        },
        {
          id: '2',
          title: 'prairie flame',
          status: 'burning',
          prairieId: 'some-prairie',
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
          createdAt: 2000,
          isDeleted: false,
          rekindleCount: 0,
        },
        {
          id: '3',
          title: 'deleted wild',
          status: 'burning',
          prairieId: null,
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
          createdAt: 3000,
          isDeleted: true,
          rekindleCount: 0,
        },
      ])

      const { result } = renderHook(() => useFlameStore())

      await act(async () => {
        await result.current.fetchWildFlames()
      })

      expect(result.current.wildFlames).toHaveLength(1)
      expect(result.current.wildFlames[0].title).toBe('wild flame')
    })

    it('sorts by createdAt descending (newest first)', async () => {
      await db.flames.bulkAdd([
        {
          id: 'old',
          title: 'oldest',
          status: 'burning',
          prairieId: null,
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
          createdAt: 1000,
          isDeleted: false,
          rekindleCount: 0,
        },
        {
          id: 'new',
          title: 'newest',
          status: 'burning',
          prairieId: null,
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
          createdAt: 2000,
          isDeleted: false,
          rekindleCount: 0,
        },
      ])

      const { result } = renderHook(() => useFlameStore())

      await act(async () => {
        await result.current.fetchWildFlames()
      })

      expect(result.current.wildFlames[0].title).toBe('newest')
      expect(result.current.wildFlames[1].title).toBe('oldest')
    })
  })

  describe('addFlame', () => {
    it('creates a flame with default values', async () => {
      const { result } = renderHook(() => useFlameStore())

      let flame!: ReturnType<typeof result.current.addFlame> extends Promise<infer T> ? T : never
      await act(async () => {
        flame = await result.current.addFlame({
          title: 'Test Flame',
          status: 'burning',
          prairieId: null,
          userRecord: '',
          recommendationReason: '',
          searchPhrase: '',
        })
      })

      expect(flame.title).toBe('Test Flame')
      expect(flame.isDeleted).toBe(false)
      expect(flame.rekindleCount).toBe(0)
      expect(flame.id).toBeDefined()
    })
  })

  describe('updateFlame', () => {
    it('updates flame status to burned', async () => {
      await db.flames.add({
        id: 'test-id',
        title: 'Test',
        status: 'burning',
        prairieId: null,
        userRecord: '',
        recommendationReason: '',
        searchPhrase: '',
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 0,
      })

      const { result } = renderHook(() => useFlameStore())

      await act(async () => {
        await result.current.updateFlame('test-id', { status: 'burned', completedAt: Date.now() })
      })

      const updated = await db.flames.get('test-id')
      expect(updated?.status).toBe('burned')
    })
  })

  describe('deleteFlame', () => {
    it('soft deletes a flame', async () => {
      await db.flames.add({
        id: 'delete-me',
        title: 'To Delete',
        status: 'burning',
        prairieId: null,
        userRecord: '',
        recommendationReason: '',
        searchPhrase: '',
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 0,
      })

      const { result } = renderHook(() => useFlameStore())

      await act(async () => {
        await result.current.deleteFlame('delete-me')
      })

      const deleted = await db.flames.get('delete-me')
      expect(deleted?.isDeleted).toBe(true)
    })
  })
})