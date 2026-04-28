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

export function generateId(): string {
  return crypto.randomUUID()
}

export async function getOrCreateDeviceUuid(): Promise<string> {
  const existing = await db.deviceInfo.get('device' as any)
  if (existing) return existing.deviceUuid

  const uuid = crypto.randomUUID()
  await db.deviceInfo.put({ id: 'device' as any, deviceUuid: uuid })
  return uuid
}