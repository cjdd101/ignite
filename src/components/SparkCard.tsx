import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { Spark } from '@/types'

interface SparkCardProps {
  spark: Spark
}

export function SparkCard({ spark }: SparkCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/hearth/kindle/${spark.id}`)
  }

  const sourceLabel = {
    user: '手写',
    ai_rekindle: '取火',
    ai_seed: '种子',
    ai_explore: '探索',
  }[spark.sourceType] || '火种'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="card card-spark group cursor-pointer p-4"
      onClick={handleClick}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-fire-spark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* 内容 */}
        <p className="text-text-primary leading-relaxed group-hover:text-fire-spark/90 transition-colors duration-200">
          {spark.content}
        </p>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            {/* 来源标签 */}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-fire-spark/10 text-fire-spark/80 border border-fire-spark/20">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {sourceLabel}
            </span>
            {/* 来源火种追溯 */}
            {spark.sourceFlameId && (
              <span className="text-xs text-text-muted">来自烈焰</span>
            )}
          </div>

          {/* 点燃提示 */}
          <span className="text-xs text-fire-spark/0 group-hover:text-fire-spark/60 transition-all duration-200 flex items-center gap-1">
            点燃
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </span>
        </div>
      </div>

      {/* 悬停时的光晕效果 */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fire-spark/5 to-transparent rounded-2xl" />
      </div>
    </motion.div>
  )
}