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

Locator: getByRole('heading', { name: '整理' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: '整理' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:esbuild] Transform failed with 1 error: D:/dev/Ignite/src/stores/flameStore.ts:27:2: ERROR: Unexpected \"<<\""
  - generic [ref=e5]: D:/dev/Ignite/src/stores/flameStore.ts:27:2
  - generic [ref=e6]: "Unexpected \"<<\" 25 | try { 26 | const flames = await db.flames 27 | <<<<<<< HEAD | ^ 28 | .filter(flame => (flame.prairieId === null || flame.prairieId === undefined) && !flame.isDeleted) 29 | ======="
  - generic [ref=e7]: at failureErrorWithLog (D:\dev\Ignite\node_modules\vite\node_modules\esbuild\lib\main.js:1748:15) at D:\dev\Ignite\node_modules\vite\node_modules\esbuild\lib\main.js:1017:50 at responseCallbacks.<computed> (D:\dev\Ignite\node_modules\vite\node_modules\esbuild\lib\main.js:884:9) at handleIncomingPacket (D:\dev\Ignite\node_modules\vite\node_modules\esbuild\lib\main.js:939:12) at Socket.readFromStdout (D:\dev\Ignite\node_modules\vite\node_modules\esbuild\lib\main.js:862:7) at Socket.emit (node:events:508:20) at Socket.emit (node:domain:489:12) at addChunk (node:internal/streams/readable:564:12) at readableAddChunkPushByteMode (node:internal/streams/readable:515:3) at Readable.push (node:internal/streams/readable:395:5) at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
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
  18 |     // 3. 验证页面加载完成（使用更精确的 heading 选择器）
> 19 |     await expect(page.getByRole('heading', { name: '整理' })).toBeVisible();
     |                                                             ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | });
```