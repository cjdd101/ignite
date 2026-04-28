import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 5: 取火', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('取火并保存火种到火盆', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种 -> 点燃 -> 完成燃烧
    await hearthPage.goto();
    await hearthPage.createSpark('取火测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await flameDetailPage.clickComplete();
    await completeBurningPage.skipReflection();

    // 2. 验证进入取火页
    await expect(page).toHaveURL(/\/rekindle/);

    // 3. 点击重新点燃（真实 AI 调用）
    await rekindlePage.clickRekindle();

    // 4. 等待结果出现
    await expect(page.locator('button:has-text("保留")').first()).toBeVisible({ timeout: 15000 });

    // 5. 保留至少一个火种
    await rekindlePage.retainFirstSpark();
    await rekindlePage.clickSave();

    // 6. 验证跳转至草原页
    await expect(page).toHaveURL('/#/prairie');
  });
});