import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { FlameCard } from '@/components/FlameCard'
import { BottomNav } from '@/components/BottomNav'
import { useNavigate } from 'react-router-dom'

export function PrairiePage() {
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, archivedPrairies, fetchPrairies, fetchArchivedPrairies } = usePrairieStore()
  const [showArchived, setShowArchived] = useState(false)
  const [activeTab, setActiveTab] = useState<'wild' | 'prairies'>('wild')
  const [justCreatedFlames, setJustCreatedFlames] = useState<{ title: string; searchPhrase: string }[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
    fetchArchivedPrairies()

    // 检查是否有刚创建的火焰
    const stored = sessionStorage.getItem('justCreatedFlames')
    if (stored) {
      try {
        setJustCreatedFlames(JSON.parse(stored))
        sessionStorage.removeItem('justCreatedFlames')
        // 3秒后自动清除提示
        setTimeout(() => setJustCreatedFlames(null), 3000)
      } catch {
        sessionStorage.removeItem('justCreatedFlames')
      }
    }
  }, [])

  const handleCreateFlame = () => {
    navigate('/prairie/flame/create')
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
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🌿
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-prairie-primary/20 via-transparent to-fire-flame/20 blur-xl rounded-full" />
          </div>

          <h1 className="page-title">草原</h1>
          <p className="page-subtitle">探索的脉络，烈焰的归属</p>
        </motion.header>

        {/* Tab 切换 */}
        <div className="px-4 max-w-lg mx-auto mb-6">
          <div className="flex gap-2 p-1 bg-bg-secondary/50 backdrop-blur-sm rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('wild')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === 'wild'
                  ? 'bg-bg-elevated text-fire-flame shadow-lg'
                  : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              🌿 野火 ({wildFlames.length})
            </button>
            <button
              onClick={() => setActiveTab('prairies')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === 'prairies'
                  ? 'bg-bg-elevated text-prairie-primary shadow-lg'
                  : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              🏕️ 我的草原 ({prairies.length})
            </button>
          </div>
        </div>

        {/* 创建成功提示 */}
        <AnimatePresence>
          {justCreatedFlames && justCreatedFlames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 max-w-lg mx-auto mb-4"
            >
              <div className="card card-flame p-4 border border-fire-spark/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fire-spark">成功创建 {justCreatedFlames.length} 团烈焰</p>
                    <div className="mt-2 space-y-1">
                      {justCreatedFlames.slice(0, 3).map((flame, i) => (
                        <p key={i} className="text-xs text-text-secondary">
                          {flame.title}
                        </p>
                      ))}
                      {justCreatedFlames.length > 3 && (
                        <p className="text-xs text-text-muted">还有 {justCreatedFlames.length - 3} 团...</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setJustCreatedFlames(null)}
                    className="text-text-muted hover:text-text-secondary"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="px-4 max-w-lg mx-auto pb-8">
          <AnimatePresence mode="wait">
            {/* 野火视图 */}
            {activeTab === 'wild' && (
              <motion.div
                key="wild"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
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
                        <p className="text-xs text-text-muted mt-0.5">从零开始一个探索</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-fire-flame/60 group-hover:text-fire-flame transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </div>
                </motion.button>

                {/* 野火列表 */}
                {wildFlames.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-4xl mb-4">🔥</div>
                    <p className="text-text-muted">还没有野火</p>
                    <p className="text-sm text-text-muted/60 mt-1">点燃火盆中的火种，或创建新的烈焰</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 animate-stagger">
                    {wildFlames.map((flame) => (
                      <FlameCard key={flame.id} flame={flame} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 草原视图 */}
            {activeTab === 'prairies' && (
              <motion.div
                key="prairies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {prairies.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-4xl mb-4">🏕️</div>
                    <p className="text-text-muted">还没有草原</p>
                    <p className="text-sm text-text-muted/60 mt-1">整理野火时，可以创建新的草原</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 animate-stagger">
                    {prairies.map((prairie) => (
                      <motion.div
                        key={prairie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card card-prairie p-5 group cursor-pointer"
                        onClick={() => navigate(`/prairie/${prairie.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-semibold text-prairie-light group-hover:text-prairie-primary transition-colors">
                              {prairie.name}
                            </h3>
                            {prairie.description && (
                              <p className="text-sm text-text-muted mt-1">{prairie.description}</p>
                            )}
                          </div>
                          <svg className="w-5 h-5 text-text-muted group-hover:text-prairie-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 存档区 */}
                {archivedPrairies.length > 0 && (
                  <div className="mt-8">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-2"
                    >
                      <svg className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                      </svg>
                      已存档 ({archivedPrairies.length})
                    </button>

                    <AnimatePresence>
                      {showArchived && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-3 overflow-hidden"
                        >
                          {archivedPrairies.map((prairie) => (
                            <div key={prairie.id} className="p-4 rounded-xl bg-bg-secondary/50 border border-white/5 flex items-center justify-between">
                              <span className="text-text-muted">{prairie.name}</span>
                              <button
                                onClick={() => usePrairieStore.getState().restorePrairie(prairie.id)}
                                className="text-xs text-prairie-primary hover:underline"
                              >
                                恢复
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}