import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db, generateId } from '@/lib/db'
import { usePrairieStore } from '@/stores/prairieStore'
import { api } from '@/lib/api'
import { PlatformJumpPanel } from '@/components/PlatformJumpPanel'
import type { Spark } from '@/types'

type Step = 'perspective' | 'action' | 'confirm'

interface Perspective {
  type: string
  description: string
  firstStep: string
  searchPhrase: string
}

interface KindleWizardProps {
  sparkId: string
  prairieId?: string
}

export function KindleWizard({ sparkId, prairieId: initialPrairieId }: KindleWizardProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { prairies, fetchPrairies } = usePrairieStore()

  const [spark, setSpark] = useState<Spark | null>(null)
  const [sparkContent, setSparkContent] = useState<string>('')
  const [step, setStep] = useState<Step>('perspective')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Perspectives
  const [perspectives, setPerspectives] = useState<Perspective[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // Step 2: Actions
  const [actionInputs, setActionInputs] = useState<Array<{ firstStep: string; searchPhrase: string }>>([])
  const [flameTitles, setFlameTitles] = useState<string[]>([])

  // Step 3: Confirm
  const [selectedPrairieId, setSelectedPrairieId] = useState<string | null>(initialPrairieId || null)
  const [newPrairieName, setNewPrairieName] = useState<string | null>(null)
  const [showPlatformPanel, setShowPlatformPanel] = useState(false)
  const [createdSearchPhrases, setCreatedSearchPhrases] = useState<string[]>([])

  useEffect(() => {
    loadSpark()
    fetchPrairies()
  }, [sparkId])

  const loadSpark = async () => {
    if (sparkId) {
      const s = await db.sparks.get(sparkId)
      setSpark(s || null)
    } else {
      // Check for content in query params (manual create from Explore)
      const content = searchParams.get('content')
      if (content) {
        setSparkContent(decodeURIComponent(content))
      }
    }
  }

  const handleLoadPerspectives = async () => {
    const content = spark?.content || sparkContent
    if (!content) return
    setLoading(true)
    setError(null)

    try {
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.ignite({
        sparkContent: content,
        existingPrairies: existingPrairieNames,
      })

      setPerspectives(response.perspectives)
      setActionInputs(response.perspectives.map(p => ({
        firstStep: p.firstStep,
        searchPhrase: p.searchPhrase,
      })))
      setFlameTitles(response.perspectives.map(p => p.firstStep.split('。')[0] || p.type))
    } catch (err) {
      setError('AI 暂时不可用')
      const fallback: Perspective[] = [
        { type: '阅读', description: '通过书籍深入了解', firstStep: '搜索相关书籍', searchPhrase: content },
        { type: '观看', description: '通过视频直观学习', firstStep: '搜索相关视频', searchPhrase: content },
      ]
      setPerspectives(fallback)
      setActionInputs(fallback.map(() => ({ firstStep: '', searchPhrase: '' })))
      setFlameTitles(fallback.map(p => p.type))
    }

    setLoading(false)
  }

  const togglePerspective = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const handleConfirmPerspectives = () => {
    if (selectedIndices.length > 0) {
      setStep('action')
    }
  }

  const handleSkipToConfirm = () => {
    setSelectedIndices(perspectives.map((_, i) => i))
    setStep('action')
  }

  const updateAction = (index: number, field: 'firstStep' | 'searchPhrase', value: string) => {
    setActionInputs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const updateFlameTitle = (index: number, value: string) => {
    setFlameTitles(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleConfirmActions = () => {
    setStep('confirm')
  }

  const handleCreateFlames = async () => {
    if (!spark && !sparkContent) return

    setLoading(true)
    const igniteBatchId = generateId()
    const searchPhrases: string[] = []

    let targetPrairieId = selectedPrairieId
    if (newPrairieName && !selectedPrairieId) {
      const newId = generateId()
      await db.prairies.add({
        id: newId,
        name: newPrairieName,
        status: 'active',
        createdAt: Date.now(),
      })
      targetPrairieId = newId
    }

    for (const index of selectedIndices) {
      await db.flames.add({
        id: generateId(),
        title: flameTitles[index],
        description: actionInputs[index]?.firstStep || perspectives[index]?.firstStep,
        recommendationReason: perspectives[index]?.description || '',
        searchPhrase: actionInputs[index]?.searchPhrase || perspectives[index]?.searchPhrase || '',
        status: 'burning',
        prairieId: targetPrairieId || undefined,
        sourceSparkId: sparkId || undefined,
        igniteBatchId,
        userRecord: undefined,
        completedAt: undefined,
        createdAt: Date.now(),
        isDeleted: false,
        rekindleCount: 0,
      })
      searchPhrases.push(actionInputs[index]?.searchPhrase || perspectives[index]?.searchPhrase || '')
    }

    if (searchPhrases[0]) {
      await navigator.clipboard.writeText(searchPhrases[0])
    }

    setCreatedSearchPhrases(searchPhrases)
    setShowPlatformPanel(true)
    setLoading(false)
  }

  const handleClosePlatformPanel = () => {
    setShowPlatformPanel(false)
    navigate('/prairie')
  }

  // If no spark and no sparkContent, show manual creation prompt
  if (!spark && !sparkContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">请从火盆或探索页选择要点燃的内容</p>
      </div>
    )
  }

  const displayContent = spark?.content || sparkContent

  const stepLabels: Record<Step, string> = {
    perspective: '第1步: 选择探索视角',
    action: '第2步: 确认行动',
    confirm: '第3步: 确认点燃',
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-spark">点燃向导</h1>
        <p className="text-sm text-gray-400">{stepLabels[step]}</p>
      </header>

      <main className="p-4">
        <section className="mb-6">
          <h2 className="text-sm text-gray-400 mb-2">火种内容</h2>
          <div className="bg-bg-card rounded-lg p-4">
            <p className="text-white">{displayContent}</p>
          </div>
        </section>

        {step === 'perspective' && (
          <section>
            {perspectives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">点击按钮获取 AI 生成的探索视角建议</p>
                <button
                  onClick={handleLoadPerspectives}
                  disabled={loading}
                  className="bg-fire-spark text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? '加载中...' : '获取探索视角'}
                </button>
                {error && <p className="text-red-400 mt-2">{error}</p>}
              </div>
            ) : (
              <>
                <h2 className="text-lg font-medium mb-4">选择探索视角（可多选）</h2>
                <div className="space-y-3">
                  {perspectives.map((p, index) => (
                    <button
                      key={index}
                      onClick={() => togglePerspective(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedIndices.includes(index)
                          ? 'border-fire-spark bg-fire-spark/10'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIndices.includes(index)}
                          onChange={() => togglePerspective(index)}
                          className="mt-1 accent-fire-spark"
                        />
                        <div>
                          <div className="font-medium text-fire-spark">{p.type}</div>
                          <div className="text-sm text-gray-400">{p.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate(-1)} className="flex-1 py-2 border border-gray-600 rounded">
                    取消
                  </button>
                  <button onClick={handleSkipToConfirm} className="flex-1 py-2 border border-gray-600 rounded">
                    跳过，直接创建
                  </button>
                  <button
                    onClick={handleConfirmPerspectives}
                    disabled={selectedIndices.length === 0}
                    className={`flex-1 py-2 rounded ${
                      selectedIndices.length > 0
                        ? 'bg-fire-spark text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    下一步
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {step === 'action' && (
          <section>
            <h2 className="text-lg font-medium mb-4">确认每一步行动</h2>
            <div className="space-y-4">
              {selectedIndices.map((perspectiveIndex, flameIndex) => (
                <div key={flameIndex} className="bg-bg-card rounded-lg p-4">
                  <div className="text-sm text-fire-spark mb-2">
                    {perspectives[perspectiveIndex]?.type}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">烈焰标题</label>
                      <input
                        type="text"
                        value={flameTitles[flameIndex]}
                        onChange={(e) => updateFlameTitle(flameIndex, e.target.value)}
                        className="w-full bg-bg-secondary border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">第一步行动</label>
                      <input
                        type="text"
                        value={actionInputs[perspectiveIndex]?.firstStep || ''}
                        onChange={(e) => updateAction(perspectiveIndex, 'firstStep', e.target.value)}
                        className="w-full bg-bg-secondary border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">探索口令</label>
                      <input
                        type="text"
                        value={actionInputs[perspectiveIndex]?.searchPhrase || ''}
                        onChange={(e) => updateAction(perspectiveIndex, 'searchPhrase', e.target.value)}
                        className="w-full bg-bg-secondary border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep('perspective')} className="flex-1 py-2 border border-gray-600 rounded">
                上一步
              </button>
              <button onClick={handleConfirmActions} className="flex-1 py-2 bg-fire-spark text-white rounded">
                下一步
              </button>
            </div>
          </section>
        )}

        {step === 'confirm' && (
          <section>
            <h2 className="text-lg font-medium mb-4">确认点燃 {selectedIndices.length} 团烈焰</h2>

            <div className="space-y-3 mb-4">
              {selectedIndices.map((perspectiveIndex, flameIndex) => (
                <div key={flameIndex} className="bg-bg-card rounded-lg p-3">
                  <div className="font-medium text-fire-flame">{flameTitles[flameIndex]}</div>
                  <div className="text-sm text-gray-400">
                    探索口令: {actionInputs[perspectiveIndex]?.searchPhrase}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">归入草原（可选）</label>
              <select
                value={selectedPrairieId || ''}
                onChange={(e) => {
                  setSelectedPrairieId(e.target.value || null)
                  setNewPrairieName(null)
                }}
                className="w-full bg-bg-card border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="">不归类（野火）</option>
                {prairies.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {!selectedPrairieId && (
                <input
                  type="text"
                  value={newPrairieName || ''}
                  onChange={(e) => setNewPrairieName(e.target.value || null)}
                  placeholder="或输入新草原名称"
                  className="w-full mt-2 bg-bg-card border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('action')} className="flex-1 py-2 border border-gray-600 rounded">
                上一步
              </button>
              <button
                onClick={handleCreateFlames}
                disabled={loading}
                className="flex-1 py-2 bg-fire-flame text-white rounded disabled:opacity-50"
              >
                {loading ? '创建中...' : '确认点燃'}
              </button>
            </div>
          </section>
        )}
      </main>

      {showPlatformPanel && createdSearchPhrases[0] && (
        <PlatformJumpPanel
          searchPhrase={createdSearchPhrases[0]}
          onClose={handleClosePlatformPanel}
        />
      )}
    </div>
  )
}