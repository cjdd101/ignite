import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { db } from '@/lib/db'
import { PlatformJumpPanel } from '@/components/PlatformJumpPanel'
import { BottomNav } from '@/components/BottomNav'
import type { Flame } from '@/types'

export function FlameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [showPlatformPanel, setShowPlatformPanel] = useState(false)

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(f => setFlame(f || null))
    }
  }, [id])

  if (!flame) {
    return (
      <div className="page flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🔥</div>
          <p className="text-text-muted">烈焰不存在</p>
        </motion.div>
      </div>
    )
  }

  const handleComplete = () => {
    navigate(`/prairie/flame/${id}/complete`)
  }

  const handleJump = () => {
    if (flame.searchPhrase) {
      navigator.clipboard.writeText(flame.searchPhrase)
      setShowPlatformPanel(true)
    }
  }

  const handleClosePanel = () => {
    setShowPlatformPanel(false)
  }

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-fire-flame/5 blur-[100px]" />
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
            <h1 className="text-2xl font-display font-bold text-text-primary">烈焰详情</h1>
          </div>
          <p className="text-sm text-text-muted">探索进度</p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto">
          {/* 烈焰信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-flame p-4 mb-4"
          >
            <h2 className="text-xl font-display font-bold text-text-primary mb-2">{flame.title}</h2>
            {flame.description && (
              <p className="text-text-secondary mb-2">{flame.description}</p>
            )}
            {flame.recommendationReason && (
              <p className="text-sm text-text-muted mt-2">{flame.recommendationReason}</p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                flame.status === 'burning'
                  ? 'bg-fire-flame/20 text-fire-flame'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {flame.status === 'burning' ? '燃烧中' : '已燃尽'}
              </span>
              {flame.rekindleCount > 0 && (
                <span className="text-sm text-text-muted">
                  已取火 {flame.rekindleCount} 次
                </span>
              )}
            </div>
          </motion.div>

          {/* 操作按钮 */}
          {flame.status === 'burning' && (
            <div className="space-y-3">
              {flame.searchPhrase && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJump}
                  className="w-full py-3 bg-bg-elevated border border-white/10 rounded-xl text-text-primary font-medium hover:bg-white/5 transition-colors"
                >
                  跳转平台
                </motion.button>
              )}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-fire-flame to-fire-wildfire text-white rounded-xl font-medium"
              >
                完成燃烧
              </motion.button>
            </div>
          )}

          {/* 取火按钮 */}
          {flame.status === 'burned' && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/prairie/${flame.id}/rekindle`)}
              className="w-full py-3 bg-gradient-to-r from-fire-spark to-fire-ember text-white rounded-xl font-medium"
            >
              取火
            </motion.button>
          )}
        </main>
      </div>

      <BottomNav />

      {showPlatformPanel && flame.searchPhrase && (
        <PlatformJumpPanel
          searchPhrase={flame.searchPhrase}
          onClose={handleClosePanel}
        />
      )}
    </div>
  )
}