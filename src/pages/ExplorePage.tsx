import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { BottomNav } from '@/components/BottomNav'

export function ExplorePage() {
  const navigate = useNavigate()
  const { prairies, fetchPrairies } = usePrairieStore()

  useEffect(() => {
    fetchPrairies()
  }, [])

  const handleExplore = (prairieId: string) => {
    // Navigate to kindle wizard with prairie context
    navigate(`/prairie/${prairieId}/explore`)
  }

  const handleManualCreate = () => {
    // Navigate to kindle wizard without spark context
    navigate('/prairie/flame/create')
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">探索</h1>
        <p className="text-sm text-gray-400">主动探索入口</p>
      </header>

      <main className="p-4">
        {/* Manual Creation */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">🌱 自由探索</h2>
          <button
            onClick={handleManualCreate}
            className="w-full bg-bg-card hover:bg-bg-secondary border border-gray-700 rounded-lg p-4 text-left transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">手动创建</h3>
                <p className="text-sm text-gray-400">从空白开始新的探索</p>
              </div>
              <span className="text-fire-spark">+</span>
            </div>
          </button>
        </section>

        {/* Prairie-based Exploration */}
        <section>
          <h2 className="text-lg font-medium mb-4">🗺️ 草原探索</h2>
          {prairies.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无草原，创建一个开始探索吧</p>
          ) : (
            <div className="space-y-3">
              {prairies.map((prairie) => (
                <button
                  key={prairie.id}
                  onClick={() => handleExplore(prairie.id)}
                  className="w-full bg-bg-card hover:bg-bg-secondary border border-gray-700 rounded-lg p-4 text-left transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-fire-prairie">{prairie.name}</h3>
                      {prairie.description && (
                        <p className="text-sm text-gray-400 mt-1">{prairie.description}</p>
                      )}
                    </div>
                    <span className="text-fire-flame">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}