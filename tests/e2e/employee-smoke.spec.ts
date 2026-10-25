import { test } from '@fixtures/test.fixture';

test('create, find and delete an employee', async ({ employeeForm, employeeList, employee }) => {
  await employeeForm.createEmployee(employee);

  await employeeList.goto();
  await employeeList.searchById(employee.employeeId);
  await employeeList.expectEmployeeListed(employee.employeeId);

  await employeeList.deleteById(employee.employeeId);
  await employeeList.searchById(employee.employeeId);
  await employeeList.expectEmployeeNotListed(employee.employeeId);
});