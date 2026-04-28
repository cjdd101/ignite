import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 1: 创建火种', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('应该能够创建火种并显示在列表中', async ({ page }) => {
    const hearthPage = new HearthPage(page);

    // 1. 导航到火盆页面
    await hearthPage.goto();

    // 2. 验证初始状态
    await expect(page.locator('text=火盆空空如也')).toBeVisible();

    // 3. 创建火种
    const sparkContent = '测试火种：为什么天空是蓝色的？';
    await hearthPage.createSpark(sparkContent);

    // 4. 验证火种出现在列表
    await expect(page.locator(`text=${sparkContent}`)).toBeVisible();

    // 5. 验证计数更新
    const count = await hearthPage.getSparkCount();
    expect(count).toBe(1);
  });

  test('应该能够创建多个火种', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    await hearthPage.goto();

    await hearthPage.createSpark('火种1');
    await hearthPage.createSpark('火种2');

    const count = await hearthPage.getSparkCount();
    expect(count).toBe(2);
  });
});