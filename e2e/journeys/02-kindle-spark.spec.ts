import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { PrairiePage } from '../page-objects/PrairiePage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 2: 点燃火种', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完整点燃流程', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const prairiePage = new PrairiePage(page);
    const kindlePage = new KindleWizardPage(page);

    // 1. 创建火种
    await hearthPage.goto();
    const sparkContent = '测试点燃流程';
    await hearthPage.createSpark(sparkContent);

    // 2. 点击火种进入点燃向导
    await hearthPage.clickFirstSpark();
    await expect(page).toHaveURL(/\/kindle/);

    // 3. 获取探索视角（真实 AI 调用）
    try {
      await kindlePage.clickGetPerspectives();
      await kindlePage.selectFirstPerspective();
    } catch {
      // AI 可能失败，使用默认视角
    }
    await kindlePage.clickNext();

    // 4. 确认行动步骤
    await expect(page.getByRole('heading', { name: '确认每一步行动' })).toBeVisible();
    await kindlePage.clickNext();

    // 5. 确认点燃
    await expect(page.getByRole('heading', { name: /确认点燃.*团烈焰/ })).toBeVisible();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 6. 等待创建完成
    await page.waitForTimeout(5000);

    // 7. 导航到草原页面验证野火数量 +1
    await prairiePage.goto();
    const count = await prairiePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('跳过视角选择快速点燃', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const prairiePage = new PrairiePage(page);
    const kindlePage = new KindleWizardPage(page);

    await hearthPage.goto();
    await hearthPage.createSpark('快速点燃测试');
    await hearthPage.clickFirstSpark();

    // 直接尝试跳过（如果 AI 还没加载完成，跳过按钮可能已可见）
    await kindlePage.clickSkip();
    await page.waitForTimeout(1000);

    // 检查页面状态并继续
    const onActionStep = await page.getByRole('heading', { name: '确认每一步行动' }).isVisible().catch(() => false);
    if (onActionStep) {
      await kindlePage.clickNext();
    }

    // 确认点燃步骤
    await expect(page.getByRole('heading', { name: /确认点燃.*团烈焰/ })).toBeVisible();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 等待创建完成
    await page.waitForTimeout(5000);

    // 导航到草原验证
    await prairiePage.goto();
    const count = await prairiePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});