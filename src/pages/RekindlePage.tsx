import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'
import { useSparkStore } from '@/stores/sparkStore'
import { api } from '@/lib/api'
import { RekindleSparkCard } from '@/components/RekindleSparkCard'

type Step = 'reflect' | 'review'

interface RekindledSpark {
  content: string
  type: string
  retained: boolean
  discarded: boolean
}

const REKINDLE_COOLDOWN = 5000
const REKINDLE_LIMIT = 10

export function RekindlePage() {
  const navigate = useNavigate()
  const { flames } = useFlameStore()
  const { addSpark } = useSparkStore()

  const [step, setStep] = useState<Step>('reflect')
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [sparks, setSparks] = useState<RekindledSpark[]>([])
  const [atLimit, setAtLimit] = useState(false)

  useEffect(() => {
    if (flames.length >= REKINDLE_LIMIT) {
      setAtLimit(true)
      setCooldownRemaining(5)
    }
  }, [flames.length])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(Math.max(0, cooldownRemaining - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  const handleRekindle = async () => {
    if (!reflection.trim() || loading || atLimit) return

    if (cooldownRemaining > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.rekindle({ reflection: reflection.trim() })
      setSparks(response.sparks.map((s: { content: string; type: string }) => ({
        ...s,
        retained: false,
        discarded: false,
      })))
      setStep('review')
    } catch (err) {
      setError('重新点燃失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRetain = (index: number) => {
    setSparks(prev => prev.map((s, i) =>
      i === index ? { ...s, retained: true, discarded: false } : s
    ))
  }

  const handleDiscard = (index: number) => {
    setSparks(prev => prev.map((s, i) =>
      i === index ? { ...s, retained: false, discarded: true } : s
    ))
  }

  const handleBack = () => {
    setStep('reflect')
    setSparks([])
  }

  const handleSave = async () => {
    const sparksToSave = sparks.filter(s => !s.discarded)

    for (const spark of sparksToSave) {
      await addSpark(spark.content, 'ai_rekindle')
    }

    navigate('/hearth')
  }

  const canRekindle = reflection.trim().length > 0 && cooldownRemaining === 0 && !loading && !atLimit

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">重新点燃</h1>
        <p className="text-sm text-gray-400">
          {step === 'reflect' ? '第1步: 写下反思' : '第2步: 选择火种'}
        </p>
      </header>

      <main className="p-4">
        {step === 'reflect' && (
          <section>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">写下你的反思</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="写下你的反思..."
                rows={6}
                className="w-full bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-flame focus:outline-none resize-none"
              />
            </div>

            {cooldownRemaining > 0 && (
              <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
                <p className="text-orange-400 text-center">
                  请等待 {cooldownRemaining}s 后再试
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleRekindle}
              disabled={!canRekindle}
              className={`w-full py-3 rounded-lg ${
                canRekindle
                  ? 'bg-fire-flame text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? '重新点燃中...' : '重新点燃'}
            </button>
          </section>
        )}

        {step === 'review' && (
          <section>
            <h2 className="text-lg font-medium mb-4">AI 重新点燃的火种</h2>

            <div className="space-y-3">
              {sparks.map((spark, index) => (
                <RekindleSparkCard
                  key={index}
                  content={spark.content}
                  onRetain={() => handleRetain(index)}
                  onDiscard={() => handleDiscard(index)}
                  retained={spark.retained}
                  discarded={spark.discarded}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                上一步
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-fire-flame text-white rounded"
              >
                保存火种
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}