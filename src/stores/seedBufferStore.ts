import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import { api } from '@/lib/api'
import type { SeedBuffer } from '@/types'

interface SeedBufferState {
  seeds: SeedBuffer[]
  loading: boolean
  fetchSeeds: () => Promise<void>
  refreshSeeds: () => Promise<void>
  markSeedsUsed: (ids: string[]) => Promise<void>
  addToSparks: (seeds: SeedBuffer[]) => Promise<void>
  refillBuffer: () => Promise<void>
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

      // Auto-refill if below 10
      if (seeds.length < 10) {
        get().refillBuffer()
      }
    } catch (error) {
      set({ loading: false })
    }
  },

  refreshSeeds: async () => {
    await get().fetchSeeds()
  },

  markSeedsUsed: async (ids: string[]) => {
    await db.seedBuffer.where('id').anyOf(ids).modify({ used: true })
    await get().fetchSeeds()
  },

  addToSparks: async (seeds: SeedBuffer[]) => {
    for (const seed of seeds) {
      await db.sparks.put({
        id: generateId(),
        content: seed.content,
        sourceType: 'ai_seed',
        createdAt: Date.now(),
        isDeleted: false,
      })
    }
    await get().markSeedsUsed(seeds.map(s => s.id))
  },

  refillBuffer: async () => {
    set({ loading: true })
    try {
      const sparks = await db.sparks.toArray()
      const recentSparks = sparks.slice(0, 5).map(s => s.content)
      const prairies = await db.prairies.toArray()
      const existingPrairies = prairies.map(p => p.name)

      const response = await api.seedBuffer({
        recentSparks,
        existingPrairies,
      })

      const newSeeds: SeedBuffer[] = response.questions.map(q => ({
        id: generateId(),
        content: q,
        createdAt: Date.now(),
        used: false,
      }))

      if (newSeeds.length > 0) {
        await db.seedBuffer.bulkPut(newSeeds)
      }
      await get().fetchSeeds()
    } catch (error) {
      // Fallback seeds if API fails
      const fallbackSeeds: SeedBuffer[] = [
        { id: generateId(), content: '为什么天空是蓝色的？', createdAt: Date.now(), used: false },
        { id: generateId(), content: '蜜蜂是如何制造蜂蜜的？', createdAt: Date.now(), used: false },
        { id: generateId(), content: '为什么星星会闪烁？', createdAt: Date.now(), used: false },
      ]
      await db.seedBuffer.bulkPut(fallbackSeeds)
      await get().fetchSeeds()
    } finally {
      set({ loading: false })
    }
  },
}))