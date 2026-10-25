import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { env } from '../../config/env';

test.use({ storageState: { cookies: [], origins: [] } });

test('valid admin login lands on dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.admin.username, env.admin.password);
  await expect(new DashboardPage(page).heading).toBeVisible();
});

test('invalid password shows error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.admin.username, 'wrong-password');
  await expect(login.errorMessage).toHaveText('Invalid credentials');
});