import { Page, Locator } from '@playwright/test';

export class KindleWizardPage {
  readonly page: Page;
  readonly getPerspectivesButton: Locator;
  readonly nextButton: Locator;
  readonly skipButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getPerspectivesButton = this.page.locator('button:has-text("获取探索视角")');
    this.nextButton = this.page.locator('button:has-text("下一步")');
    this.skipButton = this.page.locator('button:has-text("跳过")');
    this.cancelButton = this.page.locator('button:has-text("取消")');
    this.confirmButton = this.page.locator('button:has-text("确认点燃")');
  }

  async clickGetPerspectives(): Promise<void> {
    await this.getPerspectivesButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async selectFirstPerspective(): Promise<void> {
    const firstCard = this.page.locator('button:has-text("阅读")').first();
    await firstCard.click();
    await this.page.waitForTimeout(300);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickSkip(): Promise<void> {
    await this.skipButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
    await this.page.waitForTimeout(2000);
  }

  async selectWildFireOption(): Promise<void> {
    const select = this.page.locator('select');
    await select.selectOption({ label: '不归类（野火）' });
  }

  async isOnStep(step: 'perspective' | 'action' | 'confirm'): Promise<boolean> {
    const stepLabels = {
      perspective: '选择探索视角',
      action: '确认行动',
      confirm: '确认点燃',
    };
    return this.page.locator(`text=${stepLabels[step]}`).isVisible();
  }
}