import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { db } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'

export function SettingsPage() {
  const [sparkCount, setSparkCount] = useState(0)
  const [flameCount, setFlameCount] = useState(0)
  const [prairieCount, setPrairieCount] = useState(0)
  const [isClearing, setIsClearing] = useState(false)

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
                  设计哲学：野草式生长 · 火种为货币 · 建议而非指派
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