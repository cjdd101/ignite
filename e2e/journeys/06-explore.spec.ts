import { test, expect } from '@playwright/test';
import { ExplorePage } from '../page-objects/ExplorePage';
import { HearthPage } from '../page-objects/HearthPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 6: 探索功能', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('探索并加入火盆', async ({ page }) => {
    const explorePage = new ExplorePage(page);
    const hearthPage = new HearthPage(page);

    // 1. 导航到探索页
    await explorePage.goto();

    // 2. 验证推荐内容可见
    await expect(explorePage.recommendations).toBeVisible();

    // 3. 输入探索词
    const query = '什么是量子计算？';
    await explorePage.search(query);

    // 4. 等待结果
    await expect(page.locator('button:has-text("加入火盆")').first()).toBeVisible({ timeout: 15000 });

    // 5. 加入火盆
    await explorePage.addFirstToHearth();

    // 6. 验证跳转至火盆页
    await expect(page).toHaveURL('/#/hearth');

    // 7. 验证火种出现
    const count = await hearthPage.getSparkCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});