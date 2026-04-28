import { motion } from 'framer-motion'

interface RekindleSparkCardProps {
  content: string
  onRetain: () => void
  onDiscard: () => void
  retained: boolean
  discarded: boolean
}

export function RekindleSparkCard({
  content,
  onRetain,
  onDiscard,
  retained,
  discarded,
}: RekindleSparkCardProps) {
  if (retained || discarded) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card p-4 mb-3"
    >
      <p className="text-text-primary mb-4 leading-relaxed">{content}</p>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDiscard}
          className="flex-1 py-2.5 border border-white/10 rounded-xl text-text-secondary hover:border-red-500/50 hover:text-red-400 transition-colors"
        >
          丢弃
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetain}
          className="flex-1 py-2.5 bg-gradient-to-r from-fire-spark to-fire-ember text-text-inverse rounded-xl font-medium"
        >
          保留
        </motion.button>
      </div>
    </motion.div>
  )
}