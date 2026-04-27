import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePrairieStore } from '@/stores/prairieStore'
import { db } from '@/lib/db'

describe('usePrairieStore', () => {
  beforeEach(async () => {
    await db.prairies.clear()
  })

  describe('fetchPrairies', () => {
    it('fetches only active prairies', async () => {
      await db.prairies.bulkAdd([
        { id: 'active-1', name: 'Active Prairie', status: 'active', createdAt: 1000 },
        { id: 'active-2', name: 'Active 2', status: 'active', createdAt: 2000 },
        { id: 'archived-1', name: 'Archived', status: 'archived', createdAt: 3000 },
      ])

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.fetchPrairies()
      })

      expect(result.current.prairies).toHaveLength(2)
      expect(result.current.prairies.every(p => p.status === 'active')).toBe(true)
    })
  })

  describe('addPrairie', () => {
    it('creates prairie with active status', async () => {
      const { result } = renderHook(() => usePrairieStore())

      let prairie: ReturnType<typeof result.current.addPrairie> extends Promise<infer T> ? T : never
      await act(async () => {
        prairie = await result.current.addPrairie('咖啡探索', '探索咖啡的世界')
      })

      expect(prairie.name).toBe('咖啡探索')
      expect(prairie.status).toBe('active')
      expect(prairie.id).toBeDefined()
    })
  })

  describe('archivePrairie', () => {
    it('sets status to archived and sets archivedAt', async () => {
      await db.prairies.add({
        id: 'to-archive',
        name: 'Test Prairie',
        status: 'active',
        createdAt: Date.now(),
      })

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.archivePrairie('to-archive')
      })

      const archived = await db.prairies.get('to-archive')
      expect(archived?.status).toBe('archived')
      expect(archived?.archivedAt).toBeDefined()
    })

    it('moves prairie to archived list', async () => {
      await db.prairies.add({
        id: 'archive-me',
        name: 'Archive Me',
        status: 'active',
        createdAt: Date.now(),
      })

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.archivePrairie('archive-me')
      })

      const active = await db.prairies.where({ status: 'active' }).count()
      expect(active).toBe(0)
    })
  })

  describe('restorePrairie', () => {
    it('sets status back to active and removes archivedAt', async () => {
      await db.prairies.add({
        id: 'to-restore',
        name: 'To Restore',
        status: 'archived',
        archivedAt: Date.now(),
        createdAt: Date.now(),
      })

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.restorePrairie('to-restore')
      })

      const restored = await db.prairies.get('to-restore')
      expect(restored?.status).toBe('active')
      expect(restored?.archivedAt).toBeUndefined()
    })
  })

  describe('permanentlyDeletePrairie', () => {
    it('removes prairie from database', async () => {
      await db.prairies.add({
        id: 'to-delete',
        name: 'To Delete',
        status: 'archived',
        createdAt: Date.now(),
      })

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.permanentlyDeletePrairie('to-delete')
      })

      const deleted = await db.prairies.get('to-delete')
      expect(deleted).toBeUndefined()
    })

    it('sets prairieId=null for associated flames', async () => {
      await db.prairies.add({
        id: 'prairie-to-delete',
        name: 'Delete Me',
        status: 'archived',
        createdAt: Date.now(),
      })

      await db.flames.add({
        id: 'flame-1',
        title: 'Flame in Prairie',
        status: 'burning',
        prairieId: 'prairie-to-delete',
        userRecord: '',
        recommendationReason: '',
        searchPhrase: '',
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 0,
      })

      const { result } = renderHook(() => usePrairieStore())

      await act(async () => {
        await result.current.permanentlyDeletePrairie('prairie-to-delete')
      })

      const flame = await db.flames.get('flame-1')
      expect(flame?.prairieId).toBeNull()
    })
  })
})