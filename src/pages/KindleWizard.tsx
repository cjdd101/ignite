import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import type { Spark } from '@/types'

interface KindleWizardProps {
  sparkId: string
}

const PERSPECTIVES = [
  { id: 'existential', label: '存在主义', description: '探索人生意义与价值' },
  { id: 'pragmatic', label: '实用主义', description: '关注实际应用与效果' },
  { id: 'creative', label: '创造力', description: '启发创意与想象力' },
  { id: 'emotional', label: '情感共鸣', description: '探索情感与感受' },
]

export function KindleWizard({ sparkId }: KindleWizardProps) {
  const navigate = useNavigate()
  const { addFlame } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()
  const [spark, setSpark] = useState<Spark | null>(null)
  const [selectedPerspective, setSelectedPerspective] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [step, setStep] = useState<'perspective' | 'details'>('perspective')

  useEffect(() => {
    loadSpark()
    fetchPrairies()
  }, [sparkId])

  const loadSpark = async () => {
    const s = await db.sparks.get(sparkId)
    setSpark(s || null)
  }

  const handlePerspectiveSelect = (id: string) => {
    setSelectedPerspective(id)
  }

  const handleConfirmPerspective = () => {
    if (selectedPerspective) {
      setStep('details')
    }
  }

  const handleCreateFlame = async () => {
    if (!spark || !title.trim()) return

    await addFlame({
      title: title.trim(),
      description: description.trim(),
      status: 'active',
      prairieId: null,
      sourceSparkId: sparkId,
      igniteBatchId: null,
      userRecord: null,
      completedAt: null,
    })

    navigate('/prairie')
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (!spark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">火种不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-spark">点燃向导</h1>
      </header>

      <main className="p-4">
        {/* Spark Content */}
        <section className="mb-6">
          <h2 className="text-sm text-gray-400 mb-2">火种内容</h2>
          <div className="bg-bg-card rounded-lg p-4">
            <p className="text-white">{spark.content}</p>
          </div>
        </section>

        {/* Perspective Selection */}
        {step === 'perspective' && (
          <section>
            <h2 className="text-lg font-medium mb-4">选择探索视角</h2>
            <div className="space-y-3">
              {PERSPECTIVES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePerspectiveSelect(p.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedPerspective === p.id
                      ? 'border-fire-spark bg-fire-spark/10'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-fire-spark">{p.label}</div>
                  <div className="text-sm text-gray-400">{p.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                取消
              </button>
              <button
                onClick={handleConfirmPerspective}
                disabled={!selectedPerspective}
                className={`flex-1 py-2 rounded ${
                  selectedPerspective
                    ? 'bg-fire-spark text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                下一步
              </button>
            </div>
          </section>
        )}

        {/* Flame Details */}
        {step === 'details' && (
          <section>
            <div className="mb-4">
              <span className="text-sm text-fire-spark">
                已选择视角: {PERSPECTIVES.find(p => p.id === selectedPerspective)?.label}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">烈焰标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="给烈焰起个名字..."
                  className="w-full bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-spark focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述一下这个探索..."
                  rows={4}
                  className="w-full bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-spark focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep('perspective')}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                上一步
              </button>
              <button
                onClick={handleCreateFlame}
                disabled={!title.trim()}
                className={`flex-1 py-2 rounded ${
                  title.trim()
                    ? 'bg-fire-spark text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认点燃
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}