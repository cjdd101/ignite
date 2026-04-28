export const PLATFORM_DEEP_LINKS: Record<string, string> = {
  'B站': 'bilibili://search/searchkeyword?keyword=',
  '知乎': 'zhihu://search?type=content&q=',
  '小红书': 'xhs://search/search?keyword=',
  'YouTube': 'youtube://search?q=',
  'Apple 播客': 'podcasts://search?term=',
  'Google': 'googlechrome://search?q=',
}

export const PLATFORM_WEB_URLS: Record<string, string> = {
  'B站': 'https://search.bilibili.com/all?keyword=',
  '知乎': 'https://www.zhihu.com/search?type=content&q=',
  '小红书': 'https://www.xiaohongshu.com/search_result?keyword=',
  'YouTube': 'https://www.youtube.com/results?search_query=',
  'Apple 播客': 'https://podcasts.apple.com/search?term=',
  'Google': 'https://www.google.com/search?q=',
}

export function buildSearchUrl(platform: string, searchPhrase: string): string {
  const baseUrl = PLATFORM_WEB_URLS[platform] || PLATFORM_WEB_URLS['Google']
  return baseUrl + encodeURIComponent(searchPhrase)
}

function getDeepLink(platform: string, searchPhrase: string): string {
  const baseScheme = PLATFORM_DEEP_LINKS[platform] || PLATFORM_DEEP_LINKS['Google']
  return baseScheme + encodeURIComponent(searchPhrase)
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function openPlatformSearch(platform: string, searchPhrase: string): void {
  if (isMobileDevice()) {
    const deepLink = getDeepLink(platform, searchPhrase)
    const fallback = buildSearchUrl(platform, searchPhrase)
    window.location.href = deepLink
    setTimeout(() => {
      window.open(fallback, '_blank', 'noopener,noreferrer')
    }, 1500)
  } else {
    const url = buildSearchUrl(platform, searchPhrase)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}