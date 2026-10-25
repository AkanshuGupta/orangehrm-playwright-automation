import { test, expect } from '@fixtures/test.fixture';

test.describe('Employee API', () => {
  test('create, read and delete an employee', async ({ employeeApi, employee }) => {
    const created = await employeeApi.createEmployee(employee);

    // Read back by empNumber
    const fetched = await employeeApi.getByEmpNumber(created.empNumber);
    expect(fetched.firstName).toBe(employee.firstName);
    expect(fetched.lastName).toBe(employee.lastName);
    expect(fetched.employeeId).toBe(employee.employeeId);

    // Search finds exactly one match
    const found = await employeeApi.findByEmployeeId(employee.employeeId);
    expect(found).toHaveLength(1);

    // Delete, then confirm it is gone
    await employeeApi.deleteEmployees([created.empNumber]);
    expect(await employeeApi.findByEmployeeId(employee.employeeId)).toHaveLength(0);
  });

  test('unauthenticated request is rejected', async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL, storageState: undefined });
    const res = await anon.get('/web/index.php/api/v2/pim/employees');
    expect(res.status()).toBe(401);
    await anon.dispose();
  });
});