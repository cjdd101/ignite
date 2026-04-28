import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, generateId } from '@/lib/db'
import { api } from '@/lib/api'
import { RekindleSparkCard } from '@/components/RekindleSparkCard'
import { useSparkStore } from '@/stores/sparkStore'
import type { Flame, RekindleRecord } from '@/types'

const REKINDLE_COOLDOWN = 5000
const REKINDLE_LIMIT = 10

interface RekindledSpark {
  content: string
  retained: boolean
  discarded: boolean
}

interface RekindlePageProps {
  flameId: string
}

export function RekindlePage({ flameId }: RekindlePageProps) {
  const navigate = useNavigate()
  const { addSpark } = useSparkStore()

  const [flame, setFlame] = useState<Flame | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [sparks, setSparks] = useState<RekindledSpark[]>([])
  const [atLimit, setAtLimit] = useState(false)
  const [rekindleRecords, setRekindleRecords] = useState<RekindleRecord[]>([])

  // Manual spark creation
  const [manualSpark, setManualSpark] = useState('')
  const [isCreatingManual, setIsCreatingManual] = useState(false)

  useEffect(() => {
    if (flameId) {
      db.flames.get(flameId).then(f => {
        setFlame(f || null)
        if (f) {
          setAtLimit(f.rekindleCount >= REKINDLE_LIMIT)
          setCooldownRemaining(
            f.lastRekindleTime && Date.now() - f.lastRekindleTime < REKINDLE_COOLDOWN
              ? Math.ceil((REKINDLE_COOLDOWN - (Date.now() - f.lastRekindleTime)) / 1000)
              : 0
          )
          // Trigger AI rekindle with flame data directly
          triggerRekindle(f)
        }
      })
      db.rekindleRecords.where('flameId').equals(flameId).toArray().then(setRekindleRecords)
    }
  }, [flameId])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(Math.max(0, cooldownRemaining - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  const triggerRekindle = async (flameData: Flame) => {
    if (loading || atLimit || cooldownRemaining > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.rekindle({
        taskTitle: flameData.title,
        taskDescription: flameData.description || '',
        userRecord: flameData.userRecord || '',
        sourcePrairie: flameData.prairieId || '',
      })

      const newSparks = (response.newQuestions || []).map(q => ({
        content: q,
        retained: false,
        discarded: false,
      }))
      setSparks(newSparks)
    } catch (err) {
      setError('重新点燃失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Rekindle button click handler
  const handleRekindle = () => flame && triggerRekindle(flame)

  const handleCreateManualSpark = async () => {
    if (!manualSpark.trim() || isCreatingManual) return
    setIsCreatingManual(true)
    try {
      await addSpark(manualSpark.trim(), 'user')
      setManualSpark('')
    } finally {
      setIsCreatingManual(false)
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

  const handleSave = async () => {
    if (!flameId || !flame) return

    const sparksToSave = sparks.filter(s => s.retained && !s.discarded)
    const retainedIds: string[] = []

    for (const spark of sparksToSave) {
      const newSpark = await addSpark(spark.content, 'ai_rekindle')
      retainedIds.push(newSpark.id)
    }

    const record: RekindleRecord = {
      id: generateId(),
      flameId,
      sparksResult: sparks.map(s => s.content),
      retainedSparkIds: retainedIds,
      createdAt: Date.now(),
    }
    await db.rekindleRecords.add(record)

    await db.flames.update(flameId, {
      rekindleCount: flame.rekindleCount + 1,
      lastRekindleTime: Date.now(),
    })

    navigate('/prairie')
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">取火</h1>
        <p className="text-sm text-gray-400">从燃烧中获得新的灵感</p>
      </header>

      <main className="p-4">
        {flame && (
          <div className="bg-bg-card rounded-lg p-4 mb-4">
            <h2 className="font-medium text-white">{flame.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              已取火 {flame.rekindleCount} / {REKINDLE_LIMIT} 次
            </p>
          </div>
        )}

        {/* 上区：手动创建火种表单 */}
        <section className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">手动创建火种</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualSpark}
              onChange={e => setManualSpark(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateManualSpark()}
              placeholder="写下你的灵感..."
              className="flex-1 bg-bg-card border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-fire-flame"
            />
            <button
              onClick={handleCreateManualSpark}
              disabled={isCreatingManual || !manualSpark.trim()}
              className="px-4 py-2 bg-fire-flame text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingManual ? '...' : '创建'}
            </button>
          </div>
        </section>

        {/* 下区：AI 取火 */}
        <section>
          <h3 className="text-sm text-gray-400 mb-2">AI 正在帮你取火中...</h3>

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

          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-fire-flame border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400">AI 正在思考中...</p>
            </div>
          )}

          {!loading && sparks.length > 0 && (
            <>
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
                  onClick={() => { setSparks([]); handleRekindle() }}
                  disabled={cooldownRemaining > 0 || atLimit}
                  className="flex-1 py-2 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  重新取火
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-fire-flame text-white rounded"
                >
                  保存火种
                </button>
              </div>
            </>
          )}

          {!loading && sparks.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-gray-500">暂无火种</p>
            </div>
          )}

          {atLimit && (
            <p className="text-orange-400 text-sm text-center mt-2">已达取火上限</p>
          )}
        </section>

        {rekindleRecords.length > 0 && (
          <section className="mt-8">
            <h3 className="text-sm text-gray-500 mb-3">历史取火记录</h3>
            {rekindleRecords.map(record => (
              <div key={record.id} className="bg-bg-card rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                </p>
                <div className="space-y-1">
                  {record.sparksResult.map((q, i) => (
                    <p key={i} className="text-sm text-gray-300">• {q}</p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}