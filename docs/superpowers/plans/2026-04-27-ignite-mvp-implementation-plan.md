# 点燃 MVP 完整实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零构建"点燃"个人探索工具 MVP，包含火盆、草原/野火、点燃向导、取火、探索等核心功能

**Architecture:**
- 前端：React 18 + TypeScript + Tailwind CSS + Zustand + Dexie.js + React Router v6 (Hash路由)
- 后端：Cloudflare Workers 代理 MiniMax API
- 存储：IndexedDB (Dexie.js) + 阿里云OSS手动备份
- PWA：Workbox 生成 Service Worker

**Tech Stack:**
- React 18, TypeScript, Tailwind CSS, Zustand/Context, Dexie.js, React Router v6, Workbox
- Cloudflare Workers, MiniMax-Text-01 API

---

## Chunk 1: 项目脚手架与基础设置

### 1.1 创建 React + TypeScript 项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `vite.config.ts`
- Create: `index.html`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "ignite",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "dexie": "^3.2.4",
    "zustand": "^4.5.0",
    "react-window": "^1.8.10",
    "@tanstack/react-virtual": "^3.1.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-window": "^1.8.8",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "vitest": "^1.3.0",
    "@vitest/ui": "^1.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "workbox-window": "^7.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

- [ ] **Step 4: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          spark: '#FF6B35',
          flame: '#FF9F1C',
          prairie: '#2EC4B6',
        },
        bg: {
          primary: '#1A1A2E',
          secondary: '#16213E',
          card: '#0F3460',
        }
      },
      maxWidth: {
        'app': '32rem',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1A1A2E" />
    <link rel="manifest" href="/manifest.json" />
    <title>点燃</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 1.2 创建项目目录结构

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/lib/db.ts`
- Create: `src/types/index.ts`

- [ ] **Step 6: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 7: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-primary text-gray-100;
  }
}
```

- [ ] **Step 8: 创建 src/App.tsx**

```tsx
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>点燃</div>} />
    </Routes>
  )
}

export default App
```

### 1.3 创建 Dexie 数据库与类型定义

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/db.ts`

- [ ] **Step 9: 创建 src/types/index.ts**

```typescript
// Spark - 灵感碎片
export interface Spark {
  id: string
  content: string
  sourceType: 'user' | 'ai_rekindle' | 'ai_seed' | 'ai_explore'
  sourceFlameId?: string
  sourcePrairieId?: string
  sourceSparkId?: string
  createdAt: number
  isDeleted: boolean
}

// Flame - 探索行动
export interface Flame {
  id: string
  title: string
  description?: string
  recommendationReason: string
  searchPhrase: string
  status: 'burning' | 'burned'
  prairieId?: string
  sourceSparkId?: string
  igniteBatchId?: string
  userRecord: string
  completedAt?: number
  createdAt: number
  isDeleted: boolean
  rekindleCount: number
  lastRekindleTime?: number
}

// RekindleRecord - 取火记录
export interface RekindleRecord {
  id: string
  flameId: string
  sparksResult: string[]
  retainedSparkIds: string[]
  createdAt: number
}

// Prairie - 草原
export interface Prairie {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived'
  archivedAt?: number
  createdAt: number
}

// SeedBuffer - 种子缓存池
export interface SeedBuffer {
  id: string
  content: string
  createdAt: number
  used: boolean
}

// DeviceInfo - 设备信息
export interface DeviceInfo {
  id: 'device'
  deviceUuid: string
  lastSyncTime?: number
}
```

- [ ] **Step 10: 创建 src/lib/db.ts**

```typescript
import Dexie, { Table } from 'dexie'
import type { Spark, Flame, RekindleRecord, Prairie, SeedBuffer, DeviceInfo } from '@/types'

export class KindlingDB extends Dexie {
  sparks!: Table<Spark, string>
  flames!: Table<Flame, string>
  rekindleRecords!: Table<RekindleRecord, string>
  prairies!: Table<Prairie, string>
  seedBuffer!: Table<SeedBuffer, string>
  deviceInfo!: Table<DeviceInfo, 'id'>

  constructor() {
    super('kindling')
    this.version(1).stores({
      sparks: 'id, sourceType, sourceFlameId, sourcePrairieId, sourceSparkId, createdAt, isDeleted',
      flames: 'id, status, prairieId, sourceSparkId, igniteBatchId, createdAt, isDeleted',
      rekindleRecords: 'id, flameId, createdAt',
      prairies: 'id, name, status, createdAt',
      seedBuffer: 'id, used, createdAt',
      deviceInfo: 'id',
    })
  }
}

export const db = new KindlingDB()

// 生成 UUID
export function generateId(): string {
  return crypto.randomUUID()
}

// 获取或创建设备 UUID
export async function getOrCreateDeviceUuid(): Promise<string> {
  const existing = await db.deviceInfo.get('device')
  if (existing) return existing.deviceUuid

  const uuid = crypto.randomUUID()
  await db.deviceInfo.put({ id: 'device', deviceUuid: uuid })
  return uuid
}
```

### 1.4 初始化 Git 仓库

- [ ] **Step 11: 初始化 Git**

```bash
cd d:/dev/Ignite && git init
```

- [ ] **Step 12: 创建 .gitignore**

```
node_modules
dist
.env
.env.local
*.log
.DS_Store
coverage
.vitest
```

- [ ] **Step 13: 初始提交**

```bash
git add .
git commit -m "feat: scaffold React + TypeScript + Tailwind + Dexie.js project"
```

---

## Chunk 2: P1 - 数据库初始化、火盆CRUD、种子缓存池

### 2.1 Spark CRUD 状态管理

**Files:**
- Create: `src/stores/sparkStore.ts`
- Create: `src/hooks/useSparks.ts`

- [ ] **Step 14: 创建 Spark Store**

```typescript
import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Spark } from '@/types'

interface SparkState {
  sparks: Spark[]
  loading: boolean
  error: string | null
  fetchSparks: () => Promise<void>
  addSpark: (content: string, sourceType: Spark['sourceType']) => Promise<Spark>
  deleteSpark: (id: string) => Promise<void>
}

export const useSparkStore = create<SparkState>((set, get) => ({
  sparks: [],
  loading: false,
  error: null,

  fetchSparks: async () => {
    set({ loading: true, error: null })
    try {
      const sparks = await db.sparks
        .where({ isDeleted: false })
        .reverse()
        .sortBy('createdAt')
      set({ sparks, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addSpark: async (content, sourceType) => {
    const spark: Spark = {
      id: generateId(),
      content,
      sourceType,
      createdAt: Date.now(),
      isDeleted: false,
    }
    await db.sparks.put(spark)
    await get().fetchSparks()
    return spark
  },

  deleteSpark: async (id) => {
    await db.sparks.update(id, { isDeleted: true })
    await get().fetchSparks()
  },
}))
```

- [ ] **Step 15: 创建 useSparks Hook**

```typescript
import { useEffect } from 'react'
import { useSparkStore } from '@/stores/sparkStore'

export function useSparks() {
  const { sparks, loading, error, fetchSparks, addSpark, deleteSpark } = useSparkStore()

  useEffect(() => {
    fetchSparks()
  }, [])

  return { sparks, loading, error, addSpark, deleteSpark, refetch: fetchSparks }
}
```

### 2.2 种子缓存池管理

**Files:**
- Create: `src/stores/seedBufferStore.ts`
- Create: `src/lib/seedManager.ts`

- [ ] **Step 16: 创建 SeedBuffer Store**

```typescript
import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { SeedBuffer, Spark } from '@/types'

interface SeedBufferState {
  bufferCount: number
  loading: boolean
  fetchBufferCount: () => Promise<void>
  getSeeds: (count: number) => Promise<SeedBuffer[]>
  markSeedsUsed: (ids: string[]) => Promise<void>
  addToSparks: (seeds: SeedBuffer[]) => Promise<void>
}

export const useSeedBufferStore = create<SeedBufferState>((set) => ({
  bufferCount: 0,
  loading: false,

  fetchBufferCount: async () => {
    const count = await db.seedBuffer.where({ used: false }).count()
    set({ bufferCount: count })
  },

  getSeeds: async (count) => {
    const seeds = await db.seedBuffer
      .where({ used: false })
      .limit(count)
      .toArray()
    return seeds
  },

  markSeedsUsed: async (ids) => {
    await db.seedBuffer.where('id').anyOf(ids).modify({ used: true })
  },

  addToSparks: async (seeds) => {
    const sparks: Spark[] = seeds.map(seed => ({
      id: generateId(),
      content: seed.content,
      sourceType: 'ai_seed' as const,
      createdAt: Date.now(),
      isDeleted: false,
    }))
    await db.sparks.bulkPut(sparks)
    await db.seedBuffer.where('id').anyOf(seeds.map(s => s.id)).modify({ used: true })
  },
}))
```

- [ ] **Step 17: 创建 Seed Manager (后台补充种子)**

```typescript
import { db, generateId } from './db'
import type { SeedBuffer } from '@/types'

const MIN_BUFFER_SIZE = 10
const REFILL_BATCH_SIZE = 5

export async function checkAndRefillSeedBuffer(): Promise<void> {
  const unusedCount = await db.seedBuffer.where({ used: false }).count()

  if (unusedCount >= MIN_BUFFER_SIZE) return

  // 注意：实际项目中这里应该调用 AI 接口
  // 暂时用预设种子代替
  const fallbackSeeds: SeedBuffer[] = [
    { id: generateId(), content: '唐僧取的真经，到底是哪几本经书？讲了什么？', createdAt: Date.now(), used: false },
    { id: generateId(), content: '为什么蚊子只咬我，不咬别人？', createdAt: Date.now(), used: false },
    { id: generateId(), content: '苹果手机那个"咔哒"的解锁声，到底是谁设计的？', createdAt: Date.now(), used: false },
    { id: generateId(), content: '咖啡为什么能提神？喝多了对身体有什么影响？', createdAt: Date.now(), used: false },
    { id: generateId(), content: '为什么有些人一看到太阳就打喷嚏？', createdAt: Date.now(), used: false },
  ]

  await db.seedBuffer.bulkPut(fallbackSeeds)
}
```

### 2.3 HearthPage (火盆页面)

**Files:**
- Create: `src/pages/HearthPage.tsx`
- Create: `src/components/SparkCard.tsx`
- Create: `src/components/SparkInput.tsx`
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 18: 创建 SparkCard 组件**

```tsx
import type { Spark } from '@/types'

interface SparkCardProps {
  spark: Spark
  onDelete: (id: string) => void
  onKindle?: (id: string) => void
}

export function SparkCard({ spark, onDelete, onKindle }: SparkCardProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-fire-spark">
      <p className="text-gray-100 mb-3">{spark.content}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          {new Date(spark.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          {onKindle && (
            <button
              onClick={() => onKindle(spark.id)}
              className="text-fire-flame hover:underline"
            >
              点燃
            </button>
          )}
          <button
            onClick={() => onDelete(spark.id)}
            className="text-gray-500 hover:text-red-400"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 19: 创建 SparkInput 组件**

```tsx
import { useState } from 'react'

interface SparkInputProps {
  onSubmit: (content: string) => void
}

export function SparkInput({ onSubmit }: SparkInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下一粒火种..."
        className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-fire-spark"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-fire-spark text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition"
        >
          投入火盆
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 20: 创建 BottomNav 组件**

```tsx
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/hearth', label: '火盆', icon: '🔥' },
  { path: '/explore', label: '探索', icon: '🔍' },
  { path: '/prairie', label: '草原', icon: '🌿' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-700">
      <div className="max-w-app mx-auto flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-1 px-4 ${
              location.pathname === item.path ? 'text-fire-spark' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 21: 创建 HearthPage 组件**

```tsx
import { useSparks } from '@/hooks/useSparks'
import { SparkCard } from '@/components/SparkCard'
import { SparkInput } from '@/components/SparkInput'
import { BottomNav } from '@/components/BottomNav'
import { useSeedBufferStore } from '@/stores/seedBufferStore'
import { useEffect } from 'react'

export function HearthPage() {
  const { sparks, loading, addSpark, deleteSpark, refetch } = useSparks()
  const { getSeeds, addToSparks, bufferCount, fetchBufferCount } = useSeedBufferStore()

  useEffect(() => {
    fetchBufferCount()
  }, [])

  const handleRefresh = async () => {
    const seeds = await getSeeds(5)
    if (seeds.length > 0) {
      await addToSparks(seeds)
      await refetch()
      await fetchBufferCount()
    }
  }

  const handleAddUserSpark = async (content: string) => {
    await addSpark(content, 'user')
  }

  if (loading && sparks.length === 0) {
    return <div className="p-4 text-center">加载中...</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-spark">火盆</h1>
        <p className="text-sm text-gray-400">灵感蓄热区</p>
      </header>

      <main className="p-4">
        <SparkInput onSubmit={handleAddUserSpark} />

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            {sparks.length} 粒火种
          </span>
          <button
            onClick={handleRefresh}
            disabled={bufferCount === 0}
            className="text-sm text-fire-flame hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            换一批 ({bufferCount})
          </button>
        </div>

        <div className="space-y-3">
          {sparks.map((spark) => (
            <SparkCard
              key={spark.id}
              spark={spark}
              onDelete={deleteSpark}
            />
          ))}
        </div>

        {sparks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>火盆空空如也</p>
            <p className="text-sm">点击上方按钮投入火种</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
```

### 2.4 更新 App.tsx 路由

- [ ] **Step 22: 更新 App.tsx 添加路由**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </div>
  )
}

export default App
```

### 2.5 创建基础页面占位符

**Files:**
- Create: `src/pages/PrairiePage.tsx`
- Create: `src/pages/ExplorePage.tsx`

- [ ] **Step 23: 创建 PrairiePage 占位符**

```tsx
import { BottomNav } from '@/components/BottomNav'

export function PrairiePage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-prairie">草原</h1>
        <p className="text-sm text-gray-400">烈焰脉络</p>
      </header>
      <main className="p-4">
        <p className="text-gray-500">草原页面开发中...</p>
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 24: 创建 ExplorePage 占位符**

```tsx
import { BottomNav } from '@/components/BottomNav'

export function ExplorePage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">探索</h1>
        <p className="text-sm text-gray-400">主动探索入口</p>
      </header>
      <main className="p-4">
        <p className="text-gray-500">探索页面开发中...</p>
      </main>
      <BottomNav />
    </div>
  )
}
```

### 2.6 P1 提交

- [ ] **Step 25: 提交 P1**

```bash
git add .
git commit -m "feat(P1): add Dexie DB, Spark CRUD, seed buffer, HearthPage"
```

---

## Chunk 3: P2 - 草原/野火视图、烈焰CRUD、草原存档/恢复

### 3.1 Flame CRUD 状态管理

**Files:**
- Create: `src/stores/flameStore.ts`
- Create: `src/hooks/useFlames.ts`

- [ ] **Step 26: 创建 Flame Store**

```typescript
import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Flame } from '@/types'

interface FlameState {
  flames: Flame[]
  wildFlames: Flame[] // prairieId === null
  loading: boolean
  error: string | null
  fetchWildFlames: () => Promise<void>
  fetchFlamesByPrairie: (prairieId: string) => Promise<void>
  addFlame: (flame: Omit<Flame, 'id' | 'createdAt' | 'isDeleted' | 'rekindleCount' | 'lastRekindleTime'>) => Promise<Flame>
  updateFlame: (id: string, updates: Partial<Flame>) => Promise<void>
  deleteFlame: (id: string) => Promise<void>
}

export const useFlameStore = create<FlameState>((set, get) => ({
  flames: [],
  wildFlames: [],
  loading: false,
  error: null,

  fetchWildFlames: async () => {
    set({ loading: true, error: null })
    try {
      const flames = await db.flames
        .where({ prairieId: null, isDeleted: false })
        .reverse()
        .sortBy('createdAt')
      set({ wildFlames: flames, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchFlamesByPrairie: async (prairieId: string) => {
    set({ loading: true, error: null })
    try {
      const flames = await db.flames
        .where({ prairieId, isDeleted: false })
        .reverse()
        .sortBy('createdAt')
      set({ flames, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addFlame: async (flameData) => {
    const flame: Flame = {
      ...flameData,
      id: generateId(),
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    }
    await db.flames.put(flame)
    await get().fetchWildFlames()
    return flame
  },

  updateFlame: async (id, updates) => {
    await db.flames.update(id, updates)
    await get().fetchWildFlames()
  },

  deleteFlame: async (id) => {
    await db.flames.update(id, { isDeleted: true })
    await get().fetchWildFlames()
  },
}))
```

### 3.2 Prairie CRUD 状态管理

**Files:**
- Create: `src/stores/prairieStore.ts`
- Create: `src/hooks/usePrairies.ts`

- [ ] **Step 27: 创建 Prairie Store**

```typescript
import { create } from 'zustand'
import { db, generateId } from '@/lib/db'
import type { Prairie } from '@/types'

interface PrairieState {
  prairies: Prairie[]
  archivedPrairies: Prairie[]
  loading: boolean
  error: string | null
  fetchPrairies: () => Promise<void>
  fetchArchivedPrairies: () => Promise<void>
  addPrairie: (name: string, description?: string) => Promise<Prairie>
  updatePrairie: (id: string, updates: Partial<Prairie>) => Promise<void>
  archivePrairie: (id: string) => Promise<void>
  restorePrairie: (id: string) => Promise<void>
  permanentlyDeletePrairie: (id: string) => Promise<void>
}

export const usePrairieStore = create<PrairieState>((set, get) => ({
  prairies: [],
  archivedPrairies: [],
  loading: false,
  error: null,

  fetchPrairies: async () => {
    set({ loading: true, error: null })
    try {
      const prairies = await db.prairies
        .where({ status: 'active' })
        .sortBy('createdAt')
      set({ prairies, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchArchivedPrairies: async () => {
    try {
      const archived = await db.prairies
        .where({ status: 'archived' })
        .sortBy('createdAt')
      set({ archivedPrairies: archived })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addPrairie: async (name, description) => {
    const prairie: Prairie = {
      id: generateId(),
      name,
      description,
      status: 'active',
      createdAt: Date.now(),
    }
    await db.prairies.put(prairie)
    await get().fetchPrairies()
    return prairie
  },

  updatePrairie: async (id, updates) => {
    await db.prairies.update(id, updates)
    await get().fetchPrairies()
  },

  archivePrairie: async (id) => {
    await db.prairies.update(id, { status: 'archived', archivedAt: Date.now() })
    await get().fetchPrairies()
    await get().fetchArchivedPrairies()
  },

  restorePrairie: async (id) => {
    await db.prairies.update(id, { status: 'active', archivedAt: undefined })
    await get().fetchPrairies()
    await get().fetchArchivedPrairies()
  },

  permanentlyDeletePrairie: async (id) => {
    // 先将关联的烈焰设为野火
    await db.flames.where({ prairieId: id }).modify({ prairieId: null })
    await db.prairies.delete(id)
    await get().fetchArchivedPrairies()
  },
}))
```

### 3.3 FlameCard 组件

**Files:**
- Create: `src/components/FlameCard.tsx`

- [ ] **Step 28: 创建 FlameCard 组件**

```tsx
import { useNavigate } from 'react-router-dom'
import type { Flame } from '@/types'

interface FlameCardProps {
  flame: Flame
  onDelete?: (id: string) => void
  showPrairie?: boolean
}

export function FlameCard({ flame, onDelete, showPrairie }: FlameCardProps) {
  const navigate = useNavigate()

  const handleComplete = () => {
    navigate(`/prairie/flame/${flame.id}/complete`)
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-fire-flame">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-100">{flame.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${
          flame.status === 'burning'
            ? 'bg-orange-500/20 text-orange-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {flame.status === 'burning' ? '燃烧中' : '已燃尽'}
        </span>
      </div>

      {flame.description && (
        <p className="text-sm text-gray-400 mb-2">{flame.description}</p>
      )}

      <p className="text-xs text-gray-500 mb-3">探索口令: {flame.searchPhrase}</p>

      <div className="flex gap-2">
        {flame.status === 'burning' && (
          <button
            onClick={handleComplete}
            className="bg-fire-flame text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition"
          >
            完成燃烧
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(flame.id)}
            className="text-gray-500 hover:text-red-400 text-sm"
          >
            删除
          </button>
        )}
      </div>
    </div>
  )
}
```

### 3.4 PrairieSelector 组件

**Files:**
- Create: `src/components/PrairieSelector.tsx`

- [ ] **Step 29: 创建 PrairieSelector 组件**

```tsx
import { useState, useEffect } from 'react'
import { usePrairieStore } from '@/stores/prairieStore'

interface PrairieSelectorProps {
  value?: string
  onChange: (prairieId: string | null, isNew: boolean) => void
}

export function PrairieSelector({ value, onChange }: PrairieSelectorProps) {
  const [input, setInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { prairies, fetchPrairies, addPrairie } = usePrairieStore()

  useEffect(() => {
    fetchPrairies()
  }, [])

  const filteredPrairies = prairies.filter(p =>
    p.name.toLowerCase().includes(input.toLowerCase())
  )

  const handleSelect = (prairieId: string) => {
    onChange(prairieId, false)
    setInput('')
  }

  const handleCreate = async () => {
    if (!input.trim()) return
    setIsCreating(true)
    try {
      const prairie = await addPrairie(input.trim())
      onChange(prairie.id, true)
      setInput('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="选择草原或输入新名称..."
        className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-prairie"
      />

      {input && filteredPrairies.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-bg-secondary rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredPrairies.map((prairie) => (
            <li key={prairie.id}>
              <button
                onClick={() => handleSelect(prairie.id)}
                className="w-full text-left px-4 py-2 text-gray-100 hover:bg-bg-card transition"
              >
                {prairie.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {input && (
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="mt-2 w-full bg-fire-prairie text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-teal-600 transition"
        >
          {isCreating ? '创建中...' : `创建新草原 "${input}"`}
        </button>
      )}
    </div>
  )
}
```

### 3.5 更新 PrairiePage

- [ ] **Step 30: 更新 PrairiePage**

```tsx
import { useEffect, useState } from 'react'
import { useFlameStore } from '@/stores/flameStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { FlameCard } from '@/components/FlameCard'
import { BottomNav } from '@/components/BottomNav'
import { CreateFlamePage } from './CreateFlamePage'
import { useNavigate } from 'react-router-dom'

export function PrairiePage() {
  const { wildFlames, fetchWildFlames, deleteFlame } = useFlameStore()
  const { prairies, archivedPrairies, fetchPrairies, fetchArchivedPrairies, archivePrairie, restorePrairie } = usePrairieStore()
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
              <FlameCard key={flame.id} flame={flame} onDelete={deleteFlame} />
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
                      onClick={() => restorePrairie(prairie.id)}
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
```

### 3.6 CreateFlamePage

**Files:**
- Create: `src/pages/CreateFlamePage.tsx`

- [ ] **Step 31: 创建 CreateFlamePage**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'
import { PrairieSelector } from '@/components/PrairieSelector'

export function CreateFlamePage() {
  const navigate = useNavigate()
  const { addFlame } = useFlameStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [searchPhrase, setSearchPhrase] = useState('')
  const [recommendationReason, setRecommendationReason] = useState('')
  const [prairieId, setPrairieId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !searchPhrase.trim()) return

    await addFlame({
      title: title.trim(),
      description: description.trim() || undefined,
      searchPhrase: searchPhrase.trim(),
      recommendationReason: recommendationReason.trim() || '手动创建',
      status: 'burning',
      prairieId: prairieId || undefined,
      userRecord: '',
    })

    navigate('/prairie')
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400">←</button>
        <h1 className="text-xl font-bold">手动创建烈焰</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-flame"
            placeholder="例如：读《咖啡的世界》"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">描述（可选）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-flame resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">探索口令 *</label>
          <input
            type="text"
            value={searchPhrase}
            onChange={(e) => setSearchPhrase(e.target.value)}
            className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-flame"
            placeholder="可在B站/知乎等平台搜索的关键词"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">推荐理由</label>
          <input
            type="text"
            value={recommendationReason}
            onChange={(e) => setRecommendationReason(e.target.value)}
            className="w-full bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-flame"
            placeholder="为什么推荐这个行动？"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">归入草原</label>
          <PrairieSelector
            value={prairieId || undefined}
            onChange={(id, isNew) => setPrairieId(id)}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!title.trim() || !searchPhrase.trim()}
            className="w-full bg-fire-flame text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            创建烈焰
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 3.7 P2 提交

- [ ] **Step 32: 提交 P2**

```bash
git add .
git commit -m "feat(P2): add Flame CRUD, Prairie CRUD, prairie archive/restore, CreateFlamePage"
```

---

## Chunk 4: P3 - 点燃三步向导、点燃AI接口、平台跳转

### 4.1 Cloudflare Worker AI 代理

**Files:**
- Create: `worker/index.ts`
- Create: `worker/wrangler.toml`

- [ ] **Step 33: 创建 Worker 入口文件**

```typescript
export interface Env {
  MINIMAX_KEY: string
}

const AI_ENDPOINTS: Record<string, string> = {
  '/api/ai/ignite': 'ignite',
  '/api/ai/rekindle': 'rekindle',
  '/api/ai/organize': 'organize',
  '/api/ai/explore': 'explore',
  '/api/ai/seed-buffer': 'seed-buffer',
}

const PROMPTS: Record<string, (body: any) => string> = {
  ignite: (body) => `
用户有一个想法或问题，想把它变成具体的探索行动。请按以下三步帮助用户：
第一步：为这个想法生成3-5个不同的探索视角。视角类型可以包括：读一本书或文章、看一个视频或纪录片、写一篇自己的思考、找人讨论或采访、动手实践或体验。
第二步：为每个视角推荐一个具体的、低门槛的第一步行动建议。每个行动附上一个可在B站、知乎、小红书等平台搜索的自然语言短语。
第三步：汇总为一份行动草稿。
用户的想法：${body.sparkContent}
用户已有的草原：${body.existingPrairies?.join(', ') || '无'}
返回格式（严格JSON，不要任何额外文字）：
{
  "perspectives": [
    {
      "type": "视角类型",
      "description": "视角描述",
      "firstStep": "具体的第一步行动建议",
      "searchPhrase": "可在内容平台搜索的自然语言短语"
    }
  ],
  "suggestedPrairie": "从已有草原中选最匹配的，或null",
  "newPrairieSuggestion": "若都不匹配，建议新草原名（简要具体），或null"
}
`,
  rekindle: (body) => `
用户完成了一个探索任务，并写下了感想。请生成3个新的问题或灵感，帮助用户继续探索相关方向。
任务标题：${body.taskTitle}
任务描述：${body.taskDescription || ''}
用户感想：${body.userRecord || ''}
所属草原：${body.sourcePrairie || ''}
每个新问题或灵感应该：
- 与用户的探索内容紧密相关
- 提供新的视角或切入点
- 是用户可以进一步探索的方向
- 1-2句话，自然、流畅
返回格式（严格JSON，不要任何额外文字）：
{
  "newQuestions": ["问题1", "问题2", "问题3"]
}
`,
}

async function handleAIRequest(path: string, body: any, env: Env): Promise<Response> {
  const promptBuilder = PROMPTS[path]
  if (!promptBuilder) {
    return new Response(JSON.stringify({ error: 'Unknown endpoint' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const prompt = promptBuilder(body)

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletions_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.MINIMAX_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim()

    return new Response(content, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname.startsWith('/api/ai/') && request.method === 'POST') {
      const body = await request.json()
      const endpoint = pathname.replace('/api/ai/', '')
      return handleAIRequest(endpoint, body, env)
    }

    return new Response('Not Found', { status: 404 })
  },
}
```

- [ ] **Step 34: 创建 wrangler.toml**

```toml
name = "ignite-worker"
main = "index.ts"
compatibility_date = "2024-01-01"

[vars]
```

### 4.2 AI Service 客户端

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 35: 创建 AI API 客户端**

```typescript
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'

interface IgniteRequest {
  sparkContent: string
  existingPrairies: string[]
}

interface Perspective {
  type: string
  description: string
  firstStep: string
  searchPhrase: string
}

interface IgniteResponse {
  perspectives: Perspective[]
  suggestedPrairie: string | null
  newPrairieSuggestion: string | null
}

interface RekindleRequest {
  taskTitle: string
  taskDescription?: string
  userRecord: string
  sourcePrairie: string
}

interface RekindleResponse {
  newQuestions: string[]
}

async function apiRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${WORKER_URL}/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Invalid JSON response')
  }
}

export const aiApi = {
  ignite: (body: IgniteRequest) => apiRequest<IgniteResponse>('ignite', body),
  rekindle: (body: RekindleRequest) => apiRequest<RekindleResponse>('rekindle', body),
}
```

### 4.3 KindleWizard 三步向导

**Files:**
- Create: `src/pages/KindleWizard.tsx`
- Create: `src/components/PerspectiveCard.tsx`
- Create: `src/components/PlatformJumpPanel.tsx`

- [ ] **Step 36: 创建 PerspectiveCard 组件**

```tsx
import type { Perspective } from '@/lib/api'

interface PerspectiveCardProps {
  perspective: Perspective
  selected: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<Perspective>) => void
}

export function PerspectiveCard({ perspective, selected, onToggle, onUpdate }: PerspectiveCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition cursor-pointer ${
        selected
          ? 'border-fire-spark bg-fire-spark/10'
          : 'border-gray-700 bg-bg-secondary hover:border-gray-500'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">
          {perspective.type === '阅读' ? '📚' :
           perspective.type === '观看' ? '🎬' :
           perspective.type === '实践' ? '🔧' :
           perspective.type === '讨论' ? '💬' : '💡'}
        </span>
        <span className="font-medium text-gray-100">{perspective.type}</span>
        {selected && <span className="ml-auto text-fire-spark">✓</span>}
      </div>

      <p className="text-sm text-gray-400 mb-3">{perspective.description}</p>

      {selected && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
          <div>
            <label className="text-xs text-gray-500">第一步行动</label>
            <input
              type="text"
              value={perspective.firstStep}
              onChange={(e) => onUpdate({ firstStep: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-bg-primary rounded p-2 text-sm text-gray-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">探索口令</label>
            <input
              type="text"
              value={perspective.searchPhrase}
              onChange={(e) => onUpdate({ searchPhrase: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-bg-primary rounded p-2 text-sm text-gray-100 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 37: 创建 PlatformJumpPanel 组件**

```tsx
import { PLATFORM_URLS } from '@/lib/platforms'

interface PlatformJumpPanelProps {
  searchPhrase: string
  onClose: () => void
}

export function PlatformJumpPanel({ searchPhrase, onClose }: PlatformJumpPanelProps) {
  const handleJump = (platform: string) => {
    const url = PLATFORM_URLS[platform] + encodeURIComponent(searchPhrase)
    window.open(url, '_blank')
  }

  const platforms = [
    { name: 'B站', icon: '📺' },
    { name: '知乎', icon: '💬' },
    { name: '小红书', icon: '📕' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'Google', icon: '🔍' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-2">探索口令</h3>
        <p className="text-sm text-gray-400 mb-4 break-all">{searchPhrase}</p>
        <p className="text-xs text-gray-500 mb-4">已复制到剪贴板，点击图标跳转</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={() => handleJump(p.name)}
              className="flex flex-col items-center p-3 bg-bg-card rounded-lg hover:bg-gray-700 transition"
            >
              <span className="text-2xl mb-1">{p.icon}</span>
              <span className="text-xs text-gray-300">{p.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full text-gray-400 hover:text-white py-2"
        >
          关闭
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 38: 创建 src/lib/platforms.ts**

```typescript
export const PLATFORM_URLS: Record<string, string> = {
  'B站': 'https://search.bilibili.com/all?keyword=',
  '知乎': 'https://www.zhihu.com/search?type=content&q=',
  '小红书': 'https://www.xiaohongshu.com/search_result?keyword=',
  'YouTube': 'https://www.youtube.com/results?search_query=',
  'Apple 播客': 'https://podcasts.apple.com/search?term=',
  'Google': 'https://www.google.com/search?q=',
}
```

- [ ] **Step 39: 创建 KindleWizard 页面**

```tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PerspectiveCard } from '@/components/PerspectiveCard'
import { PlatformJumpPanel } from '@/components/PlatformJumpPanel'
import { PrairieSelector } from '@/components/PrairieSelector'
import { useFlameStore } from '@/stores/flameStore'
import { useSparkStore } from '@/stores/sparkStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { aiApi } from '@/lib/api'
import type { Perspective } from '@/lib/api'

type Step = 1 | 2 | 3

interface FlameDraft {
  title: string
  description: string
  firstStep: string
  searchPhrase: string
  type: string
  selected: boolean
}

export function KindleWizard() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const { sparks } = useSparkStore()
  const { addFlame } = useFlameStore()
  const { prairies, fetchPrairies } = usePrairieStore()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [perspectives, setPerspectives] = useState<Perspective[]>([])
  const [drafts, setDrafts] = useState<FlameDraft[]>([])
  const [prairieId, setPrairieId] = useState<string | null>(null)
  const [showPlatformPanel, setShowPlatformPanel] = useState(false)
  const [createdSearchPhrases, setCreatedSearchPhrases] = useState<string[]>([])

  const spark = sparks.find(s => s.id === sparkId)

  useEffect(() => {
    fetchPrairies()
    if (sparkId) {
      loadPerspectives()
    }
  }, [sparkId])

  const loadPerspectives = async () => {
    if (!spark) return
    setLoading(true)
    setError(null)

    try {
      const prairieNames = prairies.map(p => p.name)
      const response = await aiApi.ignite({
        sparkContent: spark.content,
        existingPrairies: prairieNames,
      })

      setPerspectives(response.perspectives)
      setDrafts(response.perspectives.map(p => ({
        title: `${p.type}: ${spark.content.slice(0, 20)}`,
        description: p.description,
        firstStep: p.firstStep,
        searchPhrase: p.searchPhrase,
        type: p.type,
        selected: true,
      })))
    } catch (err) {
      setError('AI辅助暂时不可用，请手动创建')
      setDrafts([{
        title: spark.content.slice(0, 30),
        description: '',
        firstStep: '',
        searchPhrase: '',
        type: '手动',
        selected: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const toggleDraft = (index: number) => {
    setDrafts(drafts.map((d, i) =>
      i === index ? { ...d, selected: !d.selected } : d
    ))
  }

  const updateDraft = (index: number, updates: Partial<FlameDraft>) => {
    setDrafts(drafts.map((d, i) =>
      i === index ? { ...d, ...updates } : d
    ))
  }

  const handleConfirm = async () => {
    const selectedDrafts = drafts.filter(d => d.selected)
    if (selectedDrafts.length === 0) return

    const batchId = crypto.randomUUID()
    const searchPhrases: string[] = []

    for (const draft of selectedDrafts) {
      await addFlame({
        title: draft.title,
        description: draft.description,
        firstStep: draft.firstStep,
        searchPhrase: draft.searchPhrase,
        recommendationReason: `${draft.type}视角`,
        status: 'burning',
        prairieId: prairieId || undefined,
        sourceSparkId: sparkId,
        igniteBatchId: batchId,
        userRecord: '',
      })
      searchPhrases.push(draft.searchPhrase)
    }

    if (searchPhrases.length > 0) {
      await navigator.clipboard.writeText(searchPhrases[0])
      setCreatedSearchPhrases(searchPhrases)
      setShowPlatformPanel(true)
    } else {
      navigate('/prairie')
    }
  }

  const handleClosePanel = () => {
    setShowPlatformPanel(false)
    navigate('/prairie')
  }

  if (!spark) {
    return <div className="p-4">火种不存在</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400">←</button>
        <h1 className="text-xl font-bold">点燃</h1>
        <span className="text-sm text-gray-500">第 {step}/3 步</span>
      </header>

      <main className="p-4">
        {step === 1 && (
          <div>
            <h2 className="text-lg mb-4">选择探索视角</h2>
            <p className="text-sm text-gray-400 mb-4">为 "{spark.content}" 选择探索方向</p>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">AI正在分析中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
                <button onClick={() => setStep(3)} className="mt-4 text-fire-flame underline">
                  跳过，直接创建
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft, index) => (
                  <PerspectiveCard
                    key={index}
                    perspective={{ type: draft.type, description: draft.description, firstStep: draft.firstStep, searchPhrase: draft.searchPhrase }}
                    selected={draft.selected}
                    onToggle={() => toggleDraft(index)}
                    onUpdate={(updates) => updateDraft(index, updates)}
                  />
                ))}
                <button
                  onClick={() => setStep(2)}
                  disabled={!drafts.some(d => d.selected)}
                  className="w-full mt-4 bg-fire-spark text-white py-3 rounded-lg disabled:opacity-50"
                >
                  下一步
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg mb-4">确认行动</h2>
            <div className="space-y-3">
              {drafts.filter(d => d.selected).map((draft, index) => (
                <div key={index} className="bg-bg-secondary rounded-lg p-4">
                  <h3 className="font-medium mb-2">{draft.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{draft.firstStep}</p>
                  <input
                    type="text"
                    value={draft.searchPhrase}
                    onChange={(e) => {
                      const idx = drafts.findIndex(d => d === draft)
                      updateDraft(idx, { searchPhrase: e.target.value })
                    }}
                    placeholder="修改探索口令..."
                    className="w-full bg-bg-primary rounded p-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-600 py-3 rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-fire-flame text-white py-3 rounded-lg"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg mb-4">选择草原</h2>
            <p className="text-sm text-gray-400 mb-4">将创建的烈焰归入哪个草原？</p>

            <PrairieSelector
              value={prairieId || undefined}
              onChange={(id) => setPrairieId(id)}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-600 py-3 rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={handleConfirm}
                disabled={drafts.filter(d => d.selected).length === 0}
                className="flex-1 bg-fire-flame text-white py-3 rounded-lg disabled:opacity-50"
              >
                完成
              </button>
            </div>
          </div>
        )}
      </main>

      {showPlatformPanel && createdSearchPhrases.length > 0 && (
        <PlatformJumpPanel
          searchPhrase={createdSearchPhrases[0]}
          onClose={handleClosePanel}
        />
      )}
    </div>
  )
}
```

### 4.4 更新路由

- [ ] **Step 40: 更新 App.tsx 添加 KindleWizard 路由**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { KindleWizard } from '@/pages/KindleWizard'
import { CreateFlamePage } from '@/pages/CreateFlamePage'
import { FlameDetailPage } from '@/pages/FlameDetailPage'
import { CompleteBurningPage } from '@/pages/CompleteBurningPage'
import { RekindlePage } from '@/pages/RekindlePage'

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/hearth/kindle/:sparkId" element={<KindleWizard />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/flame/create" element={<CreateFlamePage />} />
        <Route path="/prairie/flame/:id" element={<FlameDetailPage />} />
        <Route path="/prairie/flame/:id/complete" element={<CompleteBurningPage />} />
        <Route path="/prairie/flame/:id/rekindle" element={<RekindlePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </div>
  )
}

export default App
```

### 4.5 P3 提交

- [ ] **Step 41: 提交 P3**

```bash
git add .
git commit -m "feat(P3): add Cloudflare Worker AI proxy, KindleWizard 3-step flow, PlatformJumpPanel"
```

---

## Chunk 5: P4 - 完成燃烧页面、取火接口、取火页完整交互

### 5.1 CompleteBurningPage

**Files:**
- Create: `src/pages/CompleteBurningPage.tsx`

- [ ] **Step 42: 创建 CompleteBurningPage**

```tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFlameStore } from '@/stores/flameStore'

export function CompleteBurningPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { flames, updateFlame } = useFlameStore()
  const [userRecord, setUserRecord] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const flame = flames.find(f => f.id === id)

  useEffect(() => {
    if (!flame && id) {
      // 需要从 DB 加载
    }
  }, [id, flame])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSubmitting(true)
    try {
      await updateFlame(id, {
        status: 'burned',
        userRecord: userRecord.trim(),
        completedAt: Date.now(),
      })

      // 检查取火限制
      const currentFlame = await import('@/lib/db').then(m => m.db.flames.get(id))
      if (currentFlame) {
        const rekindleCount = currentFlame.rekindleCount || 0
        if (rekindleCount < 10) {
          navigate(`/prairie/flame/${id}/rekindle`)
        } else {
          navigate('/prairie')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!flame) {
    return <div className="p-4">烈焰不存在</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">完成燃烧</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-bg-secondary rounded-lg p-4">
          <h2 className="font-medium mb-2">{flame.title}</h2>
          {flame.description && (
            <p className="text-sm text-gray-400">{flame.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            记录你的感想（必填，可为空格）
          </label>
          <textarea
            value={userRecord}
            onChange={(e) => setUserRecord(e.target.value)}
            placeholder="这次探索给你带来了什么？"
            className="w-full bg-bg-secondary rounded-lg p-4 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-fire-flame"
            rows={6}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-fire-flame text-white py-3 rounded-lg disabled:opacity-50 font-medium"
        >
          {submitting ? '保存中...' : '保存并取火'}
        </button>
      </form>
    </div>
  )
}
```

### 5.2 RekindlePage

**Files:**
- Create: `src/pages/RekindlePage.tsx`
- Create: `src/components/RekindleSparkCard.tsx`

- [ ] **Step 43: 创建 RekindleSparkCard 组件**

```tsx
import { useState } from 'react'

interface RekindleSparkCardProps {
  content: string
  onRetain: () => void
  onDiscard: () => void
}

export function RekindleSparkCard({ content, onRetain, onDiscard }: RekindleSparkCardProps) {
  const [retained, setRetained] = useState(false)

  const handleRetain = () => {
    setRetained(true)
    onRetain()
  }

  return (
    <div className={`bg-bg-secondary rounded-lg p-4 border-l-4 ${retained ? 'border-fire-spark' : 'border-gray-700'}`}>
      <p className="text-gray-100 mb-4">{content}</p>
      <div className="flex gap-3">
        <button
          onClick={handleRetain}
          disabled={retained}
          className={`flex-1 py-2 rounded text-sm font-medium transition ${
            retained
              ? 'bg-fire-spark text-white'
              : 'border border-fire-spark text-fire-spark hover:bg-fire-spark/10'
          }`}
        >
          {retained ? '已保留' : '保留'}
        </button>
        <button
          onClick={onDiscard}
          disabled={retained}
          className="flex-1 border border-gray-600 text-gray-400 py-2 rounded text-sm hover:bg-gray-700 transition disabled:opacity-50"
        >
          丢弃
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 44: 创建 RekindlePage**

```tsx
import { useState, useEffect, useReducer } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSparkStore } from '@/stores/sparkStore'
import { useFlameStore } from '@/stores/flameStore'
import { RekindleSparkCard } from '@/components/RekindleSparkCard'
import { aiApi } from '@/lib/api'
import { db, generateId } from '@/lib/db'
import type { Flame } from '@/types'
import type { Spark } from '@/types'

interface RekindleState {
  aiSparks: string[]
  manualSpark: string
  retainedIds: string[]
  loading: boolean
  error: string | null
  cooldown: number
}

type RekindleAction =
  | { type: 'SET_AI_SPARKS'; payload: string[] }
  | { type: 'SET_MANUAL_SPARK'; payload: string }
  | { type: 'ADD_RETAINED'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TICK_COOLDOWN' }
  | { type: 'RESET' }

function rekindleReducer(state: RekindleState, action: RekindleAction): RekindleState {
  switch (action.type) {
    case 'SET_AI_SPARKS':
      return { ...state, aiSparks: action.payload, error: null }
    case 'SET_MANUAL_SPARK':
      return { ...state, manualSpark: action.payload }
    case 'ADD_RETAINED':
      return { ...state, retainedIds: [...state.retainedIds, action.payload] }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'TICK_COOLDOWN':
      return { ...state, cooldown: Math.max(0, state.cooldown - 1) }
    case 'RESET':
      return { ...state, aiSparks: [], retainedIds: [], loading: false, error: null }
    default:
      return state
  }
}

export function RekindlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addSpark } = useSparkStore()
  const { updateFlame, flames } = useFlameStore()
  const [flame, setFlame] = useState<Flame | null>(null)
  const [state, dispatch] = useReducer(rekindleReducer, {
    aiSparks: [],
    manualSpark: '',
    retainedIds: [],
    loading: false,
    error: null,
    cooldown: 0,
  })

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(f => {
        if (f) setFlame(f)
      })
    }
  }, [id])

  useEffect(() => {
    if (state.cooldown > 0) {
      const timer = setTimeout(() => dispatch({ type: 'TICK_COOLDOWN' }), 1000)
      return () => clearTimeout(timer)
    }
  }, [state.cooldown])

  const canRekindle = flame && flame.rekindleCount < 10 && state.cooldown === 0

  const handleRekindle = async () => {
    if (!canRekindle || !flame) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'RESET' })

    try {
      const response = await aiApi.rekindle({
        taskTitle: flame.title,
        taskDescription: flame.description || '',
        userRecord: flame.userRecord,
        sourcePrairie: flame.prairieId || '',
      })

      dispatch({ type: 'SET_AI_SPARKS', payload: response.newQuestions })
      dispatch({ type: 'SET_COOLDOWN', payload: 5 })

      // 更新取火次数
      await updateFlame(flame.id, {
        rekindleCount: flame.rekindleCount + 1,
        lastRekindleTime: Date.now(),
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'AI暂时无法取火，你可以手动创建火种' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleRetainSpark = async (content: string) => {
    const spark = await addSpark(content, 'ai_rekindle')
    if (flame) {
      await db.sparks.update(spark.id, {
        sourceFlameId: flame.id,
        sourcePrairieId: flame.prairieId,
      })
    }
    dispatch({ type: 'ADD_RETAINED', payload: spark.id })
  }

  const handleAddManualSpark = async () => {
    if (!state.manualSpark.trim() || !flame) return

    const spark = await addSpark(state.manualSpark.trim(), 'user')
    await db.sparks.update(spark.id, {
      sourceFlameId: flame.id,
      sourcePrairieId: flame.prairieId,
    })
    dispatch({ type: 'SET_MANUAL_SPARK', payload: '' })
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">取火</h1>
        <p className="text-sm text-gray-400">从 {flame?.title} 中获得新灵感</p>
      </header>

      <main className="p-4 space-y-6">
        {/* 手动创建火种 */}
        <section>
          <h2 className="text-sm text-gray-400 mb-2">手动添加火种</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={state.manualSpark}
              onChange={(e) => dispatch({ type: 'SET_MANUAL_SPARK', payload: e.target.value })}
              placeholder="写下你的灵感..."
              className="flex-1 bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-spark"
            />
            <button
              onClick={handleAddManualSpark}
              disabled={!state.manualSpark.trim()}
              className="bg-fire-spark text-white px-4 rounded-lg disabled:opacity-50"
            >
              添加
            </button>
          </div>
        </section>

        {/* AI 取火 */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm text-gray-400">AI 生成的火种</h2>
            <button
              onClick={handleRekindle}
              disabled={!canRekindle || state.loading}
              className="text-sm text-fire-flame hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading
                ? '取火中...'
                : state.cooldown > 0
                ? `重新取火 (${state.cooldown}s)`
                : '重新取火'}
            </button>
          </div>

          {state.error && (
            <p className="text-red-400 text-sm mb-4">{state.error}</p>
          )}

          {state.loading && (
            <div className="text-center py-8">
              <p className="text-gray-400">AI正在帮你取火中...</p>
            </div>
          )}

          {!state.loading && state.aiSparks.length === 0 && !state.error && (
            <div className="text-center py-8 text-gray-500">
              <p>点击上方按钮获取3粒新火种</p>
              <p className="text-sm mt-1">已取火 {flame?.rekindleCount || 0}/10 次</p>
            </div>
          )}

          <div className="space-y-3">
            {state.aiSparks.map((spark, index) => (
              <RekindleSparkCard
                key={index}
                content={spark}
                onRetain={() => handleRetainSpark(spark)}
                onDiscard={() => {}}
              />
            ))}
          </div>
        </section>

        {/* 完成 */}
        <button
          onClick={() => navigate('/prairie')}
          className="w-full border border-gray-600 py-3 rounded-lg text-gray-300"
        >
          完成
        </button>
      </main>
    </div>
  )
}
```

### 5.3 FlameDetailPage

**Files:**
- Create: `src/pages/FlameDetailPage.tsx`

- [ ] **Step 45: 创建 FlameDetailPage**

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { Flame } from '@/types'

export function FlameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [flame, setFlame] = useState<Flame | null>(null)

  useEffect(() => {
    if (id) {
      db.flames.get(id).then(f => {
        if (f) setFlame(f)
      })
    }
  }, [id])

  if (!flame) {
    return <div className="p-4">加载中...</div>
  }

  const handleComplete = () => {
    navigate(`/prairie/flame/${id}/complete`)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400">←</button>
        <h1 className="text-xl font-bold">烈焰详情</h1>
      </header>

      <main className="p-4">
        <div className="bg-bg-secondary rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-medium">{flame.title}</h2>
            <span className={`text-xs px-2 py-1 rounded ${
              flame.status === 'burning'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {flame.status === 'burning' ? '燃烧中' : '已燃尽'}
            </span>
          </div>

          {flame.description && (
            <p className="text-gray-400 mb-4">{flame.description}</p>
          )}

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">推荐理由：</span>
              <span>{flame.recommendationReason}</span>
            </div>
            <div>
              <span className="text-gray-500">探索口令：</span>
              <span className="text-fire-flame">{flame.searchPhrase}</span>
            </div>
            <div>
              <span className="text-gray-500">创建时间：</span>
              <span>{new Date(flame.createdAt).toLocaleString()}</span>
            </div>
            {flame.completedAt && (
              <div>
                <span className="text-gray-500">完成时间：</span>
                <span>{new Date(flame.completedAt).toLocaleString()}</span>
              </div>
            )}
            {flame.status === 'burned' && flame.userRecord && (
              <div>
                <span className="text-gray-500">感想：</span>
                <p className="mt-1 text-gray-300">{flame.userRecord || '默默燃尽'}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">已取火：</span>
              <span>{flame.rekindleCount}/10 次</span>
            </div>
          </div>
        </div>

        {flame.status === 'burning' && (
          <button
            onClick={handleComplete}
            className="w-full bg-fire-flame text-white py-3 rounded-lg font-medium"
          >
            完成燃烧
          </button>
        )}

        {flame.status === 'burned' && flame.rekindleCount < 10 && (
          <button
            onClick={() => navigate(`/prairie/flame/${id}/rekindle`)}
            className="w-full bg-fire-spark text-white py-3 rounded-lg font-medium"
          >
            再取一次火
          </button>
        )}
      </main>
    </div>
  )
}
```

### 5.6 P4 提交

- [ ] **Step 46: 提交 P4**

```bash
git add .
git commit -m "feat(P4): add CompleteBurningPage, RekindlePage with cooldown/limit, FlameDetailPage"
```

---

## Chunk 6: P5 - 整理接口、整理页交互

### 6.1 OrganizePage

**Files:**
- Create: `src/pages/OrganizePage.tsx`

- [ ] **Step 47: 创建 OrganizePage**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { usePrairieStore } from '@/stores/prairieStore'
import { aiApi } from '@/lib/api'

interface OrganizeSuggestion {
  action: 'merge' | 'create'
  flameIndices: number[]
  targetPrairie?: string
  newPrairieName?: string
  reason: string
}

export function OrganizePage() {
  const navigate = useNavigate()
  const { prairies, fetchPrairies, addPrairie } = usePrairieStore()
  const [wildFlames, setWildFlames] = useState<{ id: string; title: string }[]>([])
  const [suggestions, setSuggestions] = useState<OrganizeSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'overview' | 'confirm'>('overview')
  const [currentSuggestion, setCurrentSuggestion] = useState<OrganizeSuggestion | null>(null)

  useEffect(() => {
    loadWildFlames()
  }, [])

  const loadWildFlames = async () => {
    const flames = await db.flames
      .where({ prairieId: null, isDeleted: false })
      .toArray()
    setWildFlames(flames.map(f => ({ id: f.id, title: f.title })))
  }

  const handleAnalyze = async () => {
    if (wildFlames.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const prairieNames = prairies.map(p => p.name)
      // 简化版：实际应调用 /api/ai/organize
      const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/api/ai/organize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unclassifiedTasks: wildFlames.map(f => ({ title: f.title })),
          existingPrairies: prairieNames,
        }),
        signal: AbortSignal.timeout(10000),
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError('整理暂不可用，请手动归类')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSuggestion = async (suggestion: OrganizeSuggestion) => {
    if (suggestion.action === 'merge' && suggestion.targetPrairie) {
      // 找到目标草原 ID
      const prairie = prairies.find(p => p.name === suggestion.targetPrairie)
      if (prairie) {
        // 更新关联烈焰
        for (const idx of suggestion.flameIndices) {
          await db.flames.update(wildFlames[idx].id, { prairieId: prairie.id })
        }
      }
    } else if (suggestion.action === 'create' && suggestion.newPrairieName) {
      // 创建新草原并关联
      const prairie = await addPrairie(suggestion.newPrairieName)
      for (const idx of suggestion.flameIndices) {
        await db.flames.update(wildFlames[idx].id, { prairieId: prairie.id })
      }
    }

    await loadWildFlames()
    setCurrentStep('overview')
    setCurrentSuggestion(null)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400">←</button>
        <h1 className="text-xl font-bold">整理</h1>
      </header>

      <main className="p-4">
        {wildFlames.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>没有需要整理的野火</p>
          </div>
        ) : currentStep === 'overview' ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              发现 {wildFlames.length} 团野火，分析归类建议...
            </p>

            {suggestions.length === 0 && !loading && (
              <button
                onClick={handleAnalyze}
                className="w-full bg-fire-prairie text-white py-3 rounded-lg font-medium"
              >
                开始整理
              </button>
            )}

            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-400">AI分析中...</p>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-4">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="bg-bg-secondary rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        {s.action === 'merge' ? (
                          <span className="text-fire-prairie">
                            归入「{s.targetPrairie}」
                          </span>
                        ) : (
                          <span className="text-fire-flame">
                            创建新草原「{s.newPrairieName}」
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{s.reason}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {s.flameIndices.length} 团
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentSuggestion(s)
                        setCurrentStep('confirm')
                      }}
                      className="text-sm text-fire-prairie hover:underline"
                    >
                      查看详情 →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentStep('overview')}
              className="text-sm text-gray-400 mb-4"
            >
              ← 返回总览
            </button>

            {currentSuggestion && (
              <>
                <h2 className="font-medium mb-4">
                  {currentSuggestion.action === 'merge'
                    ? `归入「${currentSuggestion.targetPrairie}」`
                    : `创建「${currentSuggestion.newPrairieName}」`}
                </h2>

                <p className="text-sm text-gray-400 mb-4">{currentSuggestion.reason}</p>

                <div className="space-y-2 mb-6">
                  {currentSuggestion.flameIndices.map(idx => (
                    <div key={idx} className="bg-bg-card rounded p-3">
                      {wildFlames[idx]?.title}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirmSuggestion(currentSuggestion)}
                    className="flex-1 bg-fire-prairie text-white py-3 rounded-lg font-medium"
                  >
                    确认归入
                  </button>
                  <button
                    onClick={() => setCurrentStep('overview')}
                    className="flex-1 border border-gray-600 py-3 rounded-lg"
                  >
                    跳过
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
```

### 6.2 P5 提交

- [ ] **Step 48: 提交 P5**

```bash
git add .
git commit -m "feat(P5): add OrganizePage with AI suggestions workflow"
```

---

## Chunk 7: P6 - 探索页、探索接口

### 7.1 ExplorePage

**Files:**
- Create: `src/pages/ExplorePage.tsx`
- Create: `src/components/ExploreSparkCard.tsx`

- [ ] **Step 49: 创建 ExploreSparkCard 组件**

```tsx
import { useNavigate } from 'react-router-dom'
import type { Spark } from '@/types'

interface ExploreSparkCardProps {
  spark: { content: string; type: string }
  onAddToHearth: () => void
  onKindle?: () => void
}

export function ExploreSparkCard({ spark, onAddToHearth, onKindle }: ExploreSparkCardProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-fire-spark">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-fire-spark/20 text-fire-spark">
          {spark.type}
        </span>
      </div>
      <p className="text-gray-100 mb-3">{spark.content}</p>
      <div className="flex gap-2">
        <button
          onClick={onAddToHearth}
          className="flex-1 border border-fire-spark text-fire-spark py-2 rounded text-sm hover:bg-fire-spark/10 transition"
        >
          加入火盆
        </button>
        {onKindle && (
          <button
            onClick={onKindle}
            className="flex-1 bg-fire-spark text-white py-2 rounded text-sm hover:bg-orange-600 transition"
          >
            点燃
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 50: 更新 ExplorePage**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExploreSparkCard } from '@/components/ExploreSparkCard'
import { BottomNav } from '@/components/BottomNav'
import { useSparkStore } from '@/stores/sparkStore'
import { usePrairieStore } from '@/stores/prairieStore'
import { aiApi } from '@/lib/api'

export function ExplorePage() {
  const navigate = useNavigate()
  const { addSpark } = useSparkStore()
  const { prairies, fetchPrairies } = usePrairieStore()
  const [query, setQuery] = useState('')
  const [exploringSparks, setExploringSparks] = useState<{ content: string; type: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchPrairies()
  }, [])

  const handleExplore = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const prairieNames = prairies.map(p => p.name)
      const response = await aiApi.explore({
        query: query.trim(),
        existingPrairies: prairieNames,
      })
      setExploringSparks(response.sparks)
    } catch (err) {
      console.error('探索失败', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToHearth = async (content: string, index: number) => {
    await addSpark(content, 'ai_explore')
    setAddedIds(new Set([...addedIds, index]))
  }

  const handleKindle = (content: string) => {
    // 先添加到火盆，然后跳转到点燃向导
    addSpark(content, 'ai_explore').then(spark => {
      navigate(`/hearth/kindle/${spark.id}`)
    })
  }

  // 预设推荐
  const recommendations = [
    { content: '尝试一门新的手工艺', type: '实践' },
    { content: '了解一个你从未注意过的城市角落', type: '探索' },
    { content: '学习一首你喜欢但听不懂歌词的歌', type: '音乐' },
  ]

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-fire-flame">探索</h1>
        <p className="text-sm text-gray-400">主动探索入口</p>
      </header>

      <main className="p-4">
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
              placeholder="输入关键词或问题开始探索..."
              className="flex-1 bg-bg-secondary rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-fire-flame"
            />
            <button
              onClick={handleExplore}
              disabled={!query.trim() || loading}
              className="bg-fire-flame text-white px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? '...' : '探索'}
            </button>
          </div>
        </div>

        {exploringSparks.length > 0 ? (
          <div className="space-y-3">
            {exploringSparks.map((spark, index) => (
              <ExploreSparkCard
                key={index}
                spark={spark}
                onAddToHearth={() => handleAddToHearth(spark.content, index)}
                onKindle={() => handleKindle(spark.content)}
              />
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-sm text-gray-500 mb-3">试试这些方向</h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <ExploreSparkCard
                  key={index}
                  spark={rec}
                  onAddToHearth={() => handleAddToHearth(rec.content, index)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
```

### 7.2 P6 提交

- [ ] **Step 51: 提交 P6**

```bash
git add .
git commit -m "feat(P6): add ExplorePage with AI explore, ExploreSparkCard"
```

---

## Chunk 8: P7 - 设置页、OSS备份/还原

### 8.1 SettingsPage

**Files:**
- Create: `src/pages/SettingsPage.tsx`

- [ ] **Step 52: 创建 SettingsPage**

```tsx
import { useState } from 'react'
import { db, getOrCreateDeviceUuid } from '@/lib/db'

const OSS_BUCKET_URL = import.meta.env.VITE_OSS_BUCKET_URL || ''
const BACKUP_PATH = 'devices/'

export function SettingsPage() {
  const [deviceUuid, setDeviceUuid] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useState(() => {
    getOrCreateDeviceUuid().then(setDeviceUuid)
  })

  const handleBackup = async () => {
    setStatus('loading')
    setMessage('')

    try {
      // 1. 导出所有数据
      const data = {
        sparks: await db.sparks.toArray(),
        flames: await db.flames.toArray(),
        rekindleRecords: await db.rekindleRecords.toArray(),
        prairies: await db.prairies.toArray(),
        seedBuffer: await db.seedBuffer.toArray(),
        deviceInfo: await db.deviceInfo.toArray(),
        exportedAt: Date.now(),
        version: '1.0',
      }

      const json = JSON.stringify(data)
      const blob = new Blob([json], { type: 'application/json' })

      // 2. 上传到 OSS
      if (OSS_BUCKET_URL) {
        const filename = `${BACKUP_PATH}${deviceUuid}/backup_${Date.now()}.json`
        // 实际项目中需要通过 Worker 或签名 URL 上传
        // 这里简化处理
        const formData = new FormData()
        formData.append('file', blob, filename)

        // 占位：实际上传逻辑
        console.log('备份数据已生成，大小:', blob.size, '字节')
        setStatus('success')
        setMessage('备份已生成（OSS上传功能待实现）')
      } else {
        // 本地下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ignite_backup_${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        setStatus('success')
        setMessage('备份文件已下载')
      }
    } catch (err) {
      setStatus('error')
      setMessage('备份失败: ' + (err as Error).message)
    }
  }

  const handleRestore = async (file: File) => {
    setStatus('loading')
    setMessage('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // 验证格式
      if (!data.version || !data.sparks || !data.flames) {
        throw new Error('无效的备份文件格式')
      }

      // 清空本地数据库
      await db.sparks.clear()
      await db.flames.clear()
      await db.rekindleRecords.clear()
      await db.prairies.clear()
      await db.seedBuffer.clear()

      // 导入数据
      if (data.sparks.length) await db.sparks.bulkPut(data.sparks)
      if (data.flames.length) await db.flames.bulkPut(data.flames)
      if (data.rekindleRecords?.length) await db.rekindleRecords.bulkPut(data.rekindleRecords)
      if (data.prairies?.length) await db.prairies.bulkPut(data.prairies)
      if (data.seedBuffer?.length) await db.seedBuffer.bulkPut(data.seedBuffer)

      setStatus('success')
      setMessage(`恢复成功！导入了 ${data.sparks.length} 粒火种，${data.flames.length} 团烈焰`)
    } catch (err) {
      setStatus('error')
      setMessage('恢复失败: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">设置</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* 设备信息 */}
        <section className="bg-bg-secondary rounded-lg p-4">
          <h2 className="text-sm text-gray-400 mb-2">设备信息</h2>
          <p className="text-xs text-gray-500 break-all">{deviceUuid || '加载中...'}</p>
        </section>

        {/* 备份 */}
        <section className="bg-bg-secondary rounded-lg p-4">
          <h2 className="text-sm text-gray-400 mb-2">数据备份</h2>
          <p className="text-xs text-gray-500 mb-4">
            将所有数据备份到阿里云 OSS，备份文件可在其他设备恢复。
          </p>

          <button
            onClick={handleBackup}
            disabled={status === 'loading'}
            className="w-full bg-fire-prairie text-white py-3 rounded-lg disabled:opacity-50"
          >
            {status === 'loading' ? '备份中...' : '立即备份'}
          </button>

          {message && (
            <p className={`mt-2 text-sm ${
              status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message}
            </p>
          )}
        </section>

        {/* 还原 */}
        <section className="bg-bg-secondary rounded-lg p-4">
          <h2 className="text-sm text-gray-400 mb-2">数据还原</h2>
          <p className="text-xs text-gray-500 mb-4">
            选择备份文件还原数据。注意：这将覆盖当前所有数据！
          </p>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleRestore(file)
              }}
              className="hidden"
            />
            <span className="block w-full border border-fire-flame text-fire-flame py-3 rounded-lg text-center cursor-pointer hover:bg-fire-flame/10 transition">
              选择备份文件
            </span>
          </label>
        </section>

        {/* 关于 */}
        <section className="bg-bg-secondary rounded-lg p-4">
          <h2 className="text-sm text-gray-400 mb-2">关于</h2>
          <p className="text-xs text-gray-500">点燃 V0.1.0</p>
          <p className="text-xs text-gray-500 mt-1">个人探索工具</p>
        </section>
      </main>
    </div>
  )
}
```

### 8.2 P7 提交

- [ ] **Step 53: 提交 P7**

```bash
git add .
git commit -m "feat(P7): add SettingsPage with backup/restore functionality"
```

---

## Chunk 9: P8 - PWA配置、Service Worker、离线支持

### 9.1 PWA 配置

**Files:**
- Create: `public/manifest.json`
- Create: `public/vite.svg`
- Create: `src/sw.ts`

- [ ] **Step 54: 创建 manifest.json**

```json
{
  "name": "点燃",
  "short_name": "点燃",
  "description": "个人探索工具 - 灵感→行动→脉络",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A1A2E",
  "theme_color": "#FF6B35",
  "icons": [
    {
      "src": "/vite.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 55: 创建 Service Worker**

```typescript
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'ignite-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') return

  // API 请求不缓存
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 返回缓存或网络
      return cached || fetch(event.request).then((response) => {
        // 缓存新的响应
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
    })
  )
})

export {}
```

- [ ] **Step 56: 更新 main.tsx 注册 SW**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('SW registration failed')
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 57: 更新 vite.config.ts 支持 SW 构建**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // 我们使用自己的 manifest
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

- [ ] **Step 58: 添加 vite-plugin-pwa 到 package.json**

```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.19.0"
  }
}
```

### 9.2 更新 App.tsx 添加 Settings 路由

- [ ] **Step 59: 更新 App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { KindleWizard } from '@/pages/KindleWizard'
import { CreateFlamePage } from '@/pages/CreateFlamePage'
import { FlameDetailPage } from '@/pages/FlameDetailPage'
import { CompleteBurningPage } from '@/pages/CompleteBurningPage'
import { RekindlePage } from '@/pages/RekindlePage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/hearth/kindle/:sparkId" element={<KindleWizard />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/flame/create" element={<CreateFlamePage />} />
        <Route path="/prairie/flame/:id" element={<FlameDetailPage />} />
        <Route path="/prairie/flame/:id/complete" element={<CompleteBurningPage />} />
        <Route path="/prairie/flame/:id/rekindle" element={<RekindlePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App
```

- [ ] **Step 60: 更新 BottomNav 添加设置入口**

```tsx
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/hearth', label: '火盆', icon: '🔥' },
  { path: '/explore', label: '探索', icon: '🔍' },
  { path: '/prairie', label: '草原', icon: '🌿' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-700">
      <div className="max-w-app mx-auto flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-1 px-4 ${
              location.pathname === item.path ? 'text-fire-spark' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center py-1 px-4 ${
            location.pathname === '/settings' ? 'text-fire-spark' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs mt-1">设置</span>
        </button>
      </div>
    </nav>
  )
}
```

### 9.3 P8 提交

- [ ] **Step 61: 提交 P8**

```bash
git add .
git commit -m "feat(P8): add PWA manifest, Service Worker, offline support, SettingsPage"
```

---

## 最终提交

- [ ] **Step 62: 最终提交**

```bash
git add .
git commit -m "feat: complete MVP implementation - 点燃 V0.1.0"
```

---

## 依赖安装命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm run test

# 类型检查
npx tsc --noEmit
```

---

## 验证清单

- [ ] P1: 可以创建火种、查看火盆列表、换一批
- [ ] P2: 可以创建草原/野火、查看草原列表、存档/恢复
- [ ] P3: 点燃向导三步流程、选择视角、选择草原、平台跳转
- [ ] P4: 完成燃烧页面、感想记录、取火（冷却/上限）
- [ ] P5: 整理流程、AI 归类建议
- [ ] P6: 探索页、关键词探索、火种添加/点燃
- [ ] P7: 设置页、备份/还原
- [ ] P8: PWA 可安装、离线访问

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-27-ignite-mvp-implementation-plan.md`. Ready to execute?**
