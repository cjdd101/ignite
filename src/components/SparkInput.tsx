import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSparkStore } from '@/stores/sparkStore'

interface SparkInputProps {
  onSubmit?: () => void
}

export function SparkInput({ onSubmit }: SparkInputProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addSpark = useSparkStore(state => state.addSpark)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addSpark(content.trim(), 'user')
      setContent('')
      onSubmit?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const charCount = content.length
  const maxChars = 200

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="relative mb-6"
    >
      {/* 外层发光边框 */}
      <div className={`
        relative rounded-2xl p-[1px] transition-all duration-300
        ${isFocused
          ? 'bg-gradient-to-br from-fire-spark/50 via-fire-flame/30 to-fire-ember/50 shadow-glow-spark'
          : 'bg-gradient-to-br from-white/10 via-white/5 to-white/10'
        }
      `}>
        <div className="relative rounded-[15px] bg-bg-secondary overflow-hidden">
          {/* 内部顶部装饰 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fire-spark/20 to-transparent" />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="写下一粒火种，点燃探索的 start..."
            disabled={isSubmitting}
            rows={3}
            className={`
              w-full px-4 py-3 bg-transparent text-text-primary placeholder-text-muted/50
              resize-none outline-none text-base leading-relaxed
              transition-colors duration-200
              ${isSubmitting ? 'opacity-50' : ''}
            `}
          />

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
            {/* 字符计数 */}
            <span className={`text-xs transition-colors duration-200 ${
              charCount > maxChars * 0.9
                ? 'text-fire-wildfire'
                : 'text-text-muted'
            }`}>
              {charCount}/{maxChars}
            </span>

            {/* 提交按钮 */}
            <motion.button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              whileHover={{ scale: content.trim() ? 1.05 : 1 }}
              whileTap={{ scale: content.trim() ? 0.95 : 1 }}
              className={`
                relative px-4 py-1.5 rounded-xl font-medium text-sm
                transition-all duration-200 overflow-hidden
                ${content.trim() && !isSubmitting
                  ? 'bg-gradient-to-r from-fire-flame to-fire-ember text-white shadow-[0_2px_12px_rgba(255,107,53,0.3)]'
                  : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                }
              `}
            >
              {/* 悬停光晕 */}
              {content.trim() && !isSubmitting && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fire-ember to-fire-wildfire opacity-0 hover:opacity-100 transition-opacity duration-200"
                />
              )}

              <span className="relative flex items-center gap-1.5">
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    投入中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    投入火盆
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 聚焦时的装饰光点 */}
      <AnimatePresence>
        {isFocused && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-fire-spark/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-fire-flame/40"
            />
          </>
        )}
      </AnimatePresence>
    </motion.form>
  )
}