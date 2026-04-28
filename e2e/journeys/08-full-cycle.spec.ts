import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { PrairiePage } from '../page-objects/PrairiePage';
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
    const prairiePage = new PrairiePage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种
    await hearthPage.goto();
    await hearthPage.createSpark('完整闭环测试');
    await expect(page.locator('text=完整闭环测试')).toBeVisible();

    // 2. 点燃
    await hearthPage.clickFirstSpark();
    await kindlePage.clickGetPerspectives();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 3. 完成燃烧
    await prairiePage.clickFirstWildFlame();
    await flameDetailPage.clickComplete();
    await completeBurningPage.fillReflection('完整旅程测试感想');
    await completeBurningPage.clickSave();

    // 4. 取火
    await expect(page).toHaveURL(/\/rekindle/);
    await rekindlePage.clickRekindle();

    // 等待 AI 结果或错误
    try {
      await expect(page.locator('button:has-text("保留")').first()).toBeVisible({ timeout: 15000 });
      await rekindlePage.retainFirstSpark();
      await rekindlePage.clickSave();
    } catch {
      // AI API 失败时验证错误提示
      await expect(page.locator('text=重新点燃失败')).toBeVisible({ timeout: 5000 });
    }

    // 5. 验证回到草原/详情页
    await expect(page).toHaveURL(/\/prairie/);
  });
});