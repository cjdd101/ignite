import { describe, it, expect } from 'vitest'
import { PLATFORM_URLS, buildSearchUrl } from '@/lib/platforms'

describe('platforms', () => {
  it('should have all required platform URLs', () => {
    expect(PLATFORM_URLS['B站']).toBeDefined()
    expect(PLATFORM_URLS['知乎']).toBeDefined()
    expect(PLATFORM_URLS['小红书']).toBeDefined()
    expect(PLATFORM_URLS['YouTube']).toBeDefined()
    expect(PLATFORM_URLS['Apple 播客']).toBeDefined()
    expect(PLATFORM_URLS['Google']).toBeDefined()
  })

  it('should build correct B站 search URL with encoded params', () => {
    const url = buildSearchUrl('B站', '咖啡拉花')
    expect(url).toContain('search.bilibili.com')
    expect(url).toContain('keyword=')
    expect(url).toContain(encodeURIComponent('咖啡拉花'))
  })

  it('should build correct 知乎 search URL', () => {
    const url = buildSearchUrl('知乎', '测试')
    expect(url).toContain('zhihu.com')
    expect(url).toContain('q=%E6%B5%8B%E8%AF%95')
  })

  it('should use Google as fallback for unknown platform', () => {
    const url = buildSearchUrl('Unknown Platform', 'test')
    expect(url).toContain('google.com')
  })
})
