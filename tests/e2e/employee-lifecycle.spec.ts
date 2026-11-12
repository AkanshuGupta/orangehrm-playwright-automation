import { test, expect } from '@fixtures/test.fixture';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';
import { Sidebar } from '@components/sidebar.component';
import { ESS_ROLE_NAME } from '@config/constants';

test('admin sees full navigation', { tag: '@smoke' }, async ({ page, dashboardPage }) => {
  await dashboardPage.goto();
  await expect(dashboardPage.heading).toBeVisible();
  await new Sidebar(page).expectVisible('Admin', 'PIM', 'Leave');
});

test('ESS user sees restricted navigation', { tag: '@regression' }, async ({
  browser, baseURL, employee, employeeApi, trackEmployee,
}) => {
  const created = await employeeApi.createEmployee(employee);
  trackEmployee(created.empNumber);
  await employeeApi.createEssUser(employee, created.empNumber);
  const user = await employeeApi.findUserByUsername(employee.username);
  expect(user, 'system user should exist').toBeDefined();
  if (!user) throw new Error('System user was not returned by the API');
  expect(user.userRole.name).toBe(ESS_ROLE_NAME);
  expect(user.status).toBe(true);
  expect(String(user.employee.empNumber)).toBe(String(created.empNumber));

  const context = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(employee.username, employee.password);
    await expect(new DashboardPage(page).heading).toBeVisible();

    const sidebar = new Sidebar(page);
    await sidebar.expectVisible('My Info', 'Leave');
    await sidebar.expectHidden('Admin', 'PIM');
  } finally {
    await context.close();
  }
});

test('admin updates an API-seeded employee', { tag: '@regression' }, async ({
  employee, employeeApi, personalDetails, trackEmployee,
}) => {
  const created = await employeeApi.createEmployee(employee);
  trackEmployee(created.empNumber);

  const updatedFirst = `${employee.firstName}Upd`;
  const updatedLast = `${employee.lastName}Upd`;
  await personalDetails.open(String(created.empNumber));
  await personalDetails.updateName(updatedFirst, updatedLast);

  const details = await employeeApi.getPersonalDetails(created.empNumber);
  expect(details.firstName).toBe(updatedFirst);
  expect(details.lastName).toBe(updatedLast);
  expect(details.employeeId).toBe(employee.employeeId);
});

test('admin deletes an API-seeded employee', { tag: '@regression' }, async ({
  employee, employeeApi, employeeList, trackEmployee,
}) => {
  const created = await employeeApi.createEmployee(employee);
  trackEmployee(created.empNumber);

  await employeeList.goto();
  await employeeList.searchById(employee.employeeId);
  await employeeList.expectEmployeeListed(employee.employeeId);
  await employeeList.deleteById(employee.employeeId);
  expect(await employeeApi.findByEmployeeId(employee.employeeId)).toHaveLength(0);
});

test('deleted ESS user can no longer log in', { tag: '@regression' }, async ({
  browser, baseURL, employee, employeeApi, employeeList, trackEmployee,
}) => {
  const created = await employeeApi.createEmployee(employee);
  trackEmployee(created.empNumber);
  await employeeApi.createEssUser(employee, created.empNumber);

  await employeeList.goto();
  await employeeList.searchById(employee.employeeId);
  await employeeList.deleteById(employee.employeeId);

  const context = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(employee.username, employee.password);
    await expect(login.errorMessage).toHaveText('Invalid credentials');
  } finally {
    await context.close();
  }
});