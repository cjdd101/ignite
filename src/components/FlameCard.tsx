import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { Flame } from '@/types'
import { useFlameStore } from '@/stores/flameStore'

interface FlameCardProps {
  flame: Flame
  onDelete?: (id: string) => void
}

export function FlameCard({ flame, onDelete }: FlameCardProps) {
  const navigate = useNavigate()
  const { deleteFlame } = useFlameStore()

  const isBurning = flame.status === 'burning'

  const handleClick = () => {
    navigate(`/prairie/flame/${flame.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(flame.id)
    } else {
      await deleteFlame(flame.id)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="card card-flame group cursor-pointer p-5 relative overflow-hidden"
      onClick={handleClick}
    >
      {/* 燃烧中动画背景 */}
      {isBurning && (
        <div className="absolute inset-0 bg-gradient-to-br from-fire-flame/5 via-transparent to-fire-wildfire/5 rounded-2xl animate-flame-flicker" />
      )}

      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-fire-flame/50 to-transparent" />

      <div className="relative">
        {/* 标题行 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-fire-flame transition-colors duration-200">
              {flame.title}
            </h3>
            {flame.description && (
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {flame.description}
              </p>
            )}
          </div>

          {/* 状态标签 */}
          {isBurning ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fire-flame/15 border border-fire-flame/30 shrink-0">
              <span className="w-2 h-2 rounded-full bg-fire-flame animate-pulse" />
              <span className="text-xs font-medium text-fire-flame">燃烧中</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-text-muted/10 border border-text-muted/20 shrink-0">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              <span className="text-xs text-text-muted">已燃尽</span>
            </div>
          )}
        </div>

        {/* 推荐理由 */}
        {flame.recommendationReason && (
          <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/5">
            <p className="text-xs text-text-secondary leading-relaxed">
              {flame.recommendationReason}
            </p>
          </div>
        )}

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* 创建时间 */}
            <span className="text-xs text-text-muted">
              {new Date(flame.createdAt).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>

            {/* 取火次数 */}
            {flame.rekindleCount > 0 && (
              <span className="text-xs text-fire-spark/70 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                已取火 {flame.rekindleCount} 次
              </span>
            )}
          </div>

          {/* 操作按钮 */}
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200"
            aria-label="删除"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* 悬停光晕 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fire-flame/8 via-transparent to-fire-wildfire/8 rounded-2xl" />
      </div>
    </motion.div>
  )
}