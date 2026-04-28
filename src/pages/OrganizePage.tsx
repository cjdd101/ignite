import { useEffect, useState } from 'react'
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
      const newId = crypto.randomUUID()
      await db.prairies.add({
        id: newId,
        name: currentSuggestion.newPrairieName,
        status: 'active',
        createdAt: Date.now(),
      })
      for (const flameId of flameIds) {
        await db.flames.update(flameId, { prairieId: newId })
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
      <div className="min-h-screen pb-20">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
        </header>
        <main className="p-4 text-center py-12">
          <p className="text-3xl mb-4">🌿</p>
          <p className="text-gray-400">暂无野火需要整理</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
        <p className="text-sm text-gray-400">
          {step === 'overview' ? `${wildFlames.length} 朵野火待整理` : '确认归类'}
        </p>
      </header>

      <main className="p-4">
        {step === 'overview' && (
          <>
            {suggestions.length === 0 ? (
              <section>
                <div className="bg-bg-card rounded-lg p-6 text-center mb-6">
                  <p className="text-3xl mb-2">🌿</p>
                  <p className="text-xl font-medium text-white">{wildFlames.length} 朵野火待整理</p>
                  <p className="text-sm text-gray-400 mt-2">
                    让 AI 分析并建议如何归类这些探索
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 bg-fire-prairie text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? '分析中...' : '开始 AI 整理'}
                </button>

                {error && (
                  <p className="text-red-400 text-center mt-4">{error}</p>
                )}
              </section>
            ) : (
              <section>
                <h2 className="text-lg font-medium mb-4">整理建议</h2>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleShowDetail(suggestion)}
                      className="w-full bg-bg-card hover:bg-bg-secondary border border-gray-700 rounded-lg p-4 text-left"
                    >
                      {suggestion.action === 'merge' ? (
                        <>
                          <span className="text-fire-prairie">归入草原</span>
                          <span className="text-white mx-2">「{suggestion.targetPrairie}」</span>
                          <span className="text-gray-400">({suggestion.taskIndices.length} 朵)</span>
                        </>
                      ) : (
                        <>
                          <span className="text-fire-spark">创建新草原</span>
                          <span className="text-white mx-2">「{suggestion.newPrairieName}」</span>
                          <span className="text-gray-400">({suggestion.taskIndices.length} 朵)</span>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-1">{suggestion.reason}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSuggestions([])
                    setStep('overview')
                  }}
                  className="w-full mt-4 py-2 border border-gray-600 rounded"
                >
                  重新分析
                </button>
              </section>
            )}
          </>
        )}

        {step === 'detail' && currentSuggestion && (
          <>
            <section className="mb-4">
              <h2 className="text-lg font-medium mb-2">
                {currentSuggestion.action === 'merge' ? (
                  <>归入「{currentSuggestion.targetPrairie}」</>
                ) : (
                  <>创建「{currentSuggestion.newPrairieName}」</>
                )}
              </h2>
              <p className="text-sm text-gray-400">{currentSuggestion.reason}</p>
            </section>

            <section className="mb-6">
              <h3 className="text-sm text-gray-500 mb-2">涉及烈焰</h3>
              {currentSuggestion.taskIndices.map(i => (
                <div key={i} className="bg-bg-card rounded-lg p-3 mb-2">
                  <p className="text-white">{wildFlames[i]?.title}</p>
                </div>
              ))}
            </section>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                跳过
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-fire-prairie text-white rounded"
              >
                确认归入
              </button>
            </div>

            <button
              onClick={() => setStep('overview')}
              className="w-full mt-4 py-2 border border-gray-600 rounded"
            >
              返回总览
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}