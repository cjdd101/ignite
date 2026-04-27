export const PLATFORM_URLS: Record<string, string> = {
  'B站': 'https://search.bilibili.com/all?keyword=',
  '知乎': 'https://www.zhihu.com/search?type=content&q=',
  '小红书': 'https://www.xiaohongshu.com/search_result?keyword=',
  'YouTube': 'https://www.youtube.com/results?search_query=',
  'Apple 播客': 'https://podcasts.apple.com/search?term=',
  'Google': 'https://www.google.com/search?q=',
}

export function buildSearchUrl(platform: string, searchPhrase: string): string {
  const baseUrl = PLATFORM_URLS[platform] || PLATFORM_URLS['Google']
  return baseUrl + encodeURIComponent(searchPhrase)
}

export function openPlatformSearch(platform: string, searchPhrase: string): void {
  const url = buildSearchUrl(platform, searchPhrase)
  window.open(url, '_blank', 'noopner,noreferrer')
}