import { describe, it, expect } from 'vitest'
import type { Flame } from '@/types'

describe('Flame type definition', () => {
  it('status should be burning | burned (not active | archived)', () => {
    // Valid statuses
    const validStatuses: Flame['status'][] = ['burning', 'burned']
    expect(validStatuses).toContain('burning')
    expect(validStatuses).toContain('burned')

    // Type-level check: Flame status only allows burning or burned
    const flame: Flame = {
      id: '1',
      title: 'test',
      status: 'burning',
      prairieId: null,
      createdAt: 1,
      isDeleted: false,
      rekindleCount: 0,
    }
    expect(flame.status).toBe('burning')
  })

  it('Flame should have recommendationReason and searchPhrase fields', () => {
    const flame: Flame = {
      id: '1',
      title: 'test',
      recommendationReason: 'reason',
      searchPhrase: 'search',
      status: 'burning',
      prairieId: null,
      createdAt: 1,
      isDeleted: false,
      rekindleCount: 0,
    }

    expect(flame.recommendationReason).toBe('reason')
    expect(flame.searchPhrase).toBe('search')
  })
})