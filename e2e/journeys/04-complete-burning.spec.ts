import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 4: 完成燃烧', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完成燃烧并跳转至取火页', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种并点燃
    await hearthPage.goto();
    await hearthPage.createSpark('完成燃烧测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 进入烈焰详情
    await flameDetailPage.clickComplete();

    // 3. 验证进入完成燃烧页面
    await expect(page).toHaveURL(/\/complete/);
    await expect(page.locator('text=完成燃烧')).toBeVisible();

    // 4. 填写感想并保存
    await completeBurningPage.fillReflection('这次探索让我了解了科学原理');
    await completeBurningPage.clickSave();

    // 5. 验证跳转至取火页
    await expect(page).toHaveURL(/\/rekindle/);
    await expect(rekindlePage.rekindleButton).toBeVisible();
  });

  test('跳过感想直接保存', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);

    await hearthPage.goto();
    await hearthPage.createSpark('无感想测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await flameDetailPage.clickComplete();
    await completeBurningPage.skipReflection();

    await expect(page).toHaveURL(/\/rekindle/);
  });
});