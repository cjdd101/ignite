import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'

export function SettingsPage() {
  const [sparkCount, setSparkCount] = useState(0)
  const [flameCount, setFlameCount] = useState(0)
  const [prairieCount, setPrairieCount] = useState(0)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const sparks = await db.sparks.filter(s => !s.isDeleted).count()
    const flames = await db.flames.filter(f => !f.isDeleted).count()
    const prairies = await db.prairies.count()
    setSparkCount(sparks)
    setFlameCount(flames)
    setPrairieCount(prairies)
  }

  const handleExport = async () => {
    const data = {
      sparks: await db.sparks.toArray(),
      flames: await db.flames.toArray(),
      prairies: await db.prairies.toArray(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `点燃备份_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return

    setIsClearing(true)
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
    await db.seedBuffer.clear()
    await loadStats()
    setIsClearing(false)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-gray-300">设置</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* Data Statistics */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">数据统计</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">火种:</span>
              <span className="text-white">{sparkCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">烈焰:</span>
              <span className="text-white">{flameCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">草原:</span>
              <span className="text-white">{prairieCount}</span>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">数据管理</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full py-2 bg-fire-prairie text-white rounded-lg"
            >
              导出数据
            </button>
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
            >
              {isClearing ? '清空中...' : '清空数据'}
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">关于</h2>
          <p className="text-sm text-gray-400">点燃 v0.1.0</p>
          <p className="text-xs text-gray-500 mt-2">
            一个个人探索工具，帮助你记录灵感、整理思绪、形成叙事脉络。
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}