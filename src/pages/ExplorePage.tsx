import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      if (!response.sparks || response.sparks.length === 0) {
        // AI returned empty, fall back to default recommendations
        setRecommendations(FALLBACK_RECOMMENDATIONS)
        setShowRecommendations(true)
      }
    } catch (err) {
      // AI call failed, fall back to default recommendations
      setSparks([])
      setRecommendations(FALLBACK_RECOMMENDATIONS)
      setShowRecommendations(true)
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
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">探索</h1>
        <p className="text-sm text-gray-400">主动探索入口</p>
      </header>

      <main className="p-4">
        {/* 搜索区 */}
        <section className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词或问题..."
              className="flex-1 bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-flame focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-fire-flame text-white rounded-lg disabled:opacity-50"
            >
              {loading ? '...' : '探索'}
            </button>
          </div>
        </section>

        {/* AI 探索结果 */}
        {!showRecommendations && (
          <section>
            <h2 className="text-lg font-medium mb-4">探索结果</h2>
            {sparks.length > 0 ? (
              <div className="space-y-3">
                {sparks.map((spark, index) => (
                  <div key={index} className="bg-bg-card rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                          {spark.type}
                        </span>
                        <p className="text-white">{spark.content}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToHearth(spark)}
                        className="flex-1 py-2 border border-gray-600 rounded text-sm"
                      >
                        加入火盆
                      </button>
                      <button
                        onClick={() => handleKindle(spark)}
                        className="flex-1 py-2 bg-fire-spark text-white rounded text-sm"
                      >
                        点燃
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                暂无结果，请尝试其他关键词
              </p>
            )}
            <button
              onClick={() => {
                setShowRecommendations(true)
                setQuery('')
                setSparks([])
              }}
              className="w-full mt-4 py-2 border border-gray-600 rounded"
            >
              返回推荐
            </button>
          </section>
        )}

        {/* 推荐内容 */}
        {showRecommendations && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">推荐探索</h2>
              <button
                onClick={handleShuffleRecommendations}
                className="text-sm text-gray-400 hover:text-white"
              >
                换一批
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-bg-card rounded-lg p-4">
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                    {rec.type}
                  </span>
                  <p className="text-white">{rec.content}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToHearth(rec)}
                      className="flex-1 py-2 border border-gray-600 rounded text-sm"
                    >
                      加入火盆
                    </button>
                    <button
                      onClick={() => handleKindle(rec)}
                      className="flex-1 py-2 bg-fire-spark text-white rounded text-sm"
                    >
                      点燃
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}