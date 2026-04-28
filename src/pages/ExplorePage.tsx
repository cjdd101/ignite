import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { useSparkStore } from '@/stores/sparkStore'
import { api } from '@/lib/api'
import { BottomNav } from '@/components/BottomNav'

interface ExploreSpark {
  content: string
  type: string
}

const FALLBACK_RECOMMENDATIONS = [
  { content: '为什么蚊子只咬我，不咬别人？', type: '思考' },
  { content: '咖啡是如何从一颗豆子变成一杯饮品的？', type: '阅读' },
  { content: '古典音乐是如何诞生的？', type: '观看' },
  { content: '冥想到底是什么原理？', type: '实践' },
]

export function ExplorePage() {
  const navigate = useNavigate()
  const { prairies, fetchPrairies } = usePrairieStore()
  const { wildFlames } = useFlameStore()
  const { addSpark } = useSparkStore()

  const [query, setQuery] = useState('')
  const [sparks, setSparks] = useState<ExploreSpark[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(FALLBACK_RECOMMENDATIONS)
  const [showRecommendations, setShowRecommendations] = useState(true)

  useEffect(() => {
    fetchPrairies()
  }, [fetchPrairies])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setShowRecommendations(false)

    try {
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.explore({
        query: query.trim(),
        existingPrairies: existingPrairieNames,
      })
      setSparks(response.sparks || [])
    } catch (err) {
      setSparks([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToHearth = async (spark: ExploreSpark) => {
    await addSpark(spark.content, 'ai_explore')
  }

  const handleKindle = (spark: ExploreSpark) => {
    navigate(`/prairie/flame/create?content=${encodeURIComponent(spark.content)}`)
  }

  const handleShuffleRecommendations = () => {
    setRecommendations(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-30 left-1/3 w-80 h-80 rounded-full bg-fire-spark/5 blur-[120px]" />
        <div className="absolute top-60 right-1/4 w-60 h-60 rounded-full bg-fire-flame/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header text-center"
        >
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🔍
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-fire-spark/20 via-transparent to-fire-flame/20 blur-xl rounded-full" />
          </div>

          <h1 className="page-title">探索</h1>
          <p className="page-subtitle">发现新的方向，扩展你的视野</p>
        </motion.header>

        {/* 搜索区 */}
        <main className="px-4 max-w-lg mx-auto pb-8">
          <section className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入关键词或问题..."
                className="input flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-gradient-to-r from-fire-flame to-fire-wildfire text-white rounded-xl disabled:opacity-50"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : '探索'}
              </motion.button>
            </div>
          </section>

          {/* AI 探索结果 */}
          {!showRecommendations && (
            <section>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">探索结果</h2>
              {sparks.length > 0 ? (
                <div className="space-y-3">
                  {sparks.map((spark, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card card-spark p-4"
                    >
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                        {spark.type}
                      </span>
                      <p className="text-text-primary">{spark.content}</p>
                      <div className="flex gap-2 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToHearth(spark)}
                          className="flex-1 py-2 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors text-sm"
                        >
                          加入火盆
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleKindle(spark)}
                          className="flex-1 py-2 bg-gradient-to-r from-fire-spark to-fire-ember text-white rounded-lg text-sm"
                        >
                          点燃
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-8">暂无结果，请尝试其他关键词</p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowRecommendations(true)
                  setQuery('')
                  setSparks([])
                }}
                className="w-full mt-4 py-2 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
              >
                返回推荐
              </motion.button>
            </section>
          )}

          {/* 推荐内容 */}
          {showRecommendations && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">推荐探索</h2>
                <button
                  onClick={handleShuffleRecommendations}
                  className="text-xs text-text-muted hover:text-fire-spark transition-colors"
                >
                  换一批
                </button>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card card-spark p-4"
                  >
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                      {rec.type}
                    </span>
                    <p className="text-text-primary">{rec.content}</p>
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToHearth(rec)}
                        className="flex-1 py-2 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors text-sm"
                      >
                        加入火盆
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleKindle(rec)}
                        className="flex-1 py-2 bg-gradient-to-r from-fire-spark to-fire-ember text-white rounded-lg text-sm"
                      >
                        点燃
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* 草原探索 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
              🗺️ 草原探索
            </h2>

            {prairies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 rounded-2xl bg-bg-secondary/30 border border-white/5"
              >
                <div className="text-4xl mb-3">🏕️</div>
                <p className="text-text-muted text-sm">还没有草原</p>
                <p className="text-xs text-text-muted/60 mt-1">去火盆点燃一些火种，或者整理野火创建草原</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {prairies.map((prairie) => (
                  <motion.button
                    key={prairie.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/prairie/flame/create', { state: { prairieId: prairie.id } })}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="w-full p-4 rounded-xl bg-bg-card border border-white/5 hover:border-prairie-primary/30 group transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-prairie-primary/10 flex items-center justify-center text-lg">
                          🌿
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-prairie-light group-hover:text-prairie-primary transition-colors">
                            {prairie.name}
                          </h3>
                          {prairie.description && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{prairie.description}</p>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-prairie-primary/50 group-hover:text-prairie-primary group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.section>

          {/* 野火快速入口 */}
          {wildFlames.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
                🔥 快速访问
              </h2>

              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {wildFlames.slice(0, 5).map((flame) => (
                  <motion.button
                    key={flame.id}
                    onClick={() => navigate(`/prairie/${flame.id}/rekindle`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0 px-4 py-2 rounded-full bg-bg-card/80 border border-white/10 text-sm text-text-secondary hover:text-fire-flame hover:border-fire-flame/30 transition-all"
                  >
                    {flame.title.length > 10 ? flame.title.slice(0, 10) + '...' : flame.title}
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}