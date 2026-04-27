import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { SeedBuffer } from '@/types'

interface SeedBufferState {
  seeds: SeedBuffer[]
  loading: boolean
  fetchSeeds: () => Promise<void>
  refreshSeeds: () => Promise<void>
}

export const useSeedBufferStore = create<SeedBufferState>((set, get) => ({
  seeds: [],
  loading: false,

  fetchSeeds: async () => {
    set({ loading: true })
    try {
      const seeds = await db.seedBuffer
        .filter(seed => !seed.used)
        .toArray()
      set({ seeds, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  refreshSeeds: async () => {
    await get().fetchSeeds()
  },
}))