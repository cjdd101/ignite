import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { BottomNav } from '@/components/BottomNav'

export function OrganizePage() {
  const navigate = useNavigate()
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()
  const [isOrganizing, setIsOrganizing] = useState(false)

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
  }, [])

  const handleStartOrganize = () => {
    if (wildFlames.length > 0) {
      setIsOrganizing(true)
    }
  }

  const handleAssignToPrairie = async (prairieId: string) => {
    for (const flame of wildFlames) {
      await db.flames.update(flame.id, { prairieId })
    }
    await fetchWildFlames()
    setIsOrganizing(false)
  }

  const handleCancel = () => {
    setIsOrganizing(false)
  }

  if (isOrganizing) {
    return (
      <div className="page">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-prairie-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-header"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌿</span>
              <h1 className="text-2xl font-display font-bold text-text-primary">整理</h1>
            </div>
            <p className="text-sm text-text-muted">为野火选择草原</p>
          </motion.header>

          <main className="px-4 max-w-lg mx-auto pb-8">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">选择目标草原</h2>
            <div className="space-y-3">
              {prairies.map((prairie) => (
                <motion.button
                  key={prairie.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAssignToPrairie(prairie.id)}
                  className="w-full card card-prairie p-4 text-left"
                >
                  <h3 className="font-medium text-prairie-light">{prairie.name}</h3>
                  {prairie.description && (
                    <p className="text-sm text-text-muted mt-1">{prairie.description}</p>
                  )}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="w-full mt-6 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
            >
              取消
            </motion.button>
          </main>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-prairie-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-display font-bold text-text-primary">整理</h1>
          </div>
          <p className="text-sm text-text-muted">整理散落的探索</p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto pb-8">
          {wildFlames.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-prairie-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <p className="text-xl font-display font-semibold text-text-primary">{wildFlames.length} 朵野火待整理</p>
              <p className="text-sm text-text-secondary mt-2">
                将这些散落的探索分配到草原，形成叙事脉络
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartOrganize}
                className="w-full mt-6 py-3 bg-gradient-to-r from-prairie-primary to-prairie-dark rounded-xl text-white font-medium"
              >
                开始整理
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <p className="text-text-muted">暂无野火需要整理</p>
              <p className="text-sm text-text-muted/60 mt-1">去火盆点燃一些火种吧</p>
            </motion.div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}