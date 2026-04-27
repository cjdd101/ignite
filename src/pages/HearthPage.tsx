import { useEffect } from 'react'
import { useSparkStore } from '@/stores/sparkStore'
import { useSeedBufferStore } from '@/stores/seedBufferStore'
import { SparkCard } from '@/components/SparkCard'
import { SparkInput } from '@/components/SparkInput'
import { BottomNav } from '@/components/BottomNav'

export function HearthPage() {
  const { sparks, fetchSparks } = useSparkStore()
  const { seeds, fetchSeeds, addToSparks, refillBuffer } = useSeedBufferStore()

  useEffect(() => {
    fetchSparks()
    fetchSeeds()
  }, [fetchSparks, fetchSeeds])

  const sparkCount = sparks.length
  const seedCount = seeds.length

  const handleSwapSeeds = async () => {
    if (seeds.length === 0) {
      await refillBuffer()
    } else {
      await addToSparks(seeds)
    }
    await fetchSparks()
    await fetchSeeds()
  }

  return (
    <div className="hearth-page">
      <header>
        <h1>火盆</h1>
        <span>{sparkCount} 粒火种</span>
      </header>

      <SparkInput />

      <main>
        {sparks.length === 0 ? (
          <p>火盆空空如也</p>
        ) : (
          <div className="spark-list">
            {sparks.map(spark => (
              <SparkCard key={spark.id} spark={spark} />
            ))}
          </div>
        )}
      </main>

      <footer>
        <button onClick={handleSwapSeeds} disabled={seedCount === 0}>
          换一批 ({seedCount})
        </button>
      </footer>

      <BottomNav />
    </div>
  )
}