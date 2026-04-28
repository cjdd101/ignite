import { Page, Locator } from '@playwright/test';

export class RekindlePage {
  readonly page: Page;
  readonly rekindleButton: Locator;
  readonly rekindleCount: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rekindleButton = this.page.locator('button:has-text("重新点燃")');
    this.rekindleCount = this.page.locator('text=/已取火 \\d+ \\/ 10 次/');
    this.saveButton = this.page.locator('button:has-text("保存火种")');
    this.backButton = this.page.locator('button:has-text("重新取火")');
  }

  async clickRekindle(): Promise<void> {
    await this.rekindleButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async retainFirstSpark(): Promise<void> {
    const retainButtons = this.page.locator('button:has-text("保留")');
    await retainButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async discardFirstSpark(): Promise<void> {
    const discardButtons = this.page.locator('button:has-text("丢弃")');
    await discardButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getRekindleCount(): Promise<number> {
    const text = await this.rekindleCount.textContent();
    const match = text?.match(/已取火 (\d+) \/ 10 次/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async hasSparks(): Promise<boolean> {
    return this.page.locator('button:has-text("保留")').first().isVisible();
  }
}