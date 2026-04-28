import { useEffect, useState } from 'react'
import { db, getOrCreateDeviceUuid } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'

// OSS backup URL - should be configured via environment variable in production
const OSS_BACKUP_URL = (import.meta.env.VITE_OSS_BACKUP_URL as string) || ''

export function SettingsPage() {
  const [sparkCount, setSparkCount] = useState(0)
  const [flameCount, setFlameCount] = useState(0)
  const [prairieCount, setPrairieCount] = useState(0)
  const [isClearing, setIsClearing] = useState(false)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      rekindleRecords: await db.rekindleRecords.toArray(),
      seedBuffer: await db.seedBuffer.toArray(),
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

  const handleCloudBackup = async () => {
    if (!OSS_BACKUP_URL) {
      setBackupStatus('云备份未配置')
      return
    }

    setLoading(true)
    setBackupStatus(null)

    try {
      const deviceUuid = await getOrCreateDeviceUuid()

      const backup = {
        version: 1,
        timestamp: Date.now(),
        deviceUuid,
        data: {
          sparks: await db.sparks.toArray(),
          flames: await db.flames.toArray(),
          prairies: await db.prairies.toArray(),
          rekindleRecords: await db.rekindleRecords.toArray(),
          seedBuffer: await db.seedBuffer.toArray(),
        }
      }

      const response = await fetch(`${OSS_BACKUP_URL}/${deviceUuid}/backup.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      })

      if (response.ok) {
        setBackupStatus('备份成功')
      } else {
        setBackupStatus(`备份失败: ${response.status}`)
      }
    } catch (err) {
      setBackupStatus('备份失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  const handleCloudRestore = async () => {
    if (!OSS_BACKUP_URL) {
      setRestoreStatus('云还原未配置')
      return
    }

    if (!confirm('还原将清空当前所有数据，确定继续？')) return

    setLoading(true)
    setRestoreStatus(null)

    try {
      const deviceUuid = await getOrCreateDeviceUuid()

      const response = await fetch(`${OSS_BACKUP_URL}/${deviceUuid}/backup.json`)

      if (!response.ok) {
        setRestoreStatus(`还原失败: ${response.status}`)
        setLoading(false)
        return
      }

      const backup = await response.json()

      if (!backup.data || !backup.version) {
        setRestoreStatus('备份文件格式错误')
        setLoading(false)
        return
      }

      await db.sparks.clear()
      await db.flames.clear()
      await db.prairies.clear()
      await db.rekindleRecords.clear()
      await db.seedBuffer.clear()

      if (backup.data.sparks?.length) await db.sparks.bulkAdd(backup.data.sparks)
      if (backup.data.flames?.length) await db.flames.bulkAdd(backup.data.flames)
      if (backup.data.prairies?.length) await db.prairies.bulkAdd(backup.data.prairies)
      if (backup.data.rekindleRecords?.length) await db.rekindleRecords.bulkAdd(backup.data.rekindleRecords)
      if (backup.data.seedBuffer?.length) await db.seedBuffer.bulkAdd(backup.data.seedBuffer)

      await loadStats()
      setRestoreStatus('还原成功')
    } catch (err) {
      setRestoreStatus('还原失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return

    setIsClearing(true)
    await db.sparks.clear()
    await db.flames.clear()
    await db.prairies.clear()
    await db.rekindleRecords.clear()
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

        {/* Cloud Backup */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">云端备份</h2>
          <p className="text-xs text-gray-500 mb-4">
            将数据备份到阿里云 OSS，需要配置 VITE_OSS_BACKUP_URL
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCloudBackup}
              disabled={loading || !OSS_BACKUP_URL}
              className="w-full py-2 bg-fire-flame text-white rounded-lg disabled:opacity-50"
            >
              {loading ? '备份中...' : '备份到云端'}
            </button>
            {backupStatus && (
              <p className={`text-sm ${backupStatus.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
                {backupStatus}
              </p>
            )}

            <button
              onClick={handleCloudRestore}
              disabled={loading || !OSS_BACKUP_URL}
              className="w-full py-2 border border-gray-600 rounded-lg disabled:opacity-50"
            >
              {loading ? '还原中...' : '从云端还原'}
            </button>
            {restoreStatus && (
              <p className={`text-sm ${restoreStatus.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
                {restoreStatus}
              </p>
            )}
          </div>
        </section>

        {/* Local Export/Import */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">本地数据</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full py-2 bg-fire-prairie text-white rounded-lg"
            >
              导出 JSON
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 text-red-400">危险区域</h2>
          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
          >
            {isClearing ? '清空中...' : '清空所有数据'}
          </button>
        </section>

        {/* About */}
        <section className="bg-bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">关于</h2>
          <p className="text-sm text-gray-400">点燃 v0.2.0</p>
          <p className="text-xs text-gray-500 mt-2">
            存一粒火种，燃一团烈焰，蔓一片草原。
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}