import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { EmployeeData } from '@data/factories/employee.factory';

export class EmployeeFormPage extends BasePage {
  protected readonly path = '/web/index.php/pim/addEmployee';

  private readonly firstName: Locator;
  private readonly middleName: Locator;
  private readonly lastName: Locator;
  private readonly createLoginToggle: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.createLoginToggle = page.locator('.oxd-switch-input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async fillPersonalDetails(emp: EmployeeData): Promise<void> {
    await this.fill(this.firstName, emp.firstName);
    await this.fill(this.middleName, emp.middleName);
    await this.fill(this.lastName, emp.lastName);
    // Employee Id is pre-filled by the app, so clear it first
    await this.inputByLabel('Employee Id').fill(emp.employeeId);
  }

  async enableLogin(emp: EmployeeData): Promise<void> {
    await this.createLoginToggle.click();
    await this.fill(this.inputByLabel('Username'), emp.username);
    await this.fill(this.inputByLabel('Password'), emp.password);
    await this.fill(this.inputByLabel('Confirm Password'), emp.password);
  }

  // Returns the empNumber from the redirect URL, needed later for API calls
  async save(): Promise<string> {
    await this.saveButton.click();
    await this.page.waitForURL(/viewPersonalDetails\/empNumber\/\d+/);
    return this.page.url().match(/empNumber\/(\d+)/)![1];
  }

  async createEmployee(emp: EmployeeData, withLogin = true): Promise<string> {
    await this.goto();
    await this.fillPersonalDetails(emp);
    if (withLogin) await this.enableLogin(emp);
    return this.save();
  }
}