import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Flame } from '@/types'

interface FlameState {
  flames: Flame[]
  wildFlames: Flame[]
  loading: boolean
  error: string | null
  fetchWildFlames: () => Promise<void>
  fetchFlamesByPrairie: (prairieId: string) => Promise<void>
  addFlame: (flame: Omit<Flame, 'id' | 'createdAt' | 'isDeleted' | 'rekindleCount' | 'lastRekindleTime'>) => Promise<Flame>
  updateFlame: (id: string, updates: Partial<Flame>) => Promise<void>
  deleteFlame: (id: string) => Promise<void>
}

export const useFlameStore = create<FlameState>((set, get) => ({
  flames: [],
  wildFlames: [],
  loading: false,
  error: null,

  fetchWildFlames: async () => {
    set({ loading: true, error: null })
    try {
      const flames = await db.flames
        .filter(flame => !flame.prairieId && !flame.isDeleted)
        .sortBy('createdAt')
      set({ wildFlames: flames.reverse(), loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchFlamesByPrairie: async (prairieId: string) => {
    set({ loading: true, error: null })
    try {
      const flames = await db.flames
        .filter(flame => flame.prairieId === prairieId && !flame.isDeleted)
        .sortBy('createdAt')
      set({ flames: flames.reverse(), loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addFlame: async (flameData) => {
    const flame: Flame = {
      ...flameData,
      id: generateId(),
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    }
    await db.flames.put(flame)
    await get().fetchWildFlames()
    return flame
  },

  updateFlame: async (id, updates) => {
    await db.flames.update(id, updates)
    await get().fetchWildFlames()
  },

  deleteFlame: async (id) => {
    await db.flames.update(id, { isDeleted: true })
    await get().fetchWildFlames()
  },
}))