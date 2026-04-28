import { Page, Locator } from '@playwright/test';

export class FlameDetailPage {
  readonly page: Page;
  readonly completeButton: Locator;
  readonly jumpButton: Locator;
  readonly title: Locator;
  readonly status: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeButton = this.page.locator('button:has-text("完成燃烧")');
    this.jumpButton = this.page.locator('button:has-text("跳转平台")');
    this.title = this.page.locator('h2').first();
    this.status = this.page.locator('span:text-matches("燃烧中|已燃尽")');
  }

  async getTitle(): Promise<string> {
    return this.title.textContent() || '';
  }

  async getStatus(): Promise<string> {
    return this.status.textContent() || '';
  }

  async clickComplete(): Promise<void> {
    await this.completeButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickJump(): Promise<void> {
    await this.jumpButton.click();
    await this.page.waitForTimeout(500);
  }

  async isBurning(): Promise<boolean> {
    return this.page.locator('text=燃烧中').isVisible();
  }
}