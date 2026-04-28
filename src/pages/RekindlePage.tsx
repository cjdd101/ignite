import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

  const handleRekindle = async () => {
    if (!flame || loading || atLimit || cooldownRemaining > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.rekindle({
        taskTitle: flame.title,
        taskDescription: flame.description || '',
        userRecord: flame.userRecord || '',
        sourcePrairie: flame.prairieId || '',
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

  const canRekindle = cooldownRemaining === 0 && !loading && !atLimit

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">重新点燃</h1>
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

        {sparks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              点击按钮，AI 将根据你的探索生成 3 个新的灵感火种
            </p>
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
            {atLimit && (
              <p className="text-orange-400 text-sm mt-2">已达取火上限</p>
            )}
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-medium mb-4">选择保留的火种</h2>
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
                onClick={() => setSparks([])}
                className="flex-1 py-2 border border-gray-600 rounded"
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
          </section>
        )}

        {rekindleRecords.length > 0 && sparks.length === 0 && (
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