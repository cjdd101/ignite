import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { PrairiePage } from '../page-objects/PrairiePage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 3: 查看烈焰详情', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('应该能够查看野火详情', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const prairiePage = new PrairiePage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const kindlePage = new KindleWizardPage(page);

    // 1. 创建火种并点燃
    await hearthPage.goto();
    await hearthPage.createSpark('查看详情测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 在草原页面点击野火
    await prairiePage.clickFirstWildFlame();

    // 3. 验证进入烈焰详情页
    await expect(page).toHaveURL(/\/prairie\/flame\//);

    // 4. 验证显示详情
    await expect(flameDetailPage.title).toBeVisible();
    await expect(flameDetailPage.completeButton).toBeVisible();
    await expect(page.locator('text=燃烧中')).toBeVisible();
  });
});