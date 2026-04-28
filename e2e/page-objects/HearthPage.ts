import { Page, Locator } from '@playwright/test';

export class HearthPage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly submitButton: Locator;
  readonly sparkList: Locator;
  readonly swapButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('textarea');
    this.submitButton = page.locator('button:has-text("投入火盆")');
    this.sparkList = page.locator('main');
    this.swapButton = page.locator('button:has-text("换一批")');
  }

  async goto(): Promise<void> {
    await this.page.goto('http://localhost:5173/#/hearth');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);
  }

  async createSpark(content: string): Promise<void> {
    await this.textarea.fill(content);
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getSparkCount(): Promise<number> {
    const text = await this.page.locator('text=/已积蓄.*粒火种/').textContent();
    const match = text?.match(/已积蓄 (\d+) 粒火种/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickFirstSpark(): Promise<void> {
    // 点击火种卡片进入点燃向导
    const firstSpark = this.sparkList.locator('div').first();
    await firstSpark.click();
    await this.page.waitForTimeout(1000);
  }

  async isEmptyState(): Promise<boolean> {
    return this.page.locator('text=火盆空空如也').isVisible();
  }
}