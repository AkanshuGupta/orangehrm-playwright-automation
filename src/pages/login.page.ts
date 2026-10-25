import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  protected readonly path = '/web/index.php/auth/login';

  private readonly username: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.oxd-alert-content-text');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.fill(this.username, user);
    await this.fill(this.password, pass);
    await this.submit.click();
  }
}