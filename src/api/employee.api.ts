import { APIRequestContext } from '@playwright/test';
import { ESS_ROLE_ID } from '@config/constants';
import { EmployeeData } from '@data/factories/employee.factory';
import { BaseApiClient } from '@api/base.api';

export interface ApiEmployee {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface ApiUser {
  id: number;
  userName: string;
  status: boolean;
  userRole: { id: number; name: string };
  employee: { empNumber: number };
}

export class EmployeeApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  // Search by name or employee id; returns an empty array if nothing matches
  async findByEmployeeId(employeeId: string): Promise<ApiEmployee[]> {
    const all = await this.get<ApiEmployee[]>('/pim/employees', {
      params: { nameOrId: employeeId, limit: 50, offset: 0 },
    });
    return all.filter((e) => e.employeeId === employeeId);
  }

  async getByEmpNumber(empNumber: number | string): Promise<ApiEmployee> {
    return this.get<ApiEmployee>(`/pim/employees/${empNumber}`);
  }

  async getPersonalDetails(empNumber: number | string): Promise<ApiEmployee> {
    return this.get<ApiEmployee>(`/pim/employees/${empNumber}/personal-details`);
  }

  async findUserByUsername(username: string): Promise<ApiUser | undefined> {
    const users = await this.get<ApiUser[]>('/admin/users', {
      params: { username, limit: 50, offset: 0 },
    });
    return users.find((u) => u.userName === username);
  }

  // Used by tests that need an employee without going through the UI
  async createEmployee(emp: EmployeeData): Promise<ApiEmployee> {
    return this.post<ApiEmployee>('/pim/employees', {
      data: {
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        employeeId: emp.employeeId,
        empPicture: null,
      },
    });
  }

  async createEssUser(emp: EmployeeData, empNumber: number): Promise<ApiUser> {
    return this.post<ApiUser>('/admin/users', {
      data: {
        username: emp.username,
        password: emp.password,
        status: true,
        userRoleId: ESS_ROLE_ID,
        empNumber,
      },
    });
  }

  async deleteEmployees(empNumbers: Array<number | string>): Promise<void> {
    await this.delete('/pim/employees', {
      data: { ids: empNumbers.map(Number) },
    });
  }
}