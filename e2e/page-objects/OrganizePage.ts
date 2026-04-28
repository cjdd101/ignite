import { Page, Locator } from '@playwright/test';

export class OrganizePage {
  readonly page: Page;
  readonly analyzeButton: Locator;
  readonly wildFlameCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.analyzeButton = this.page.locator('button:has-text("开始 AI 整理")');
    this.wildFlameCount = this.page.locator('text=/\\d+ 朵野火待整理/');
  }

  async goto(): Promise<void> {
    await this.page.goto('http://localhost:5173/#/organize');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAnalyze(): Promise<void> {
    await this.analyzeButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async getWildFlameCount(): Promise<number> {
    const text = await this.wildFlameCount.textContent();
    const match = text?.match(/(\d+) 朵野火待整理/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async confirmFirstSuggestion(): Promise<void> {
    const firstSuggestion = this.page.locator('button:has-text("归入草原"), button:has-text("创建新草原")').first();
    await firstSuggestion.click();
    await this.page.waitForTimeout(1000);

    const confirmButton = this.page.locator('button:has-text("确认归入")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async hasErrorMessage(): Promise<boolean> {
    return this.page.locator('text=暂时不可用').isVisible();
  }
}