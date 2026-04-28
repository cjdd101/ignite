import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { FlameCard } from '@/components/FlameCard'
import { BottomNav } from '@/components/BottomNav'

export function PrairieDetailPage() {
  const { prairieId } = useParams<{ prairieId: string }>()
  const navigate = useNavigate()
  const { flames, fetchFlamesByPrairie } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()
  const [loading, setLoading] = useState(true)

  const prairie = prairies.find(p => p.id === prairieId)

  useEffect(() => {
    if (prairieId) {
      setLoading(true)
      Promise.all([
        fetchFlamesByPrairie(prairieId),
        fetchPrairies(),
      ]).finally(() => setLoading(false))
    }
  }, [prairieId, fetchFlamesByPrairie, fetchPrairies])

  const handleCreateFlame = () => {
    navigate(`/prairie/${prairieId}/flame/create`)
  }

  if (!prairie) {
    return (
      <div className="page">
        <main className="p-4 text-center">
          <p className="text-text-muted">草原不存在</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-prairie-primary/5 blur-[120px]" />
        <div className="absolute bottom-40 left-1/4 w-56 h-56 rounded-full bg-fire-flame/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header text-center"
        >
          <button
            onClick={() => navigate('/prairie')}
            className="absolute left-4 top-6 text-text-muted hover:text-text-secondary"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🏕️
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-prairie-primary/20 via-transparent to-fire-flame/20 blur-xl rounded-full" />
          </div>

          <h1 className="page-title">{prairie.name}</h1>
          {prairie.description && (
            <p className="page-subtitle">{prairie.description}</p>
          )}
        </motion.header>

        <main className="px-4 max-w-lg mx-auto pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="prairie-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* 创建按钮 */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleCreateFlame}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-fire-flame/20 to-fire-wildfire/10 border border-fire-flame/20 text-left group hover:border-fire-flame/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-medium text-text-primary group-hover:text-fire-spark transition-colors">创建新烈焰</p>
                      <p className="text-xs text-text-muted mt-0.5">在草原中开始新的探索</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-fire-flame/60 group-hover:text-fire-flame transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </motion.button>

              {/* 烈焰列表 */}
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-text-muted">加载中...</p>
                </div>
              ) : flames.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-4xl mb-4">🔥</div>
                  <p className="text-text-muted">草原里还没有烈焰</p>
                  <p className="text-sm text-text-muted/60 mt-1">创建第一团烈焰开始探索</p>
                </motion.div>
              ) : (
                <div className="space-y-4 animate-stagger">
                  {flames.map((flame) => (
                    <FlameCard key={flame.id} flame={flame} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}