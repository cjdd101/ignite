import { describe, it, expect, beforeEach } from 'vitest'
import { db, generateId } from '@/lib/db'

describe('db', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
    await db.rekindleRecords.clear()
    await db.seedBuffer.clear()
  })

  describe('generateId', () => {
    it('generates a valid UUID', () => {
      const id = generateId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('sparks', () => {
    it('can add a spark', async () => {
      const id = generateId()
      await db.sparks.add({
        id,
        content: 'test spark',
        sourceType: 'user',
        createdAt: Date.now(),
        isDeleted: false,
      })
      const spark = await db.sparks.get(id)
      expect(spark?.content).toBe('test spark')
    })

    it('can add multiple sparks', async () => {
      const id1 = generateId()
      const id2 = generateId()
      await db.sparks.bulkAdd([
        { id: id1, content: 'spark 1', sourceType: 'user', createdAt: Date.now(), isDeleted: false },
        { id: id2, content: 'spark 2', sourceType: 'ai_rekindle', createdAt: Date.now(), isDeleted: false },
      ])
      const count = await db.sparks.count()
      expect(count).toBe(2)
    })

    it('can delete a spark', async () => {
      const id = generateId()
      await db.sparks.add({
        id,
        content: 'to delete',
        sourceType: 'user',
        createdAt: Date.now(),
        isDeleted: false,
      })
      await db.sparks.delete(id)
      const spark = await db.sparks.get(id)
      expect(spark).toBeUndefined()
    })
  })
})