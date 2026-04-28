import { Page, Locator } from '@playwright/test';

export class ExplorePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly recommendations: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = this.page.locator('input');
    this.searchButton = this.page.locator('button:has-text("探索")');
    this.recommendations = this.page.locator('text=推荐探索');
  }

  async goto(): Promise<void> {
    await this.page.goto('http://localhost:5173/#/explore');
    await this.page.waitForLoadState('networkidle');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async addFirstToHearth(): Promise<void> {
    const addButton = this.page.locator('button:has-text("加入火盆")').first();
    await addButton.click();
    await this.page.waitForTimeout(2000);
  }

  async kindleFirst(): Promise<void> {
    const kindleButton = this.page.locator('button:has-text("点燃")').first();
    await kindleButton.click();
    await this.page.waitForTimeout(2000);
  }

  async isRecommendationsVisible(): Promise<boolean> {
    return this.recommendations.isVisible();
  }
}