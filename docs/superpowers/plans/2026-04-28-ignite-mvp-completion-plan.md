# 点燃 MVP 完成计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成所有MVP功能的实现，修复已发现的问题，使应用可用的状态

**Architecture:** 基于现有 React + TypeScript + Dexie.js + Zustand 架构，修复路由、AI接口集成、页面流转问题

**Tech Stack:** React 18, TypeScript, Dexie.js, Zustand, Tailwind CSS, Cloudflare Workers (AI代理)

---

## Chunk 1: 路由与页面结构修复

### Task 1.1: 修复 App.tsx 路由配置

**Files:**
- Modify: `src/App.tsx:1-45`

**问题:** 当前路由混乱，FlameCard 点击应该进入烈焰详情页（有完成燃烧按钮），而不是直接进入取火页

**修改后路由表:**

| 路径 | 组件 | 说明 |
|-----|-----|-----|
| `/prairie/flame/:id` | FlameDetailPage | 烈焰详情（含完成燃烧按钮）|
| `/prairie/flame/:id/complete` | CompleteBurningPage | 完成燃烧（写感想）|
| `/prairie/flame/:id/rekindle` | RekindlePage | 取火页 |
| `/prairie/flame/create` | KindleWizard | 手动创建烈焰（sparkId=""）|
| `/prairie/:prairieId/flame/create` | KindleWizard | 在某草原内手动创建烈焰 |

- [ ] **Step 1: 修改 App.tsx 添加缺失路由**

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { KindleWizard } from '@/pages/KindleWizard'
import { RekindlePage } from '@/pages/RekindlePage'
import { OrganizePage } from '@/pages/OrganizePage'
import { FlameDetailPage } from '@/pages/FlameDetailPage'
import { CompleteBurningPage } from '@/pages/CompleteBurningPage'

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/flame/create" element={<KindleWizard sparkId="" />} />
        <Route path="/prairie/:prairieId/flame/create" element={<KindleWizard sparkId="" prairieId={useParams().prairieId} />} />
        <Route path="/prairie/flame/:id" element={<FlameDetailPage />} />
        <Route path="/prairie/flame/:id/complete" element={<CompleteBurningPage />} />
        <Route path="/prairie/flame/:id/rekindle" element={<RekindlePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/organize" element={<OrganizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/App.tsx
git commit -m "fix(routes): add FlameDetailPage and CompleteBurningPage routes"
```

---

### Task 1.2: 创建 FlameDetailPage 组件

**Files:**
- Create: `src/pages/FlameDetailPage.tsx`

- [ ] **Step 1: 创建 FlameDetailPage**

```tsx
// src/pages/FlameDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { FlameCard } from '@/components/FlameCard'
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
    return <div className="p-4">加载中...</div>
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
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/FlameDetailPage.tsx
git commit -m "feat(pages): add FlameDetailPage with complete and jump actions"
```

---

### Task 1.3: 创建 CompleteBurningPage 组件

**Files:**
- Create: `src/pages/CompleteBurningPage.tsx`

- [ ] **Step 1: 创建 CompleteBurningPage**

```tsx
// src/pages/CompleteBurningPage.tsx
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
    return <div className="p-4">加载中...</div>
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
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/CompleteBurningPage.tsx
git commit -m "feat(pages): add CompleteBurningPage for flame completion"
```

---

## Chunk 2: 取火页修复与完善

### Task 2.1: 修复 RekindlePage 组件

**Files:**
- Modify: `src/pages/RekindlePage.tsx`

**问题:**
1. API 调用参数错误（传 `reflection` 但应该传 `taskTitle`, `taskDescription`, `userRecord`, `sourcePrairie`）
2. API 响应字段不匹配（期望 `sparks` 但返回的是 `newQuestions`）
3. 不更新 `rekindleCount` 和 `lastRekindleTime`
4. 不创建 `rekindleRecords`
5. 没有正确获取 flame 数据

- [ ] **Step 1: 重写 RekindlePage**

```tsx
// src/pages/RekindlePage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, generateId } from '@/lib/db'
import { api } from '@/lib/api'
import { RekindleSparkCard } from '@/components/RekindleSparkCard'
import { useSparkStore } from '@/stores/sparkStore'
import type { Flame, RekindleRecord } from '@/types'

const REKINDLE_COOLDOWN = 5000
const REKINDLE_LIMIT = 10

interface RekindledSpark {
  content: string
  retained: boolean
  discarded: boolean
}

export function RekindlePage() {
  const { flameId } = useParams<{ flameId: string }>()
  const navigate = useNavigate()
  const { addSpark } = useSparkStore()

  const [flame, setFlame] = useState<Flame | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [sparks, setSparks] = useState<RekindledSpark[]>([])
  const [atLimit, setAtLimit] = useState(false)
  const [rekindleRecords, setRekindleRecords] = useState<RekindleRecord[]>([])

  useEffect(() => {
    if (flameId) {
      db.flames.get(flameId).then(f => {
        setFlame(f || null)
        if (f) {
          setAtLimit(f.rekindleCount >= REKINDLE_LIMIT)
          setCooldownRemaining(
            f.lastRekindleTime && Date.now() - f.lastRekindleTime < REKINDLE_COOLDOWN
              ? Math.ceil((REKINDLE_COOLDOWN - (Date.now() - f.lastRekindleTime)) / 1000)
              : 0
          )
        }
      })
      db.rekindleRecords.where('flameId').equals(flameId).toArray().then(setRekindleRecords)
    }
  }, [flameId])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(Math.max(0, cooldownRemaining - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  const handleRekindle = async () => {
    if (!flame || loading || atLimit || cooldownRemaining > 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.rekindle({
        taskTitle: flame.title,
        taskDescription: flame.description || '',
        userRecord: flame.userRecord || '',
        sourcePrairie: flame.prairieId || '',
      })

      const newSparks = (response.newQuestions || []).map(q => ({
        content: q,
        retained: false,
        discarded: false,
      }))
      setSparks(newSparks)
    } catch (err) {
      setError('重新点燃失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRetain = (index: number) => {
    setSparks(prev => prev.map((s, i) =>
      i === index ? { ...s, retained: true, discarded: false } : s
    ))
  }

  const handleDiscard = (index: number) => {
    setSparks(prev => prev.map((s, i) =>
      i === index ? { ...s, retained: false, discarded: true } : s
    ))
  }

  const handleSave = async () => {
    if (!flameId || !flame) return

    const sparksToSave = sparks.filter(s => s.retained && !s.discarded)
    const retainedIds: string[] = []

    for (const spark of sparksToSave) {
      const newSpark = await addSpark(spark.content, 'ai_rekindle')
      retainedIds.push(newSpark.id)
    }

    const record: RekindleRecord = {
      id: generateId(),
      flameId,
      sparksResult: sparks.map(s => s.content),
      retainedSparkIds: retainedIds,
      createdAt: Date.now(),
    }
    await db.rekindleRecords.add(record)

    await db.flames.update(flameId, {
      rekindleCount: flame.rekindleCount + 1,
      lastRekindleTime: Date.now(),
    })

    navigate('/prairie')
  }

  const canRekindle = cooldownRemaining === 0 && !loading && !atLimit

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">重新点燃</h1>
        <p className="text-sm text-gray-400">从燃烧中获得新的灵感</p>
      </header>

      <main className="p-4">
        {flame && (
          <div className="bg-bg-card rounded-lg p-4 mb-4">
            <h2 className="font-medium text-white">{flame.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              已取火 {flame.rekindleCount} / {REKINDLE_LIMIT} 次
            </p>
          </div>
        )}

        {cooldownRemaining > 0 && (
          <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
            <p className="text-orange-400 text-center">
              请等待 {cooldownRemaining}s 后再试
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {sparks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              点击按钮，AI 将根据你的探索生成 3 个新的灵感火种
            </p>
            <button
              onClick={handleRekindle}
              disabled={!canRekindle}
              className={`w-full py-3 rounded-lg ${
                canRekindle
                  ? 'bg-fire-flame text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? '重新点燃中...' : '重新点燃'}
            </button>
            {atLimit && (
              <p className="text-orange-400 text-sm mt-2">已达取火上限</p>
            )}
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-medium mb-4">选择保留的火种</h2>
            <div className="space-y-3">
              {sparks.map((spark, index) => (
                <RekindleSparkCard
                  key={index}
                  content={spark.content}
                  onRetain={() => handleRetain(index)}
                  onDiscard={() => handleDiscard(index)}
                  retained={spark.retained}
                  discarded={spark.discarded}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSparks([])}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                重新取火
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-fire-flame text-white rounded"
              >
                保存火种
              </button>
            </div>
          </section>
        )}

        {rekindleRecords.length > 0 && sparks.length === 0 && (
          <section className="mt-8">
            <h3 className="text-sm text-gray-500 mb-3">历史取火记录</h3>
            {rekindleRecords.map(record => (
              <div key={record.id} className="bg-bg-card rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                </p>
                <div className="space-y-1">
                  {record.sparksResult.map((q, i) => (
                    <p key={i} className="text-sm text-gray-300">• {q}</p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/RekindlePage.tsx
git commit -m "fix(rekindle): correct API params, add rekindleCount tracking, create rekindleRecords"
```

---

### Task 2.2: 修复 FlameCard 点击行为

**Files:**
- Modify: `src/components/FlameCard.tsx:17-19`

**问题:** FlameCard 点击应该进入 FlameDetailPage，而不是直接进入 rekindle

- [ ] **Step 1: 修改 FlameCard 点击行为**

```tsx
// src/components/FlameCard.tsx - 修改 handleClick
const handleClick = () => {
  navigate(`/prairie/flame/${flame.id}`)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/FlameCard.tsx
git commit -m "fix(flame-card): click navigates to FlameDetailPage"
```

---

### Task 2.3: 修复 api.ts 类型定义

**Files:**
- Modify: `src/lib/api.ts`

**问题:** `rekindle` 接口的请求和响应类型与实际使用不匹配

- [ ] **Step 1: 修复 RekindleResponse 类型**

```tsx
// src/lib/api.ts - 修改 RekindleResponse
export interface RekindleResponse {
  newQuestions: string[]
}
```

实际 worker 返回的是 `newQuestions`（字符串数组），前端 RekindlePage 需要从 `newQuestions` 读取。上面 Task 2.1 的代码已经处理了这个转换。

- [ ] **Step 2: 提交**

```bash
git add src/lib/api.ts
git commit -m "fix(api): confirm RekindleResponse.newQuestions type"
```

---

## Chunk 3: 探索页完善

### Task 3.1: 重写 ExplorePage 组件

**Files:**
- Modify: `src/pages/ExplorePage.tsx`

**问题:** 当前只有静态 UI，没有 AI 探索功能

**设计要求:**
- 有输入时：调用 `/api/ai/explore` 生成火种
- 无输入时：展示推荐内容（基于草原的延伸方向、随机组合示例）
- 每粒火种可「加入火盆」或「点燃」

- [ ] **Step 1: 重写 ExplorePage**

```tsx
// src/pages/ExplorePage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrairieStore } from '@/stores/prairieStore'
import { useSparkStore } from '@/stores/sparkStore'
import { api } from '@/lib/api'
import { BottomNav } from '@/components/BottomNav'

interface ExploreSpark {
  content: string
  type: string
}

const FALLBACK_RECOMMENDATIONS = [
  { content: '为什么蚊子只咬我，不咬别人？', type: '思考' },
  { content: '咖啡是如何从一颗豆子变成一杯饮品的？', type: '阅读' },
  { content: '古典音乐是如何诞生的？', type: '观看' },
  { content: '冥想到底是什么原理？', type: '实践' },
]

export function ExplorePage() {
  const navigate = useNavigate()
  const { prairies, fetchPrairies } = usePrairieStore()
  const { addSpark } = useSparkStore()

  const [query, setQuery] = useState('')
  const [sparks, setSparks] = useState<ExploreSpark[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(FALLBACK_RECOMMENDATIONS)
  const [showRecommendations, setShowRecommendations] = useState(true)

  useEffect(() => {
    fetchPrairies()
  }, [fetchPrairies])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setShowRecommendations(false)

    try {
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.explore({
        query: query.trim(),
        existingPrairies: existingPrairieNames,
      })
      setSparks(response.sparks || [])
    } catch (err) {
      setSparks([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToHearth = async (spark: ExploreSpark) => {
    await addSpark(spark.content, 'ai_explore')
  }

  const handleKindle = (spark: ExploreSpark) => {
    navigate(`/prairie/flame/create?content=${encodeURIComponent(spark.content)}`)
  }

  const handleShuffleRecommendations = () => {
    setRecommendations(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">探索</h1>
        <p className="text-sm text-gray-400">主动探索入口</p>
      </header>

      <main className="p-4">
        {/* 搜索区 */}
        <section className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词或问题..."
              className="flex-1 bg-bg-card border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-fire-flame focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-fire-flame text-white rounded-lg disabled:opacity-50"
            >
              {loading ? '...' : '探索'}
            </button>
          </div>
        </section>

        {/* AI 探索结果 */}
        {!showRecommendations && (
          <section>
            <h2 className="text-lg font-medium mb-4">探索结果</h2>
            {sparks.length > 0 ? (
              <div className="space-y-3">
                {sparks.map((spark, index) => (
                  <div key={index} className="bg-bg-card rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                          {spark.type}
                        </span>
                        <p className="text-white">{spark.content}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToHearth(spark)}
                        className="flex-1 py-2 border border-gray-600 rounded text-sm"
                      >
                        加入火盆
                      </button>
                      <button
                        onClick={() => handleKindle(spark)}
                        className="flex-1 py-2 bg-fire-spark text-white rounded text-sm"
                      >
                        点燃
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                暂无结果，请尝试其他关键词
              </p>
            )}
            <button
              onClick={() => {
                setShowRecommendations(true)
                setQuery('')
                setSparks([])
              }}
              className="w-full mt-4 py-2 border border-gray-600 rounded"
            >
              返回推荐
            </button>
          </section>
        )}

        {/* 推荐内容 */}
        {showRecommendations && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">推荐探索</h2>
              <button
                onClick={handleShuffleRecommendations}
                className="text-sm text-gray-400 hover:text-white"
              >
                换一批
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-bg-card rounded-lg p-4">
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark mb-2">
                    {rec.type}
                  </span>
                  <p className="text-white">{rec.content}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToHearth(rec)}
                      className="flex-1 py-2 border border-gray-600 rounded text-sm"
                    >
                      加入火盆
                    </button>
                    <button
                      onClick={() => handleKindle(rec)}
                      className="flex-1 py-2 bg-fire-spark text-white rounded text-sm"
                    >
                      点燃
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/ExplorePage.tsx
git commit -m "feat(explore): add AI-powered exploration with query input and recommendations"
```

---

## Chunk 4: 整理页完善

### Task 4.1: 重写 OrganizePage 组件

**Files:**
- Modify: `src/pages/OrganizePage.tsx`

**问题:** 当前只是简单分配草原，没有 AI 分析和分组总览、逐条确认

**设计要求:**
1. 收集 `prairieId === null` 的野火
2. 调用 `/api/ai/organize` 获取归类建议
3. 展示分组总览（merge/create 两种建议）
4. 点击进入逐条确认
5. 每条有「确认归入」「跳过」「手动调整」选项

- [ ] **Step 1: 重写 OrganizePage**

```tsx
// src/pages/OrganizePage.tsx
import { useEffect, useState } from 'react'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { api } from '@/lib/api'
import { BottomNav } from '@/components/BottomNav'
import { db } from '@/lib/db'
import type { Flame } from '@/types'

interface OrganizeSuggestion {
  action: 'merge' | 'create'
  taskIndices: number[]
  targetPrairie?: string
  newPrairieName?: string
  reason: string
}

export function OrganizePage() {
  const { wildFlames, fetchWildFlames } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()

  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<OrganizeSuggestion[]>([])
  const [step, setStep] = useState<'overview' | 'detail'>('overview')
  const [currentSuggestion, setCurrentSuggestion] = useState<OrganizeSuggestion | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWildFlames()
    fetchPrairies()
  }, [fetchWildFlames, fetchPrairies])

  const handleAnalyze = async () => {
    if (wildFlames.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const unclassifiedTasks = wildFlames.map(f => ({ title: f.title }))
      const existingPrairieNames = prairies.map(p => p.name)
      const response = await api.organize({
        unclassifiedTasks,
        existingPrairies: existingPrairieNames,
      })
      setSuggestions(response.suggestions || [])
      if (response.suggestions?.length > 0) {
        setStep('overview')
      }
    } catch (err) {
      setError('整理功能暂时不可用')
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetail = (suggestion: OrganizeSuggestion) => {
    setCurrentSuggestion(suggestion)
    setCurrentIndex(0)
    setStep('detail')
  }

  const handleConfirm = async () => {
    if (!currentSuggestion) return

    const flameIds = currentSuggestion.taskIndices.map(i => wildFlames[i]?.id).filter(Boolean)

    if (currentSuggestion.action === 'merge' && currentSuggestion.targetPrairie) {
      const targetPrairie = prairies.find(p => p.name === currentSuggestion.targetPrairie)
      if (targetPrairie) {
        for (const flameId of flameIds) {
          await db.flames.update(flameId, { prairieId: targetPrairie.id })
        }
      }
    } else if (currentSuggestion.action === 'create' && currentSuggestion.newPrairieName) {
      const newPrairie = await db.prairies.add({
        id: crypto.randomUUID(),
        name: currentSuggestion.newPrairieName,
        status: 'active',
        createdAt: Date.now(),
      })
      for (const flameId of flameIds) {
        await db.flames.update(flameId, { prairieId: newPrairie.id })
      }
    }

    await fetchWildFlames()
    await fetchPrairies()

    const nextIndex = currentIndex + 1
    if (nextIndex < suggestions.length) {
      setCurrentIndex(nextIndex)
      setCurrentSuggestion(suggestions[nextIndex])
    } else {
      setStep('overview')
      setSuggestions([])
    }
  }

  const handleSkip = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < suggestions.length) {
      setCurrentIndex(nextIndex)
      setCurrentSuggestion(suggestions[nextIndex])
    } else {
      setStep('overview')
      setSuggestions([])
    }
  }

  if (wildFlames.length === 0) {
    return (
      <div className="min-h-screen pb-20">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
        </header>
        <main className="p-4 text-center py-12">
          <p className="text-3xl mb-4">🌿</p>
          <p className="text-gray-400">暂无野火需要整理</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-prairie">整理</h1>
        <p className="text-sm text-gray-400">
          {step === 'overview' ? `${wildFlames.length} 朵野火待整理` : '确认归类'}
        </p>
      </header>

      <main className="p-4">
        {step === 'overview' && (
          <>
            {suggestions.length === 0 ? (
              <section>
                <div className="bg-bg-card rounded-lg p-6 text-center mb-6">
                  <p className="text-3xl mb-2">🌿</p>
                  <p className="text-xl font-medium text-white">{wildFlames.length} 朵野火待整理</p>
                  <p className="text-sm text-gray-400 mt-2">
                    让 AI 分析并建议如何归类这些探索
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 bg-fire-prairie text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? '分析中...' : '开始 AI 整理'}
                </button>

                {error && (
                  <p className="text-red-400 text-center mt-4">{error}</p>
                )}
              </section>
            ) : (
              <section>
                <h2 className="text-lg font-medium mb-4">整理建议</h2>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleShowDetail(suggestion)}
                      className="w-full bg-bg-card hover:bg-bg-secondary border border-gray-700 rounded-lg p-4 text-left"
                    >
                      {suggestion.action === 'merge' ? (
                        <>
                          <span className="text-fire-prairie">归入草原</span>
                          <span className="text-white mx-2">「{suggestion.targetPrairie}」</span>
                          <span className="text-gray-400">({suggestion.taskIndices.length} 朵)</span>
                        </>
                      ) : (
                        <>
                          <span className="text-fire-spark">创建新草原</span>
                          <span className="text-white mx-2">「{suggestion.newPrairieName}」</span>
                          <span className="text-gray-400">({suggestion.taskIndices.length} 朵)</span>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-1">{suggestion.reason}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSuggestions([])
                    setStep('overview')
                  }}
                  className="w-full mt-4 py-2 border border-gray-600 rounded"
                >
                  重新分析
                </button>
              </section>
            )}
          </>
        )}

        {step === 'detail' && currentSuggestion && (
          <>
            <section className="mb-4">
              <h2 className="text-lg font-medium mb-2">
                {currentSuggestion.action === 'merge' ? (
                  <>归入「{currentSuggestion.targetPrairie}」</>
                ) : (
                  <>创建「{currentSuggestion.newPrairieName}」</>
                )}
              </h2>
              <p className="text-sm text-gray-400">{currentSuggestion.reason}</p>
            </section>

            <section className="mb-6">
              <h3 className="text-sm text-gray-500 mb-2">涉及烈焰</h3>
              {currentSuggestion.taskIndices.map(i => (
                <div key={i} className="bg-bg-card rounded-lg p-3 mb-2">
                  <p className="text-white">{wildFlames[i]?.title}</p>
                </div>
              ))}
            </section>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 border border-gray-600 rounded"
              >
                跳过
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-fire-prairie text-white rounded"
              >
                确认归入
              </button>
            </div>

            <button
              onClick={() => setStep('overview')}
              className="w-full mt-4 py-2 border border-gray-600 rounded"
            >
              返回总览
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/OrganizePage.tsx
git commit -m "feat(organize): add AI-powered organize with group overview and per-item confirmation"
```

---

## Chunk 5: 设置页与 PWA

### Task 5.1: 实现 SettingsPage 备份还原功能

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

**问题:** 当前只是 stub

**设计要求:**
- 备份：导出 IndexedDB 全量数据为 JSON，上传至 OSS
- 还原：从 OSS 下载 JSON，清空本地数据后导入

- [ ] **Step 1: 实现 SettingsPage**

```tsx
// src/pages/SettingsPage.tsx
import { useState } from 'react'
import { db, getOrCreateDeviceUuid } from '@/lib/db'
import { BottomNav } from '@/components/BottomNav'

const OSS_BACKUP_URL = 'https://您的bucket.oss-cn-hangzhou.aliyuncs.com/devices'

export function SettingsPage() {
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleBackup = async () => {
    setLoading(true)
    setBackupStatus(null)

    try {
      const deviceUuid = await getOrCreateDeviceUuid()

      const sparks = await db.sparks.toArray()
      const flames = await db.flames.toArray()
      const prairies = await db.prairies.toArray()
      const rekindleRecords = await db.rekindleRecords.toArray()
      const seedBuffer = await db.seedBuffer.toArray()
      const deviceInfo = await db.deviceInfo.toArray()

      const backup = {
        version: 1,
        timestamp: Date.now(),
        deviceUuid,
        data: { sparks, flames, prairies, rekindleRecords, seedBuffer, deviceInfo }
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

  const handleRestore = async () => {
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

      setRestoreStatus('还原成功')
    } catch (err) {
      setRestoreStatus('还原失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">设置</h1>
      </header>

      <main className="p-4">
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">数据备份</h2>
          <p className="text-sm text-gray-400 mb-4">
            将所有数据备份到云端存储，支持跨设备恢复
          </p>

          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full py-3 bg-fire-flame text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '备份中...' : '备份到云端'}
          </button>

          {backupStatus && (
            <p className={`text-sm mt-2 ${backupStatus.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
              {backupStatus}
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">数据还原</h2>
          <p className="text-sm text-gray-400 mb-4">
            从云端下载备份并还原，会清空当前所有数据
          </p>

          <button
            onClick={handleRestore}
            disabled={loading}
            className="w-full py-3 border border-gray-600 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '还原中...' : '从云端还原'}
          </button>

          {restoreStatus && (
            <p className={`text-sm mt-2 ${restoreStatus.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
              {restoreStatus}
            </p>
          )}
        </section>

        <section className="text-center text-gray-500 text-sm">
          <p>数据本地存储于浏览器 IndexedDB</p>
          <p>卸载应用不会删除本地数据</p>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat(settings): implement backup/restore functionality"
```

---

### Task 5.2: 配置 PWA

**Files:**
- Modify: `vite.config.ts`
- Modify: `public/manifest.json`
- Create: `public/sw.js` (Service Worker)

**问题:** manifest 存在但 Service Worker 未配置

- [ ] **Step 1: 安装 vite-plugin-pwa**

```bash
npm install vite-plugin-pwa -D
```

- [ ] **Step 2: 修改 vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: '点燃 - 个人探索工具',
        short_name: '点燃',
        description: '存一粒火种，燃一团烈焰，蔓一片草原',
        theme_color: '#FF6B35',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.minimax\.chat\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ai-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

- [ ] **Step 3: 提交**

```bash
npm install vite-plugin-pwa -D
git add vite.config.ts package.json package-lock.json
git commit -m "feat(pwa): add vite-plugin-pwa configuration"
```

---

## Chunk 6: KindleWizard 修复

### Task 6.1: 修复 KindleWizard 的 prairieId 参数

**Files:**
- Modify: `src/pages/KindleWizard.tsx`

**问题:**
1. App.tsx 中 `/prairie/:prairieId/flame/create` 路由没有正确传递 prairieId
2. KindleWizard 需要支持从 URL 参数接收 prairieId

- [ ] **Step 1: 修改 KindleWizard 支持 prairieId 参数**

```tsx
// src/pages/KindleWizard.tsx
interface KindleWizardProps {
  sparkId: string
  prairieId?: string
}

export function KindleWizard({ sparkId, prairieId: initialPrairieId }: KindleWizardProps) {
  // ... existing code ...

  // Step 3: Confirm - 支持初始 prairieId
  const [selectedPrairieId, setSelectedPrairieId] = useState<string | null>(initialPrairieId || null)
  // ... rest of code
}
```

- [ ] **Step 2: 修改 App.tsx 路由传递 prairieId**

```tsx
// src/App.tsx
function PrairieFlameCreateWrapper() {
  const { prairieId } = useParams<{ prairieId: string }>()
  return <KindleWizard sparkId="" prairieId={prairieId} />
}

// routes
<Route path="/prairie/:prairieId/flame/create" element={<PrairieFlameCreateWrapper />} />
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/KindleWizard.tsx src/App.tsx
git commit -m "fix(kindle): support prairieId param for create within prairie"
```

---

## Chunk 7: 种子缓存池自动补充

### Task 7.1: 实现种子缓存池自动补充

**Files:**
- Modify: `src/stores/seedBufferStore.ts`

**问题:** 只在用户手动"换一批"且 seeds.length === 0 时才补充。应该在后台持续保持 >= 10 粒

- [ ] **Step 1: 修改 seedBufferStore 添加自动补充逻辑**

```ts
// src/stores/seedBufferStore.ts
// 在 fetchSeeds 后检查并自动补充
fetchSeeds: async () => {
  set({ loading: true })
  try {
    const seeds = await db.seedBuffer
      .filter(seed => !seed.used)
      .toArray()
    set({ seeds, loading: false })

    // Auto-refill if below 10
    if (seeds.length < 10) {
      get().refillBuffer()
    }
  } catch (error) {
    set({ loading: false })
  }
},
```

- [ ] **Step 2: 提交**

```bash
git add src/stores/seedBufferStore.ts
git commit -m "feat(seed-buffer): auto-refill when buffer below 10"
```

---

## Chunk 8: SparkCard 修复

### Task 8.1: 修复 SparkCard 路由

**Files:**
- Modify: `src/components/SparkCard.tsx:12-14`

**问题:** SparkCard 点击使用 `/prairie/${spark.id}/kindle` 但正确的点燃路由应该是通过 HearthPage 进入 KindleWizard

**当前:** 路由是 `/prairie/${spark.id}/kindle`
**正确:** 应该先进入点燃向导，sparkId 作为参数

由于 SparkCard 在 HearthPage 中，需要有点燃按钮或者点击进入详情页。设计文档中火种详情应该可以点燃。

- [ ] **Step 1: 修改 SparkCard 使其可点击进入点燃向导**

```tsx
// src/components/SparkCard.tsx
const handleClick = () => {
  navigate(`/hearth/kindle/${spark.id}`)
}
```

同时需要在 App.tsx 添加 `/hearth/kindle/:sparkId` 路由

- [ ] **Step 2: 添加路由**

```tsx
// src/App.tsx
<Route path="/hearth/kindle/:sparkId" element={<KindleWizard sparkId={useParams().sparkId || ''} />} />
```

- [ ] **Step 3: 提交**

```bash
git add src/components/SparkCard.tsx src/App.tsx
git commit -m "fix(spark-card): correct kindle route to /hearth/kindle/:sparkId"
```

---

## 验证清单

完成所有任务后，验证以下功能:

1. **火盆**: 能创建火种、查看列表、"换一批"正常工作
2. **点燃**: 点击火种进入点燃向导，三步正常流转，创建烈焰成功
3. **草原**: 野火列表、创建烈焰、草原存档/恢复正常
4. **烈焰详情**: 能查看烈焰详情、完成燃烧（写感想）
5. **取火**: AI 生成火种、保留/丢弃、保存到火盆
6. **探索**: 输入关键词搜索、AI 生成火种、加入火盆或点燃
7. **整理**: AI 分析野火、显示归类建议、逐条确认归类
8. **设置**: 备份/还原功能
9. **PWA**: 可安装到主屏幕、离线可用

---

## 执行顺序

1. Chunk 1: 路由与页面结构修复
2. Chunk 2: 取火页修复
3. Chunk 3: 探索页完善
4. Chunk 4: 整理页完善
5. Chunk 5: 设置页与 PWA
6. Chunk 6: KindleWizard 修复
7. Chunk 7: 种子缓存池自动补充
8. Chunk 8: SparkCard 修复

每个 Chunk 完成后进行自测，确保基本流程可用。
