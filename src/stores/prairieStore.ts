import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Prairie } from '@/types'

interface PrairieState {
  prairies: Prairie[]
  loading: boolean
  error: string | null
  fetchPrairies: () => Promise<void>
  addPrairie: (name: string, description?: string) => Promise<Prairie>
  archivePrairie: (id: string) => Promise<void>
  restorePrairie: (id: string) => Promise<void>
  permanentlyDeletePrairie: (id: string) => Promise<void>
}

export const usePrairieStore = create<PrairieState>((set, get) => ({
  prairies: [],
  loading: false,
  error: null,

  fetchPrairies: async () => {
    set({ loading: true, error: null })
    try {
      const prairies = await db.prairies
        .filter(prairie => prairie.status === 'active')
        .sortBy('createdAt')
      set({ prairies: prairies.reverse(), loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addPrairie: async (name, description) => {
    const prairie: Prairie = {
      id: generateId(),
      name,
      description,
      status: 'active',
      createdAt: Date.now(),
    }
    await db.prairies.put(prairie)
    await get().fetchPrairies()
    return prairie
  },

  archivePrairie: async (id) => {
    await db.prairies.update(id, {
      status: 'archived',
      archivedAt: Date.now(),
    })
    await get().fetchPrairies()
  },

  restorePrairie: async (id) => {
    await db.prairies.update(id, {
      status: 'active',
    })
    // Remove the archivedAt field by getting the record and re-adding without it
    const prairie = await db.prairies.get(id)
    if (prairie) {
      const { archivedAt, ...rest } = prairie
      await db.prairies.put(rest as Prairie)
    }
    await get().fetchPrairies()
  },

  permanentlyDeletePrairie: async (id) => {
    // Set prairieId=null for all flames in this prairie
    await db.flames.where({ prairieId: id }).modify({ prairieId: null })
    // Delete the prairie
    await db.prairies.delete(id)
    await get().fetchPrairies()
  },
}))