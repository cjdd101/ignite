import { motion } from 'motion/react'
import { openPlatformSearch } from '@/lib/platforms'

interface PlatformJumpPanelProps {
  searchPhrase: string
  onClose: () => void
}

const PLATFORMS = ['B站', '知乎', '小红书', 'YouTube', 'Apple 播客', 'Google']

export function PlatformJumpPanel({ searchPhrase, onClose }: PlatformJumpPanelProps) {
  const handleJump = (platform: string) => {
    openPlatformSearch(platform, searchPhrase)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-primary rounded-t-3xl w-full max-w-lg p-5 border-t border-white/5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-display font-semibold text-text-primary">跳转到平台继续探索</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-elevated text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          探索口令: <span className="text-fire-spark font-medium">{searchPhrase}</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => (
            <motion.button
              key={platform}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleJump(platform)}
              className="py-3 px-2 bg-bg-elevated rounded-xl text-text-secondary text-sm hover:bg-bg-card hover:text-text-primary transition-all border border-white/5"
            >
              {platform}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}