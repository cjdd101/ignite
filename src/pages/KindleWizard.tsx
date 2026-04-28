import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { db, generateId } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { api } from '@/lib/api'
import { PerspectiveCard } from '@/components/PerspectiveCard'
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
}

export function KindleWizard({ sparkId }: KindleWizardProps) {
  const navigate = useNavigate()
  const { addFlame } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()

  const [spark, setSpark] = useState<Spark | null>(null)
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
  const [selectedPrairieId, setSelectedPrairieId] = useState<string | null>(null)
  const [newPrairieName, setNewPrairieName] = useState<string | null>(null)

  useEffect(() => {
    loadSpark()
    fetchPrairies()
  }, [sparkId])

  const loadSpark = async () => {
    if (!sparkId) return
    const s = await db.sparks.get(sparkId)
    setSpark(s || null)
  }

  const handleLoadPerspectives = async () => {
    if (!spark) return
    setLoading(true)
    setError(null)

    try {
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.ignite({
        sparkContent: spark.content,
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
        { type: '阅读', description: '通过书籍深入了解', firstStep: '搜索相关书籍', searchPhrase: spark.content },
        { type: '观看', description: '通过视频直观学习', firstStep: '搜索相关视频', searchPhrase: spark.content },
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
    if (!spark) return

    setLoading(true)
    const igniteBatchId = generateId()
    const createdFlames: { id: string; title: string; searchPhrase: string }[] = []

    let targetPrairieId = selectedPrairieId
    if (newPrairieName && !selectedPrairieId) {
      const newPrairie = await db.prairies.add({
        id: generateId(),
        name: newPrairieName,
        status: 'active',
        createdAt: Date.now(),
      })
      targetPrairieId = newPrairie.id
    }

    for (const index of selectedIndices) {
      const flame = await db.flames.add({
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
      createdFlames.push({
        id: flame.id,
        title: flameTitles[index],
        searchPhrase: actionInputs[index]?.searchPhrase || perspectives[index]?.searchPhrase || ''
      })
    }

    // 保存创建的火焰信息，用于跳转后提示
    sessionStorage.setItem('justCreatedFlames', JSON.stringify(createdFlames))

    setLoading(false)

    // 直接导航到草原页，不弹窗
    navigate('/prairie')
  }

  const stepLabels: Record<Step, string> = {
    perspective: '选择探索视角',
    action: '确认行动',
    confirm: '确认点燃',
  }

  if (!spark) {
    return (
      <div className="page flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🔥</div>
          <p className="text-text-muted">火种不存在</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* 背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-fire-spark/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl font-display font-bold text-text-primary">点燃向导</h1>
          </div>
          <p className="text-sm text-text-muted">{stepLabels[step]}</p>
        </motion.header>

        {/* 步骤指示器 */}
        <div className="px-4 max-w-lg mx-auto mb-6">
          <div className="flex gap-2">
            {(['perspective', 'action', 'confirm'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step === s ? 'bg-fire-spark' : i < ['perspective', 'action', 'confirm'].indexOf(step) ? 'bg-fire-spark/50' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 火种内容 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 max-w-lg mx-auto mb-6"
        >
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">火种内容</p>
          <div className="card card-spark p-4">
            <p className="text-text-primary leading-relaxed">{spark.content}</p>
          </div>
        </motion.div>

        <main className="px-4 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Perspective */}
            {step === 'perspective' && (
              <motion.div
                key="perspective"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {perspectives.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-fire-spark/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💡</span>
                    </div>
                    <p className="text-text-secondary mb-6">点击按钮获取 AI 生成的探索视角建议</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLoadPerspectives}
                      disabled={loading}
                      className="btn btn-primary mx-auto"
                    >
                      {loading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          加载中...
                        </>
                      ) : '获取探索视角'}
                    </motion.button>
                    {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                  </div>
                ) : (
                  <>
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">选择探索视角（可多选）</h2>
                    <div className="space-y-3">
                      {perspectives.map((p, index) => (
                        <PerspectiveCard
                          key={index}
                          type={p.type}
                          description={p.description}
                          firstStep={p.firstStep}
                          searchPhrase={p.searchPhrase}
                          selected={selectedIndices.includes(index)}
                          onSelect={() => togglePerspective(index)}
                        />
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                      >
                        取消
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSkipToConfirm}
                        className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                      >
                        跳过
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPerspectives}
                        disabled={selectedIndices.length === 0}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          selectedIndices.length > 0
                            ? 'bg-gradient-to-r from-fire-spark to-fire-ember text-white'
                            : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                        }`}
                      >
                        下一步
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 2: Action */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">确认每一步行动</h2>
                <div className="space-y-4">
                  {selectedIndices.map((perspectiveIndex, flameIndex) => (
                    <div key={flameIndex} className="card p-4">
                      <div className="text-sm text-fire-spark font-medium mb-3">
                        {perspectives[perspectiveIndex]?.type}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-text-muted mb-1.5">烈焰标题</label>
                          <input
                            type="text"
                            value={flameTitles[flameIndex]}
                            onChange={(e) => updateFlameTitle(flameIndex, e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1.5">第一步行动</label>
                          <input
                            type="text"
                            value={actionInputs[perspectiveIndex]?.firstStep || ''}
                            onChange={(e) => updateAction(perspectiveIndex, 'firstStep', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1.5">探索口令</label>
                          <input
                            type="text"
                            value={actionInputs[perspectiveIndex]?.searchPhrase || ''}
                            onChange={(e) => updateAction(perspectiveIndex, 'searchPhrase', e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('perspective')}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmActions}
                    className="flex-1 py-3 bg-gradient-to-r from-fire-spark to-fire-ember rounded-xl text-white font-medium"
                  >
                    下一步
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                  确认点燃 {selectedIndices.length} 团烈焰
                </h2>

                <div className="space-y-3 mb-6">
                  {selectedIndices.map((perspectiveIndex, flameIndex) => (
                    <div key={flameIndex} className="card card-flame p-4">
                      <div className="font-medium text-text-primary">{flameTitles[flameIndex]}</div>
                      <div className="text-sm text-text-muted mt-1">
                        探索口令: {actionInputs[perspectiveIndex]?.searchPhrase}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs text-text-muted mb-2">归入草原（可选）</label>
                  <select
                    value={selectedPrairieId || ''}
                    onChange={(e) => {
                      setSelectedPrairieId(e.target.value || null)
                      setNewPrairieName(null)
                    }}
                    className="input"
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
                      className="input mt-2"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('action')}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateFlames}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-fire-flame to-fire-wildfire rounded-xl text-white font-medium disabled:opacity-50"
                  >
                    {loading ? '创建中...' : '确认点燃'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}