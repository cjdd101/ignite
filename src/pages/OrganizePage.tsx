import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { BottomNav } from '@/components/BottomNav'

export function OrganizePage() {
  const navigate = useNavigate()
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()
  const [isOrganizing, setIsOrganizing] = useState(false)

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
  }, [])

  const handleStartOrganize = () => {
    if (wildFlames.length > 0) {
      setIsOrganizing(true)
    }
  }

  const handleAssignToPrairie = async (prairieId: string) => {
    // Assign all wild flames to the selected prairie
    for (const flame of wildFlames) {
      await db.flames.update(flame.id, { prairieId })
    }
    await fetchWildFlames()
    setIsOrganizing(false)
  }

  const handleCancel = () => {
    setIsOrganizing(false)
  }

  if (isOrganizing) {
    return (
      <div className="min-h-screen pb-20">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
          <p className="text-sm text-gray-400">为野火选择草原</p>
        </header>

        <main className="p-4">
          <section>
            <h2 className="text-lg font-medium mb-4">选择目标草原</h2>
            <div className="space-y-3">
              {prairies.map((prairie) => (
                <button
                  key={prairie.id}
                  onClick={() => handleAssignToPrairie(prairie.id)}
                  className="w-full bg-bg-card hover:bg-bg-secondary border border-gray-700 rounded-lg p-4 text-left transition-colors"
                >
                  <h3 className="font-medium text-fire-prairie">{prairie.name}</h3>
                  {prairie.description && (
                    <p className="text-sm text-gray-400 mt-1">{prairie.description}</p>
                  )}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-6">
            <button
              onClick={handleCancel}
              className="w-full py-2 border border-gray-600 rounded"
            >
              取消
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
        <p className="text-sm text-gray-400">整理散落的探索</p>
      </header>

      <main className="p-4">
        {wildFlames.length > 0 ? (
          <section>
            <div className="bg-bg-card rounded-lg p-6 text-center">
              <p className="text-3xl mb-2">🌿</p>
              <p className="text-xl font-medium text-white">{wildFlames.length} 朵野火待整理</p>
              <p className="text-sm text-gray-400 mt-2">
                将这些散落的探索分配到草原，形成叙事脉络
              </p>
            </div>

            <button
              onClick={handleStartOrganize}
              className="w-full mt-6 bg-fire-prairie text-white py-3 rounded-lg font-medium"
            >
              开始整理
            </button>
          </section>
        ) : (
          <section className="text-center py-12">
            <p className="text-3xl mb-4">🌿</p>
            <p className="text-gray-400">暂无野火需要整理</p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}