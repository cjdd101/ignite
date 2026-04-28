import { Page, Locator } from '@playwright/test';

export class CompleteBurningPage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = this.page.locator('textarea');
    this.saveButton = this.page.locator('button:has-text("保存并取火")');
  }

  async fillReflection(content: string): Promise<void> {
    await this.textarea.fill(content);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async skipReflection(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }
}