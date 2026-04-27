import { useEffect, useState } from 'react'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { FlameCard } from '@/components/FlameCard'
import { BottomNav } from '@/components/BottomNav'
import { useNavigate } from 'react-router-dom'

export function PrairiePage() {
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, archivedPrairies, fetchPrairies, fetchArchivedPrairies, archivePrairie } = usePrairieStore()
  const [showArchived, setShowArchived] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
    fetchArchivedPrairies()
  }, [])

  const handleCreateFlame = () => {
    navigate('/prairie/flame/create')
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-prairie">草原</h1>
        <p className="text-sm text-gray-400">烈焰脉络</p>
      </header>

      <main className="p-4">
        {/* 野火区 */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">🌿 野火</h2>
            <button
              onClick={handleCreateFlame}
              className="bg-fire-flame text-white px-3 py-1 rounded text-sm"
            >
              + 创建烈焰
            </button>
          </div>

          <div className="space-y-3">
            {wildFlames.map((flame) => (
              <FlameCard key={flame.id} flame={flame} />
            ))}
          </div>

          {wildFlames.length === 0 && (
            <p className="text-gray-500 text-sm">暂无野火</p>
          )}
        </section>

        {/* 草原列表 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">我的草原</h2>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-sm text-gray-400 hover:underline"
            >
              {showArchived ? '收起' : '查看存档'}
            </button>
          </div>

          <div className="space-y-3">
            {prairies.map((prairie) => (
              <div key={prairie.id} className="bg-bg-secondary rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-fire-prairie">{prairie.name}</h3>
                  <button
                    onClick={() => archivePrairie(prairie.id)}
                    className="text-sm text-gray-500 hover:text-orange-400"
                  >
                    存档
                  </button>
                </div>
                {prairie.description && (
                  <p className="text-sm text-gray-400 mt-1">{prairie.description}</p>
                )}
              </div>
            ))}
          </div>

          {showArchived && archivedPrairies.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm text-gray-500 mb-3">已存档</h3>
              {archivedPrairies.map((prairie) => (
                <div key={prairie.id} className="bg-bg-card rounded-lg p-4 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{prairie.name}</span>
                    <button
                      onClick={() => usePrairieStore.getState().restorePrairie(prairie.id)}
                      className="text-sm text-fire-prairie hover:underline"
                    >
                      恢复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}