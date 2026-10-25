import { test, expect } from '@fixtures/test.fixture';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';
import { Sidebar } from '@components/sidebar.component';

test.describe('Employee lifecycle', () => {
  test('admin creates, updates and deletes an employee; ESS access is validated',
    async ({ page, browser, baseURL, employee, employeeForm, employeeList,
             personalDetails, employeeApi, trackEmployee }) => {

    let empNumber = '';
    const updatedFirst = `${employee.firstName}Upd`;
    const updatedLast = `${employee.lastName}Upd`;

    await test.step('Admin creates employee with login details', async () => {
      empNumber = await employeeForm.createEmployee(employee);
      trackEmployee(empNumber); // safety net: removed via API if the test fails midway
    });

    await test.step('Admin sees full navigation', async () => {
      await new Sidebar(page).expectVisible('Admin', 'PIM', 'Leave');
    });

    await test.step('API: user exists with ESS role and is enabled', async () => {
      const user = await employeeApi.findUserByUsername(employee.username);
      expect(user, 'system user should exist').toBeDefined();
      expect(user!.userRole.name).toBe('ESS');
      expect(user!.status).toBe(true);
      expect(String(user!.employee.empNumber)).toBe(empNumber);
    });

    // Separate browser context = separate session, so admin stays logged in
    // const essContext = await browser.newContext({ baseURL });
    const essContext = await browser.newContext({ baseURL,storageState: { cookies: [], origins: [] },
    });
    const essPage = await essContext.newPage();

    await test.step('ESS user logs in and has restricted navigation', async () => {
      const login = new LoginPage(essPage);
      await login.goto();
      await login.login(employee.username, employee.password);
      await expect(new DashboardPage(essPage).heading).toBeVisible();

      const sidebar = new Sidebar(essPage);
      await sidebar.expectVisible('My Info', 'Leave');
      await sidebar.expectHidden('Admin', 'PIM');
    });

    await test.step('Admin updates the employee name', async () => {
      await personalDetails.open(empNumber);
      await personalDetails.updateName(updatedFirst, updatedLast);
    });

    await test.step('API: updated values are persisted', async () => {
      const details = await employeeApi.getPersonalDetails(empNumber);
      expect(details.firstName).toBe(updatedFirst);
      expect(details.lastName).toBe(updatedLast);
      expect(details.employeeId).toBe(employee.employeeId); // unchanged
    });

    await test.step('ESS user sees the updated name after reload', async () => {
      await essPage.reload();
      await expect(new DashboardPage(essPage).userDropdown).toContainText(updatedFirst);
    });

    await test.step('Admin deletes the employee via UI', async () => {
      await employeeList.goto();
      await employeeList.searchById(employee.employeeId);
      await employeeList.expectEmployeeListed(employee.employeeId);
      await employeeList.deleteById(employee.employeeId);
    });

    await test.step('API: employee no longer exists', async () => {
      expect(await employeeApi.findByEmployeeId(employee.employeeId)).toHaveLength(0);
    });

    await test.step('Deleted ESS user can no longer log in', async () => {
      // const freshContext = await browser.newContext({ baseURL });
      const freshContext = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] },});
      const freshPage = await freshContext.newPage();
      const login = new LoginPage(freshPage);
      await login.goto();
      await login.login(employee.username, employee.password);
      await expect(login.errorMessage).toHaveText('Invalid credentials');
      await freshContext.close();
    });

    await essContext.close();
  });
});