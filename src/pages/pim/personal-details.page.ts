import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class PersonalDetailsPage extends BasePage {
  protected readonly path = '/web/index.php/pim/viewPersonalDetails/empNumber';

  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    // The page has several Save buttons; scope to the form containing the name fields
    this.saveButton = page
      .locator('form')
      .filter({ has: this.firstName })
      .getByRole('button', { name: 'Save' });
  }

  async open(empNumber: string): Promise<void> {
    await this.page.goto(`${this.path}/${empNumber}`);
    // Fields load asynchronously; wait until they are populated before editing
    await expect(this.firstName).not.toHaveValue('');
    await this.waitForLoaderToFinish();
  }

  async updateName(first: string, last: string): Promise<void> {
    await this.fill(this.firstName, first);
    await this.fill(this.lastName, last);
    await this.saveButton.click();
    await this.expectToast('Successfully Updated');
  }
}