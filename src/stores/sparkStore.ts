import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Spark } from '@/types'

interface SparkState {
  sparks: Spark[]
  loading: boolean
  error: string | null
  fetchSparks: () => Promise<void>
  addSpark: (content: string, sourceType: Spark['sourceType']) => Promise<Spark>
  deleteSpark: (id: string) => Promise<void>
}

export const useSparkStore = create<SparkState>((set, get) => ({
  sparks: [],
  loading: false,
  error: null,

  fetchSparks: async () => {
    set({ loading: true, error: null })
    try {
      const sparks = await db.sparks
        .filter(spark => !spark.isDeleted)
        .sortBy('createdAt')
      set({ sparks: sparks.reverse(), loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addSpark: async (content, sourceType) => {
    const spark: Spark = {
      id: generateId(),
      content,
      sourceType,
      createdAt: Date.now(),
      isDeleted: false,
    }
    await db.sparks.put(spark)
    await get().fetchSparks()
    return spark
  },

  deleteSpark: async (id) => {
    await db.sparks.update(id, { isDeleted: true })
    await get().fetchSparks()
  },
}))