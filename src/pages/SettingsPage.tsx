import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { db } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'
import { createGitHubIssue } from '@/lib/api'

const GITHUB_REPO = 'cjdd101/ignite'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string

export function SettingsPage() {
  const [sparkCount, setSparkCount] = useState(0)
  const [flameCount, setFlameCount] = useState(0)
  const [prairieCount, setPrairieCount] = useState(0)
  const [isClearing, setIsClearing] = useState(false)

  // 问题反馈表单状态
  const [feedbackTitle, setFeedbackTitle] = useState('')
  const [feedbackDesc, setFeedbackDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const sparks = await db.sparks.filter(s => !s.isDeleted).count()
    const flames = await db.flames.filter(f => !f.isDeleted).count()
    const prairies = await db.prairies.count()
    setSparkCount(sparks)
    setFlameCount(flames)
    setPrairieCount(prairies)
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackTitle.trim() || !feedbackDesc.trim()) {
      setSubmitResult({ success: false, message: '请填写标题和描述' })
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      const result = await createGitHubIssue(GITHUB_REPO, GITHUB_TOKEN, {
        title: `[用户反馈] ${feedbackTitle}`,
        body: `## 问题描述\n${feedbackDesc}\n\n---\n*提交时间: ${timestamp}*\n*来源: 点燃 App 设置页反馈表单*`,
        labels: ['bug', 'user-feedback'],
      })
      setSubmitResult({
        success: true,
        message: `问题已提交！Issue #${result.number}`,
      })
      setFeedbackTitle('')
      setFeedbackDesc('')
      setShowFeedbackForm(false)
    } catch (err) {
      setSubmitResult({
        success: false,
        message: `提交失败: ${err instanceof Error ? err.message : '未知错误'}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = async () => {
    const data = {
      sparks: await db.sparks.toArray(),
      flames: await db.flames.toArray(),
      prairies: await db.prairies.toArray(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `点燃备份_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return

    setIsClearing(true)
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
    await db.seedBuffer.clear()
    await loadStats()
    setIsClearing(false)
  }

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-text-muted/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header text-center"
        >
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              ⚙️
            </motion.div>
          </div>

          <h1 className="page-title">设置</h1>
          <p className="page-subtitle">管理你的数据与偏好</p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto pb-8">
          {/* 数据统计 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
              📊 数据统计
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-fire-spark">{sparkCount}</div>
                <div className="text-xs text-text-muted mt-1">火种</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-fire-flame">{flameCount}</div>
                <div className="text-xs text-text-muted mt-1">烈焰</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-prairie-primary">{prairieCount}</div>
                <div className="text-xs text-text-muted mt-1">草原</div>
              </div>
            </div>
          </motion.section>

          {/* 数据管理 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
              💾 数据管理
            </h2>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-prairie-primary/20 to-prairie-dark/10 border border-prairie-primary/30 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-prairie-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-prairie-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">导出数据</p>
                    <p className="text-xs text-text-muted">下载 JSON 格式备份</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-prairie-primary/60 group-hover:text-prairie-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearData}
                disabled={isClearing}
                className="w-full p-4 rounded-xl bg-bg-card border border-red-500/20 flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">清空数据</p>
                    <p className="text-xs text-text-muted">不可逆操作，谨慎使用</p>
                  </div>
                </div>
                <span className="text-sm text-red-400/60 group-hover:text-red-400 transition-colors">
                  {isClearing ? '清空中...' : '→'}
                </span>
              </motion.button>
            </div>
          </motion.section>

          {/* 问题反馈 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
              🐛 问题反馈
            </h2>

            {!showFeedbackForm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFeedbackForm(true)}
                className="w-full p-4 rounded-xl bg-bg-card border border-fire-flame/20 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fire-flame/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-fire-flame" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">提交问题</p>
                    <p className="text-xs text-text-muted">发现 Bug？告诉我们</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-fire-flame/60 group-hover:text-fire-flame transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="card p-5"
              >
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      问题标题
                    </label>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="简要描述问题"
                      className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-fire-flame/50"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      问题描述
                    </label>
                    <textarea
                      value={feedbackDesc}
                      onChange={(e) => setFeedbackDesc(e.target.value)}
                      placeholder="详细描述你遇到的问题..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-fire-flame/50 resize-none"
                    />
                  </div>
                  {submitResult && (
                    <div className={`p-3 rounded-lg text-sm ${submitResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {submitResult.message}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedbackForm(false)
                        setSubmitResult(null)
                        setFeedbackTitle('')
                        setFeedbackDesc('')
                      }}
                      className="flex-1 py-3 rounded-lg bg-white/5 text-text-secondary hover:bg-white/10 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-lg bg-fire-flame text-white font-medium hover:bg-fire-ember transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? '提交中...' : '提交'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.section>

          {/* 关于 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 px-2">
              ℹ️ 关于
            </h2>

            <div className="card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fire-flame to-fire-ember flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">点燃</h3>
                  <p className="text-sm text-text-muted">v0.1.0</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                一个个人探索工具，帮助你记录灵感、整理思绪、形成叙事脉络。
                存一粒火种，燃一团烈焰，蔓一片草原。
              </p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-text-muted">
                  设计哲学：野草式生长，野火式蔓延
                </p>
              </div>
            </div>
          </motion.section>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}