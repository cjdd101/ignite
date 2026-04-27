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
    <div className="bg-bg-card rounded-lg p-4 mb-3">
      <p className="text-white mb-4">{content}</p>
      <div className="flex gap-3">
        <button
          onClick={onDiscard}
          className="flex-1 py-2 border border-gray-600 rounded text-gray-400 hover:border-red-500 hover:text-red-400"
        >
          丢弃
        </button>
        <button
          onClick={onRetain}
          className="flex-1 py-2 bg-fire-spark text-white rounded"
        >
          保留
        </button>
      </div>
    </div>
  )
}