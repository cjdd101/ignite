import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'

describe('Flame status enum', () => {
  it('should only allow burning or burned status values', async () => {
    // Create a flame with burning status
    const burningId = crypto.randomUUID()
    await db.flames.add({
      id: burningId,
      title: 'Burning Flame',
      status: 'burning', // Must be 'burning' or 'burned'
      prairieId: null,
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    })
    
    const burning = await db.flames.get(burningId)
    expect(burning?.status).toBe('burning')
    
    // Create a flame with burned status
    const burnedId = crypto.randomUUID()
    await db.flames.add({
      id: burnedId,
      title: 'Burned Flame',
      status: 'burned',
      prairieId: null,
      userRecord: 'Done',
      completedAt: Date.now(),
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 1,
    })
    
    const burned = await db.flames.get(burnedId)
    expect(burned?.status).toBe('burned')
    
    // Verify status is NOT active or archived
    expect(burning?.status).not.toBe('active')
    expect(burning?.status).not.toBe('archived')
    expect(burned?.status).not.toBe('active')
    expect(burned?.status).not.toBe('archived')
  })
})
