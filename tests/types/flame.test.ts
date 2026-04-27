import { describe, it, expect } from 'vitest'
import type { Flame } from '@/types'

describe('Flame type', () => {
  it('should have burning or burned status', () => {
    const burningFlame: Flame = {
      id: '1',
      title: 'Test',
      status: 'burning',
      prairieId: null,
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    }
    const burnedFlame: Flame = {
      id: '2',
      title: 'Test 2',
      status: 'burned',
      prairieId: null,
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    }
    expect(burningFlame.status).toBe('burning')
    expect(burnedFlame.status).toBe('burned')
  })

  it('should have recommendationReason and searchPhrase fields', () => {
    const flame: Flame = {
      id: '1',
      title: 'Test Flame',
      recommendationReason: '推荐理由',
      searchPhrase: '搜索口令',
      status: 'burning',
      prairieId: null,
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
    }
    expect(flame.recommendationReason).toBe('推荐理由')
    expect(flame.searchPhrase).toBe('搜索口令')
  })

  it('should allow userRecord and completedAt when burned', () => {
    const burnedFlame: Flame = {
      id: '1',
      title: 'Completed Flame',
      status: 'burned',
      prairieId: null,
      userRecord: 'Some reflection',
      completedAt: Date.now(),
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 1,
      lastRekindleTime: Date.now(),
    }
    expect(burnedFlame.status).toBe('burned')
    expect(burnedFlame.userRecord).toBe('Some reflection')
    expect(burnedFlame.completedAt).toBeDefined()
  })
})
