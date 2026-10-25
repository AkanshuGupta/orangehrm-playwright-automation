import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';
import { EmployeeFormPage } from '@pages/pim/employee-form.page';
import { EmployeeListPage } from '@pages/pim/employee-list.page';
import { EmployeeApi } from '@api/employee.api';
import { buildEmployee, EmployeeData } from '@data/factories/employee.factory';
import { PersonalDetailsPage } from '@pages/pim/personal-details.page';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeeForm: EmployeeFormPage;
  employeeList: EmployeeListPage;
  employee: EmployeeData;
  employeeApi: EmployeeApi;
  personalDetails: PersonalDetailsPage;
  trackEmployee: (empNumber: number | string) => void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  employeeForm: async ({ page }, use) => use(new EmployeeFormPage(page)),
  employeeList: async ({ page }, use) => use(new EmployeeListPage(page)),
  personalDetails: async ({ page }, use) => use(new PersonalDetailsPage(page)),
  // Data fixture
  employee: async ({ }, use) => use(buildEmployee()),
  // API fixture
  employeeApi: async ({ request }, use) => use(new EmployeeApi(request)),

  trackEmployee: async ({ employeeApi }, use) => {
    const created: Array<number | string> = [];
    await use((empNumber) => created.push(empNumber));
    // Teardown runs even when the test failed
    if (created.length) {
      await employeeApi.deleteEmployees(created).catch(() => {
        /* already deleted by the test itself, which is fine */
      });
    }
  },
});

export { expect } from '@playwright/test';