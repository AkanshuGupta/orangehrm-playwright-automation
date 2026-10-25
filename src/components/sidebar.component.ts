import { Locator, Page, expect } from '@playwright/test';

export class Sidebar {
  constructor(private readonly page: Page) {}

  private item(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async expectVisible(...names: string[]): Promise<void> {
    for (const n of names) await expect(this.item(n)).toBeVisible();
  }

  async expectHidden(...names: string[]): Promise<void> {
    for (const n of names) await expect(this.item(n)).toHaveCount(0);
  }
}