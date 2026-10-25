import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  // OrangeHRM shows a loading spinner on most navigations
  async waitForLoaderToFinish(): Promise<void> {
    await this.page
      .locator('.oxd-loading-spinner')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => { /* spinner may never appear */ });
  }

  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.page.locator('.oxd-toast')).toContainText(text);
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected inputByLabel(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('input');
  }
}