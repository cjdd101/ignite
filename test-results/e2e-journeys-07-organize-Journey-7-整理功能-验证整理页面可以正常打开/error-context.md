# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\journeys\07-organize.spec.ts >> Journey 7: 整理功能 >> 验证整理页面可以正常打开
- Location: e2e\journeys\07-organize.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=整理')
Expected: visible
Error: strict mode violation: locator('text=整理') resolved to 3 elements:
    1) <h1 class="text-2xl font-display font-bold text-text-primary">整理</h1> aka getByRole('heading', { name: '整理' })
    2) <p class="text-sm text-text-muted">整理散落的探索</p> aka getByText('整理散落的探索')
    3) <p class="text-text-muted">暂无野火需要整理</p> aka getByText('暂无野火需要整理')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=整理')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - banner [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: 🌿
        - heading "整理" [level=1] [ref=e10]
      - paragraph [ref=e11]: 整理散落的探索
    - main [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e15]: 🌿
        - paragraph [ref=e16]: 暂无野火需要整理
        - paragraph [ref=e17]: 去火盆点燃一些火种吧
  - navigation [ref=e18]:
    - generic [ref=e21]:
      - link "草原" [ref=e22] [cursor=pointer]:
        - /url: "#/prairie"
        - img [ref=e24]
        - generic [ref=e27]: 草原
      - link "火盆" [ref=e28] [cursor=pointer]:
        - /url: "#/hearth"
        - img [ref=e30]
        - generic [ref=e32]: 火盆
      - link "探索" [ref=e33] [cursor=pointer]:
        - /url: "#/explore"
        - img [ref=e35]
        - generic [ref=e38]: 探索
      - link "设置" [ref=e39] [cursor=pointer]:
        - /url: "#/settings"
        - img [ref=e41]
        - generic [ref=e44]: 设置
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { clearAllData } from '../utils/helpers';
  3  | 
  4  | test.describe('Journey 7: 整理功能', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await clearAllData(page);
  7  |   });
  8  | 
  9  |   test('验证整理页面可以正常打开', async ({ page }) => {
  10 |     // 1. 导航到整理页
  11 |     await page.goto('http://localhost:5173/#/organize');
  12 |     await page.waitForLoadState('domcontentloaded');
  13 |     await page.waitForTimeout(500);
  14 | 
  15 |     // 2. 验证 URL 正确
  16 |     await expect(page).toHaveURL(/\/organize/);
  17 | 
  18 |     // 3. 验证页面加载完成（有导航栏）
> 19 |     await expect(page.locator('text=整理')).toBeVisible();
     |                                           ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | });
```