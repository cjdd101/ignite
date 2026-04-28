import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSparkStore } from '@/stores/sparkStore'
import { db } from '@/lib/db'

describe('useSparkStore', () => {
  beforeEach(async () => {
    await db.sparks.clear()
  })

  describe('fetchSparks', () => {
    it('fetches all non-deleted sparks sorted by createdAt desc', async () => {
      // Add some sparks with different timestamps
      await db.sparks.add({
        id: '1',
        content: 'first',
        sourceType: 'user',
        createdAt: 1000,
        isDeleted: false,
      })
      await db.sparks.add({
        id: '2',
        content: 'second',
        sourceType: 'user',
        createdAt: 2000,
        isDeleted: false,
      })
      await db.sparks.add({
        id: '3',
        content: 'deleted',
        sourceType: 'user',
        createdAt: 3000,
        isDeleted: true,
      })

      const { result } = renderHook(() => useSparkStore())

      await act(async () => {
        await result.current.fetchSparks()
      })

      expect(result.current.sparks).toHaveLength(2)
      expect(result.current.sparks[0].content).toBe('second') // newest first
      expect(result.current.sparks[1].content).toBe('first')
    })
  })

  describe('addSpark', () => {
    it('adds a spark with correct properties', async () => {
      const { result } = renderHook(() => useSparkStore())

      let spark!: ReturnType<typeof result.current.addSpark> extends Promise<infer T> ? T : never
      await act(async () => {
        spark = await result.current.addSpark('测试内容', 'user')
      })

      expect(spark.content).toBe('测试内容')
      expect(spark.sourceType).toBe('user')
      expect(spark.isDeleted).toBe(false)
      expect(spark.id).toBeDefined()
    })

    it('persists the spark to database', async () => {
      const { result } = renderHook(() => useSparkStore())

      let spark!: ReturnType<typeof result.current.addSpark> extends Promise<infer T> ? T : never
      await act(async () => {
        spark = await result.current.addSpark('持久化测试', 'ai_seed')
      })

      const fromDb = await db.sparks.get(spark.id)
      expect(fromDb?.content).toBe('持久化测试')
    })
  })

  describe('deleteSpark', () => {
    it('soft deletes a spark (sets isDeleted=true)', async () => {
      await db.sparks.add({
        id: 'test-id',
        content: 'to delete',
        sourceType: 'user',
        createdAt: Date.now(),
        isDeleted: false,
      })

      const { result } = renderHook(() => useSparkStore())

      await act(async () => {
        await result.current.deleteSpark('test-id')
      })

      const deleted = await db.sparks.get('test-id')
      expect(deleted?.isDeleted).toBe(true)
    })
  })
})