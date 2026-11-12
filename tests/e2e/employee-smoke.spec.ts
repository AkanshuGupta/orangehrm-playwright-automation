import { test } from '@fixtures/test.fixture';

test('create, find and delete an employee', { tag: '@smoke' }, async ({
  employeeForm, employeeList, employee, trackEmployee,
}) => {
  const empNumber = await employeeForm.createEmployee(employee);
  trackEmployee(empNumber);

  await employeeList.goto();
  await employeeList.searchById(employee.employeeId);
  await employeeList.expectEmployeeListed(employee.employeeId);

  await employeeList.deleteById(employee.employeeId);
  await employeeList.searchById(employee.employeeId);
  await employeeList.expectEmployeeNotListed(employee.employeeId);
});