import { Page } from '@playwright/test';

/**
 * 重新加载页面（不清除数据库，因为 Playwright 环境中 IndexedDB 访问受限）
 * 测试之间通过重新加载页面来获得干净的环境
 */
export async function clearAllData(page: Page): Promise<void> {
  // 重新加载页面
  await page.reload();
  await page.waitForLoadState('networkidle');

  // 等待应用初始化
  await page.waitForTimeout(1000);
}

/**
 * 等待元素可见
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 创建测试火种
 */
export async function createTestSpark(
  page: Page,
  content: string
): Promise<void> {
  await page.goto('http://localhost:5173/#/hearth');
  await page.locator('textarea').fill(content);
  await page.locator('button:has-text("投入火盆")').click();
  await page.waitForTimeout(1000);
}

/**
 * 等待 AI 响应
 */
export async function waitForAIResponse(
  page: Page,
  timeout = 15000
): Promise<boolean> {
  try {
    await page.waitForFunction(
      () => {
        const loadingText = document.body.innerText.includes('重新点燃中');
        const hasResult = document.body.innerText.includes('保留') || document.body.innerText.includes('错误');
        return !loadingText && hasResult;
      },
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}