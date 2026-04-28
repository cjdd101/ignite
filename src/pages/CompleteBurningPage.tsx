import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { db } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'
import type { Flame } from '@/types'

export function CompleteBurningPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [record, setRecord] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(f => setFlame(f || null))
    }
  }, [id])

  const handleSave = async () => {
    if (!id || !flame) return
    setSaving(true)

    await db.flames.update(id, {
      status: 'burned',
      userRecord: record.trim() || undefined,
      completedAt: Date.now(),
    })

    navigate(`/prairie/${id}/rekindle`)
  }

  if (!flame) {
    return (
      <div className="page flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🔥</div>
          <p className="text-text-muted">烈焰不存在</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-fire-flame/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl font-display font-bold text-text-primary">完成燃烧</h1>
          </div>
          <p className="text-sm text-text-muted">写下你的感想</p>
        </motion.header>

        <main className="px-4 max-w-lg mx-auto">
          {/* 烈焰信息 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-flame p-4 mb-4"
          >
            <h2 className="text-lg font-medium text-text-primary">{flame.title}</h2>
          </motion.div>

          {/* 感想输入 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <label className="block text-sm text-text-muted mb-2">探索感想（选填）</label>
            <textarea
              value={record}
              onChange={(e) => setRecord(e.target.value)}
              placeholder="这次探索给你带来了什么..."
              rows={6}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted/50 focus:border-fire-flame focus:outline-none resize-none"
            />
            <p className="text-xs text-text-muted mt-1">可以是一句话，也可以留空</p>
          </motion.div>

          {/* 保存按钮 */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-fire-flame to-fire-wildfire text-white rounded-xl font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存并取火'}
          </motion.button>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}