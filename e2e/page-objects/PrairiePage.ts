import { Page, Locator } from '@playwright/test';

export class PrairiePage {
  readonly page: Page;
  readonly wildFlameTab: Locator;
  readonly myPrairieTab: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wildFlameTab = this.page.locator('button:has-text("野火")');
    this.myPrairieTab = this.page.locator('button:has-text("我的草原")');
    this.createButton = this.page.locator('button:has-text("创建新烈焰")');
  }

  async goto(): Promise<void> {
    await this.page.goto('http://localhost:5173/#/prairie');
    await this.page.waitForLoadState('networkidle');
  }

  async getWildFlameCount(): Promise<number> {
    const text = await this.wildFlameTab.textContent();
    const match = text?.match(/野火 \((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickFirstWildFlame(): Promise<void> {
    const firstFlame = this.page.locator('text=阅读').first();
    await firstFlame.click();
    await this.page.waitForTimeout(1000);
  }

  async switchToMyPrairie(): Promise<void> {
    await this.myPrairieTab.click();
    await this.page.waitForTimeout(500);
  }

  async clickCreateFlame(): Promise<void> {
    await this.createButton.click();
    await this.page.waitForTimeout(1000);
  }
}