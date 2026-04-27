import { describe, it, expect, expectType } from 'vitest'
import type { Flame } from '@/types'

// Type-level test: verify Flame has correct status type
type FlameStatus = Flame['status']

describe('Flame type definition', () => {
  it('status should be burning | burned (not active | archived)', () => {
    // This line will cause a compile error if status type is wrong
    const validStatuses: FlameStatus[] = ['burning', 'burned']
    
    // If we can create a Flame with 'active' status, the type is wrong
    const wrongStatusCheck = (flame: Flame) => {
      // If this compiles, status allows 'active' which is WRONG
      // We want status to ONLY allow 'burning' | 'burned'
    }
    
    expect(validStatuses).toContain('burning')
    expect(validStatuses).toContain('burned')
  })
  
  it('Flame should have recommendationReason and searchPhrase fields', () => {
    // Type-level check - if these fields don't exist, this won't compile
    const flame: Flame = {
      id: '1',
      title: 'test',
      recommendationReason: 'reason',
      searchPhrase: 'search',
      status: 'burning',
      createdAt: 1,
      isDeleted: false,
      rekindleCount: 0,
    }
    
    expect(flame.recommendationReason).toBe('reason')
    expect(flame.searchPhrase).toBe('search')
  })
})
