import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 8: 完整闭环', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完整用户旅程：火种 -> 烈焰 -> 完成燃烧 -> 取火 -> 新火种', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种
    await hearthPage.goto();
    const initialCount = await hearthPage.getSparkCount();
    await hearthPage.createSpark('完整闭环测试');
    await expect(await hearthPage.getSparkCount()).toBe(initialCount + 1);

    // 2. 点燃
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 3. 完成燃烧
    await flameDetailPage.clickComplete();
    await completeBurningPage.fillReflection('完整旅程测试感想');
    await completeBurningPage.clickSave();

    // 4. 取火
    await expect(page).toHaveURL(/\/rekindle/);
    await rekindlePage.clickRekindle();
    await expect(page.locator('button:has-text("保留")').first()).toBeVisible({ timeout: 15000 });
    await rekindlePage.retainFirstSpark();
    await rekindlePage.clickSave();

    // 5. 验证回到火盆页且有新火种
    await expect(page).toHaveURL('/#/hearth');
    const finalCount = await hearthPage.getSparkCount();
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});