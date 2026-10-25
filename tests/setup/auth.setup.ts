import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { env } from '../../config/env';
import { authFile } from '../../config/roles';

setup('authenticate as admin', async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  await login.goto();
  await login.login(env.admin.username, env.admin.password);

  await expect(dashboard.heading).toBeVisible();
  await page.context().storageState({ path: authFile('admin') });
});