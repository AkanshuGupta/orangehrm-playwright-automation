import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';
import { EmployeeFormPage } from '@pages/pim/employee-form.page';
import { EmployeeListPage } from '@pages/pim/employee-list.page';
import { EmployeeApi } from '@api/employee.api';
import { ApiError } from '@api/base.api';
import { buildEmployee, EmployeeData } from '@data/factories/employee.factory';
import { PersonalDetailsPage } from '@pages/pim/personal-details.page';
import { HTTP_NOT_FOUND } from '@config/constants';
import { logger } from '@utils/logger';

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

    for (const empNumber of created) {
      try {
        await employeeApi.deleteEmployees([empNumber]);
      } catch (error) {
        if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
          logger.warn('Employee was already absent during cleanup', { empNumber });
          continue;
        }
        throw error;
      }
    }
  },
});

export { expect } from '@playwright/test';