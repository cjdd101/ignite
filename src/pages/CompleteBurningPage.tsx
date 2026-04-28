import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { Flame } from '@/types'

export function CompleteBurningPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [record, setRecord] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(setFlame)
    }
  }, [id])

  const handleSave = async () => {
    if (!id || !flame) return
    setSaving(true)

    await db.flames.update(id, {
      status: 'burned',
      userRecord: record.trim(),
      completedAt: Date.now(),
    })

    navigate(`/prairie/flame/${id}/rekindle`)
  }

  if (!flame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">完成燃烧</h1>
        <p className="text-sm text-gray-400">写下你的感想</p>
      </header>

      <main className="p-4">
        <div className="bg-bg-card rounded-lg p-4 mb-4">
          <h2 className="text-lg font-medium text-white">{flame.title}</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">探索感想（选填）</label>
          <textarea
            value={record}
            onChange={(e) => setRecord(e.target.value)}
            placeholder="这次探索给你带来了什么..."
            rows={6}
            className="w-full bg-bg-card border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-fire-flame focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">可以是一句话，也可以留空</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-fire-flame text-white rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存并取火'}
        </button>
      </main>
    </div>
  )
}