import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { PlatformJumpPanel } from '@/components/PlatformJumpPanel'
import { BottomNav } from '@/components/BottomNav'
import type { Flame } from '@/types'

export function FlameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [showPlatformPanel, setShowPlatformPanel] = useState(false)

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(setFlame)
    }
  }, [id])

  if (!flame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  const handleComplete = () => {
    navigate(`/prairie/flame/${id}/complete`)
  }

  const handleJump = () => {
    if (flame.searchPhrase) {
      navigator.clipboard.writeText(flame.searchPhrase)
      setShowPlatformPanel(true)
    }
  }

  const handleClosePanel = () => {
    setShowPlatformPanel(false)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">烈焰详情</h1>
      </header>

      <main className="p-4">
        <div className="bg-bg-card rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold text-white mb-2">{flame.title}</h2>
          {flame.description && (
            <p className="text-gray-400 mb-2">{flame.description}</p>
          )}
          {flame.recommendationReason && (
            <p className="text-sm text-gray-500 mt-2">{flame.recommendationReason}</p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-sm ${
              flame.status === 'burning'
                ? 'bg-fire-flame/20 text-fire-flame'
                : 'bg-gray-700 text-gray-400'
            }`}>
              {flame.status === 'burning' ? '燃烧中' : '已燃尽'}
            </span>
            {flame.rekindleCount > 0 && (
              <span className="text-sm text-gray-500">
                已取火 {flame.rekindleCount} 次
              </span>
            )}
          </div>
        </div>

        {flame.status === 'burning' && (
          <div className="space-y-3">
            {flame.searchPhrase && (
              <button
                onClick={handleJump}
                className="w-full py-3 bg-fire-spark text-white rounded-lg font-medium"
              >
                跳转平台
              </button>
            )}
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-fire-flame text-white rounded-lg font-medium"
            >
              完成燃烧
            </button>
          </div>
        )}
      </main>

      <BottomNav />

      {showPlatformPanel && flame.searchPhrase && (
        <PlatformJumpPanel
          searchPhrase={flame.searchPhrase}
          onClose={handleClosePanel}
        />
      )}
    </div>
  )
}