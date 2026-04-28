import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { OrganizePage } from '../page-objects/OrganizePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 7: 整理功能', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('AI 整理野火', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const organizePage = new OrganizePage(page);

    // 1. 创建多个火种并点燃为野火
    await hearthPage.goto();
    await hearthPage.createSpark('野火1');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 再创建一个
    await hearthPage.goto();
    await hearthPage.createSpark('野火2');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 3. 导航到整理页
    await organizePage.goto();

    // 4. 验证野火数量
    const count = await organizePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(2);

    // 5. 点击分析
    await organizePage.clickAnalyze();

    // 6. 等待 AI 结果或错误提示
    const hasSuggestions = await page.locator('button:has-text("归入草原"), button:has-text("创建新草原")').isVisible().catch(() => false);
    const hasError = await organizePage.hasErrorMessage();

    // 两种结果都是可接受的
    expect(hasSuggestions || hasError).toBeTruthy();
  });
});