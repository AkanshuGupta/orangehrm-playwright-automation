import { faker } from '@faker-js/faker';
import { env } from '@config/env';

export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;      // OrangeHRM allows max 10 chars
  username: string;        // min 5 chars
  password: string;        // needs upper, lower, digit, 7+ chars
}

export function buildEmployee(overrides: Partial<EmployeeData> = {}): EmployeeData {
  const suffix = Date.now().toString().slice(-6);
  return {
    firstName: `Auto${faker.person.firstName()}`.replace(/\W/g, ''),
    middleName: faker.string.alpha({ length: 4, casing: 'lower' }),
    lastName: `QA${suffix}`,
    employeeId: faker.string.numeric(8),
    username: `qa.${suffix}${faker.string.alpha({ length: 3, casing: 'lower' })}`,
    password: env.essDefaultPassword,
    ...overrides,
  };
}