import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { useSparkStore } from '@/stores/sparkStore'
import type { Flame } from '@/types'

interface RekindlePageProps {
  flameId: string
}

const REKINDLE_COOLDOWN = 5000 // 5 seconds

export function RekindlePage({ flameId }: RekindlePageProps) {
  const navigate = useNavigate()
  const { updateFlame } = useFlameStore()
  const { addSpark } = useSparkStore()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [reflection, setReflection] = useState('')
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadFlame()
  }, [flameId])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(Math.max(0, cooldownRemaining - 1000))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  const loadFlame = async () => {
    const f = await db.flames.get(flameId)
    if (f) {
      setFlame(f)
      // Check if in cooldown
      if (f.lastRekindleTime) {
        const elapsed = Date.now() - f.lastRekindleTime
        if (elapsed < REKINDLE_COOLDOWN) {
          setCooldownRemaining(Math.ceil((REKINDLE_COOLDOWN - elapsed) / 1000))
        }
      }
    }
  }

  const handleSubmit = async () => {
    if (!flame || !reflection.trim() || isSubmitting) return

    setIsSubmitting(true)

    // Update flame with user record
    await updateFlame(flame.id, {
      userRecord: reflection.trim(),
      completedAt: Date.now(),
      lastRekindleTime: Date.now(),
      rekindleCount: flame.rekindleCount + 1,
    })

    // Generate new sparks based on reflection
    await addSpark({
      content: `回顾「${flame.title}」：${reflection.trim()}`,
      sourceType: 'rekindle',
      sourceFlameId: flame.id,
      sourcePrairieId: flame.prairieId,
      sourceSparkId: null,
    })

    setIsSubmitting(false)
    navigate('/hearth')
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (!flame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">烈焰不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">取火</h1>
      </header>

      <main className="p-4">
        {/* Flame Info */}
        <section className="mb-6">
          <h2 className="text-sm text-gray-400 mb-2">即将完成的探索</h2>
          <div className="bg-bg-card rounded-lg p-4">
            <h3 className="font-medium text-fire-flame">{flame.title}</h3>
            {flame.description && (
              <p className="text-sm text-gray-400 mt-1">{flame.description}</p>
            )}
          </div>
        </section>

        {/* Cooldown Warning */}
        {cooldownRemaining > 0 && (
          <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
            <p className="text-orange-400 text-center">
              重新取火 ({cooldownRemaining}s)
            </p>
          </div>
        )}

        {/* Reflection Form */}
        <section>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">这次探索给你带来了什么？</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="这次探索给你带来了什么..."
                rows={6}
                disabled={cooldownRemaining > 0}
                className="w-full bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-flame focus:outline-none resize-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-600 rounded"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reflection.trim() || cooldownRemaining > 0 || isSubmitting}
              className={`flex-1 py-2 rounded ${
                reflection.trim() && cooldownRemaining === 0 && !isSubmitting
                  ? 'bg-fire-flame text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '提交中...' : '完成探索'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}