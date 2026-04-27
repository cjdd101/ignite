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
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-bg-card rounded-t-2xl w-full max-w-lg p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">跳转到平台继续探索</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          探索口令: <span className="text-fire-spark">{searchPhrase}</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              onClick={() => handleJump(platform)}
              className="py-3 bg-bg-secondary rounded-lg text-center hover:bg-gray-700 transition-colors"
            >
              {platform}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}