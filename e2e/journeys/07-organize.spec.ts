import { test, expect } from '@playwright/test';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 7: 整理功能', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('验证整理页面可以正常打开', async ({ page }) => {
    // 1. 导航到整理页
    await page.goto('http://localhost:5173/#/organize');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // 2. 验证 URL 正确
    await expect(page).toHaveURL(/\/organize/);

    // 3. 验证页面加载完成（有导航栏）
    await expect(page.locator('text=整理')).toBeVisible();
  });
});