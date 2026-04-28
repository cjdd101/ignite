import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { api } from '@/lib/api'
import { BottomNav } from '@/components/BottomNav'
import { db } from '@/lib/db'

interface OrganizeSuggestion {
  action: 'merge' | 'create'
  taskIndices: number[]
  targetPrairie?: string
  newPrairieName?: string
  reason: string
}

export function OrganizePage() {
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()

  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<OrganizeSuggestion[]>([])
  const [step, setStep] = useState<'overview' | 'detail'>('overview')
  const [currentSuggestion, setCurrentSuggestion] = useState<OrganizeSuggestion | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
  }, [fetchWildFlames, fetchPrairies])

  const handleAnalyze = async () => {
    if (wildFlames.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const unclassifiedTasks = wildFlames.map(f => ({ title: f.title }))
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.organize({
        unclassifiedTasks,
        existingPrairies: existingPrairieNames,
      })
      setSuggestions(response.suggestions || [])
      if (response.suggestions?.length > 0) {
        setStep('overview')
      }
    } catch (err) {
      setError('整理功能暂时不可用')
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetail = (suggestion: OrganizeSuggestion) => {
    setCurrentSuggestion(suggestion)
    setCurrentIndex(0)
    setStep('detail')
  }

  const handleConfirm = async () => {
    if (!currentSuggestion) return

    const flameIds = currentSuggestion.taskIndices.map(i => wildFlames[i]?.id).filter(Boolean)

    if (currentSuggestion.action === 'merge' && currentSuggestion.targetPrairie) {
      const targetPrairie = prairies.find(p => p.name === currentSuggestion.targetPrairie)
      if (targetPrairie) {
        for (const flameId of flameIds) {
          await db.flames.update(flameId, { prairieId: targetPrairie.id })
        }
      }
    } else if (currentSuggestion.action === 'create' && currentSuggestion.newPrairieName) {
      const newPrairieId = await db.prairies.add({
        id: crypto.randomUUID(),
        name: currentSuggestion.newPrairieName,
        status: 'active',
        createdAt: Date.now(),
      })
      for (const flameId of flameIds) {
        await db.flames.update(flameId, { prairieId: newPrairieId })
      }
    }

    await fetchWildFlames()
    await fetchPrairies()

    const nextIndex = currentIndex + 1
    if (nextIndex < suggestions.length) {
      setCurrentIndex(nextIndex)
      setCurrentSuggestion(suggestions[nextIndex])
    } else {
      setStep('overview')
      setSuggestions([])
    }
  }

  const handleSkip = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < suggestions.length) {
      setCurrentIndex(nextIndex)
      setCurrentSuggestion(suggestions[nextIndex])
    } else {
      setStep('overview')
      setSuggestions([])
    }
  }

  if (wildFlames.length === 0) {
    return (
      <div className="page">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-prairie-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-header"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌿</span>
              <h1 className="text-2xl font-display font-bold text-text-primary">整理</h1>
            </div>
            <p className="text-sm text-text-muted">整理散落的探索</p>
          </motion.header>

          <main className="px-4 max-w-lg mx-auto pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <p className="text-text-muted">暂无野火需要整理</p>
              <p className="text-sm text-text-muted/60 mt-1">去火盆点燃一些火种吧</p>
            </motion.div>
          </main>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-prairie-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-display font-bold text-text-primary">整理</h1>
          </div>
          <p className="text-sm text-text-muted">
            {step === 'overview' ? `${wildFlames.length} 朵野火待整理` : '确认归类'}
          </p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto pb-8">
          {step === 'overview' && (
            <>
              {suggestions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-prairie-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌿</span>
                  </div>
                  <p className="text-xl font-display font-semibold text-text-primary">{wildFlames.length} 朵野火待整理</p>
                  <p className="text-sm text-text-secondary mt-2">
                    让 AI 分析并建议如何归类这些探索
                  </p>

                  {error && (
                    <p className="text-red-400 text-center mt-4">{error}</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-prairie-primary to-prairie-dark rounded-xl text-white font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        分析中...
                      </span>
                    ) : '开始 AI 整理'}
                  </motion.button>
                </motion.div>
              ) : (
                <section>
                  <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">整理建议</h2>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleShowDetail(suggestion)}
                        whileHover={{ scale: 1.01 }}
                        className="w-full card card-prairie p-4 text-left"
                      >
                        {suggestion.action === 'merge' ? (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded bg-prairie-primary/20 text-prairie-primary">归入草原</span>
                            <span className="text-text-primary mx-2">「{suggestion.targetPrairie}」</span>
                            <span className="text-text-muted">({suggestion.taskIndices.length} 朵)</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark">创建新草原</span>
                            <span className="text-text-primary mx-2">「{suggestion.newPrairieName}」</span>
                            <span className="text-text-muted">({suggestion.taskIndices.length} 朵)</span>
                          </>
                        )}
                        <p className="text-sm text-text-muted mt-2">{suggestion.reason}</p>
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSuggestions([])
                      setStep('overview')
                    }}
                    className="w-full mt-4 py-2 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    重新分析
                  </motion.button>
                </section>
              )}
            </>
          )}

          {step === 'detail' && currentSuggestion && (
            <section>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4"
              >
                <h2 className="text-lg font-medium text-text-primary mb-2">
                  {currentSuggestion.action === 'merge' ? (
                    <>归入「{currentSuggestion.targetPrairie}」</>
                  ) : (
                    <>创建「{currentSuggestion.newPrairieName}」</>
                  )}
                </h2>
                <p className="text-sm text-text-muted">{currentSuggestion.reason}</p>
              </motion.div>

              <section className="mb-6">
                <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2">涉及烈焰</h3>
                {currentSuggestion.taskIndices.map(i => (
                  <div key={i} className="card p-3 mb-2">
                    <p className="text-text-primary">{wildFlames[i]?.title}</p>
                  </div>
                ))}
              </section>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSkip}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                >
                  跳过
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-gradient-to-r from-prairie-primary to-prairie-dark rounded-xl text-white font-medium"
                >
                  确认归入
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('overview')}
                className="w-full mt-4 py-2 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
              >
                返回总览
              </motion.button>
            </section>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}