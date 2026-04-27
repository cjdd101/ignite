import { useEffect } from 'react'
import { useSparkStore } from '@/stores/sparkStore'

export function useSparks() {
  const { sparks, loading, error, fetchSparks, addSpark, deleteSpark } = useSparkStore()

  useEffect(() => {
    fetchSparks()
  }, [fetchSparks])

  return {
    sparks,
    loading,
    error,
    addSpark,
    deleteSpark,
    refresh: fetchSparks,
  }
}