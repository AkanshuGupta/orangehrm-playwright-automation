import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class EmployeeListPage extends BasePage {
  protected readonly path = '/web/index.php/pim/viewEmployeeList';

  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  private row(employeeId: string): Locator {
    return this.page.locator('.oxd-table-card').filter({ hasText: employeeId });
  }

  async searchById(employeeId: string): Promise<void> {
    await this.inputByLabel('Employee Id').fill(employeeId);
    await this.searchButton.click();
    await this.waitForLoaderToFinish();
  }

  async expectEmployeeListed(employeeId: string): Promise<void> {
    await expect(this.row(employeeId)).toHaveCount(1);
  }

  async expectEmployeeNotListed(employeeId: string): Promise<void> {
    await expect(this.row(employeeId)).toHaveCount(0);
  }

  async deleteById(employeeId: string): Promise<void> {
    await this.row(employeeId)
      .getByRole('button')
      .filter({ has: this.page.locator('.bi-trash') })
      .click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await this.expectToast('Successfully Deleted');
  }
}