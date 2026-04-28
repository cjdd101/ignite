import { describe, it, expect, expectTypeOf } from 'vitest'
import type { Flame } from '@/types'

// Type-level test: verify Flame has correct status type
type FlameStatus = Flame['status']

describe('Flame type definition', () => {
  it('status should be burning | burned (not active | archived)', () => {
    // This line will cause a compile error if status type is wrong
    const validStatuses: FlameStatus[] = ['burning', 'burned']

    // Type-level check: if status allows 'active', this won't compile
    type _wrongStatusCheck = Flame['status'] extends 'burning' | 'burned' ? true : false
    const _check: _wrongStatusCheck = true

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
      prairieId: null,
      createdAt: 1,
      isDeleted: false,
      rekindleCount: 0,
    }

    expectTypeOf(flame.recommendationReason).toBeString()
    expectTypeOf(flame.searchPhrase).toBeString()
  })
})
