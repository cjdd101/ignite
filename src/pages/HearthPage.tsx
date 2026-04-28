import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSparkStore } from '@/stores/sparkStore'
import { useSeedBufferStore } from '@/stores/seedBufferStore'
import { SparkCard } from '@/components/SparkCard'
import { SparkInput } from '@/components/SparkInput'
import { BottomNav } from '@/components/BottomNav'

export function HearthPage() {
  const { sparks, fetchSparks } = useSparkStore()
  const { seeds, fetchSeeds, addToSparks, refillBuffer, loading } = useSeedBufferStore()

  useEffect(() => {
    fetchSparks()
    fetchSeeds()
  }, [fetchSparks, fetchSeeds])

  const handleSwapSeeds = async () => {
    if (seeds.length === 0) {
      await refillBuffer()
    } else {
      await addToSparks(seeds)
    }
    await fetchSparks()
    await fetchSeeds()
  }

  const sparkCount = sparks.length
  const seedCount = seeds.length

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-fire-spark/5 blur-[100px]" />
        <div className="absolute top-40 right-1/4 w-48 h-48 rounded-full bg-fire-flame/5 blur-[80px]" />
      </div>

      {/* 页面内容 */}
      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header text-center"
        >
          {/* 火盆图标 */}
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🔥
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-fire-spark/20 via-transparent to-fire-flame/20 blur-xl rounded-full" />
          </div>

          <h1 className="page-title">火盆</h1>
          <p className="page-subtitle">
            {sparkCount > 0
              ? `已积蓄 ${sparkCount} 粒火种`
              : '写下你的第一个灵感'
            }
          </p>
        </motion.header>

        {/* 输入区域 */}
        <div className="px-4 max-w-lg mx-auto">
          <SparkInput onSubmit={fetchSparks} />
        </div>

        {/* 火种列表 */}
        <main className="px-4 max-w-lg mx-auto">
          <AnimatePresence mode="popLayout">
            {sparks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-4xl mb-4">🌱</div>
                <p className="text-text-muted">火盆空空如也</p>
                <p className="text-sm text-text-muted/60 mt-1">写下你的第一个灵感</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 animate-stagger"
              >
                {sparks.map((spark) => (
                  <SparkCard key={spark.id} spark={spark} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 底部换一批按钮 */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-20 left-0 right-0 px-4 py-4 pointer-events-none"
        >
          <div className="max-w-lg mx-auto flex justify-end">
            <motion.button
              onClick={handleSwapSeeds}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={seedCount === 0 || loading}
              className={`
                pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full
                text-sm font-medium transition-all duration-200
                ${loading
                  ? 'bg-bg-elevated/40 text-text-muted cursor-wait border border-white/5'
                  : seedCount > 0
                  ? 'bg-bg-elevated/80 backdrop-blur-md border border-white/10 text-text-secondary hover:text-fire-spark hover:border-fire-spark/30'
                  : 'bg-bg-elevated/40 text-text-muted cursor-not-allowed border border-white/5'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>思考中...</span>
                </>
              ) : (
                <>
                  <span>换一批</span>
                  <span className={seedCount > 0 ? 'text-fire-spark' : 'text-text-muted'}>
                    ({seedCount})
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.footer>
      </div>

      <BottomNav />
    </div>
  )
}