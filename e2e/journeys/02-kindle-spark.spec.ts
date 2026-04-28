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
    await kindlePage.clickGetPerspectives();

    // 4. 选择第一个视角
    await kindlePage.selectFirstPerspective();
    await kindlePage.clickNext();

    // 5. 确认行动步骤
    await expect(page.locator('text=确认行动')).toBeVisible();
    await kindlePage.clickNext();

    // 6. 确认点燃
    await expect(page.locator('text=确认点燃')).toBeVisible();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 7. 验证跳转至草原页面
    await expect(page).toHaveURL('/#/prairie');

    // 8. 验证野火数量 +1
    const count = await prairiePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('跳过视角选择快速点燃', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);

    await hearthPage.goto();
    await hearthPage.createSpark('快速点燃测试');
    await hearthPage.clickFirstSpark();

    // 直接跳过
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await expect(page).toHaveURL('/#/prairie');
  });
});