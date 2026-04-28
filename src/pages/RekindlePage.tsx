import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
      const response = await api.rekindle({
        taskTitle: '反思与重新点燃',
        taskDescription: '',
        userRecord: reflection.trim(),
        sourcePrairie: ''
      })
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
    <div className="page">
      {/* 背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-fire-flame/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-2xl font-display font-bold text-text-primary">重新点燃</h1>
          </div>
          <p className="text-sm text-text-muted">
            {step === 'reflect' ? '写下你的反思' : '选择要保留的火种'}
          </p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto pb-8">
          <AnimatePresence mode="wait">
            {step === 'reflect' && (
              <motion.section
                key="reflect"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">写下你的反思</label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="这次探索给你带来了什么感悟..."
                    rows={6}
                    className="input resize-none"
                  />
                </div>

                {cooldownRemaining > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-fire-ember/10 border border-fire-ember/30 rounded-xl"
                  >
                    <p className="text-fire-ember text-center text-sm">
                      请等待 {cooldownRemaining}s 后再试
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-400 text-center text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: canRekindle ? 1.02 : 1 }}
                  whileTap={{ scale: canRekindle ? 0.98 : 1 }}
                  onClick={handleRekindle}
                  disabled={!canRekindle}
                  className={`w-full py-4 rounded-xl font-medium transition-all ${
                    canRekindle
                      ? 'bg-gradient-to-r from-fire-flame to-fire-wildfire text-white shadow-lg'
                      : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      重新点燃中...
                    </span>
                  ) : '重新点燃'}
                </motion.button>
              </motion.section>
            )}

            {step === 'review' && (
              <motion.section
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                  AI 重新点燃的火种
                </h2>

                <div className="space-y-3 mb-6">
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

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 py-3 bg-gradient-to-r from-fire-spark to-fire-ember rounded-xl text-text-inverse font-medium"
                  >
                    保存火种
                  </motion.button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}