import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { EmployeeData } from '@data/factories/employee.factory';

const BASE = '/web/index.php/api/v2';

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

export class EmployeeApi {
  constructor(private readonly request: APIRequestContext) {}

  private async json<T>(res: APIResponse): Promise<T> {
    expect(res.ok(), `API ${res.url()} returned ${res.status()}`).toBeTruthy();
    return (await res.json()).data as T;
  }

  // Search by name or employee id; returns an empty array if nothing matches
  async findByEmployeeId(employeeId: string): Promise<ApiEmployee[]> {
    const res = await this.request.get(`${BASE}/pim/employees`, {
      params: { nameOrId: employeeId, limit: 50, offset: 0 },
    });
    const all = await this.json<ApiEmployee[]>(res);
    return all.filter((e) => e.employeeId === employeeId);
  }

  async getByEmpNumber(empNumber: number | string): Promise<ApiEmployee> {
    const res = await this.request.get(`${BASE}/pim/employees/${empNumber}`);
    return this.json<ApiEmployee>(res);
  }

  async getPersonalDetails(empNumber: number | string): Promise<ApiEmployee> {
    const res = await this.request.get(`${BASE}/pim/employees/${empNumber}/personal-details`);
    return this.json<ApiEmployee>(res);
  }

  async findUserByUsername(username: string): Promise<ApiUser | undefined> {
    const res = await this.request.get(`${BASE}/admin/users`, {
      params: { username, limit: 50, offset: 0 },
    });
    const users = await this.json<ApiUser[]>(res);
    return users.find((u) => u.userName === username);
  }

  // Used by tests that need an employee without going through the UI
  async createEmployee(emp: EmployeeData): Promise<ApiEmployee> {
    const res = await this.request.post(`${BASE}/pim/employees`, {
      data: {
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        employeeId: emp.employeeId,
        empPicture: null,
      },
    });
    return this.json<ApiEmployee>(res);
  }

  async deleteEmployees(empNumbers: Array<number | string>): Promise<void> {
    const res = await this.request.delete(`${BASE}/pim/employees`, {
      data: { ids: empNumbers.map(Number) },
    });
    expect(res.ok(), `Delete failed with ${res.status()}`).toBeTruthy();
  }
}