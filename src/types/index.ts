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

export interface Flame {
  id: string
  title: string
  description?: string | null
  recommendationReason?: string | null
  searchPhrase?: string | null
  status: 'burning' | 'burned'
  prairieId: string | null
  sourceSparkId?: string | null
  igniteBatchId?: string | null
  userRecord?: string | null
  completedAt?: number | null
  createdAt: number
  isDeleted: boolean
  rekindleCount: number
  lastRekindleTime?: number | null
}

export interface RekindleRecord {
  id: string
  flameId: string
  sparksResult: string[]
  retainedSparkIds: string[]
  createdAt: number
}

export interface Prairie {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived'
  archivedAt?: number
  createdAt: number
}

export interface SeedBuffer {
  id: string
  content: string
  createdAt: number
  used: boolean
}

export interface DeviceInfo {
  id: 'device'
  deviceUuid: string
  lastSyncTime?: number
}