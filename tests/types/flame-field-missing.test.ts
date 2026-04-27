import { describe, it, expect } from 'vitest'
import type { Flame } from '@/types'

describe('Flame type should have design-required fields', () => {
  it('should require recommendationReason field', () => {
    // Create a complete Flame object matching the design spec
    const flame: Flame = {
      id: '1',
      title: 'Test Flame',
      status: 'burning',
      prairieId: null,
      createdAt: Date.now(),
      isDeleted: false,
      rekindleCount: 0,
      // According to design doc, these should exist:
      recommendationReason: 'Because it is interesting',
      searchPhrase: 'search term',
    }
    
    // Access to verify field exists
    expect(flame.recommendationReason).toBeDefined()
    expect(flame.searchPhrase).toBeDefined()
  })
})
