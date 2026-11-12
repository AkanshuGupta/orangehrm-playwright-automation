import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_V2_BASE_PATH, HTTP_NOT_FOUND } from '@config/constants';
import { logger } from '@utils/logger';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export abstract class BaseApiClient {
  protected constructor(private readonly request: APIRequestContext) {}

  protected async get<T>(
    path: string,
    options?: Parameters<APIRequestContext['get']>[1],
  ): Promise<T> {
    return this.read<T>(this.request.get(this.url(path), options));
  }

  protected async post<T>(
    path: string,
    options?: Parameters<APIRequestContext['post']>[1],
  ): Promise<T> {
    return this.read<T>(this.request.post(this.url(path), options));
  }

  protected async delete(
    path: string,
    options?: Parameters<APIRequestContext['delete']>[1],
  ): Promise<void> {
    const response = await this.request.delete(this.url(path), options);
    this.assertOk(response);
  }

  private url(path: string): string {
    return `${API_V2_BASE_PATH}${path}`;
  }

  private async read<T>(responsePromise: Promise<APIResponse>): Promise<T> {
    const response = await responsePromise;
    this.assertOk(response);
    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private assertOk(response: APIResponse): void {
    if (response.ok()) return;

    const message = `API ${response.url()} returned ${response.status()}`;
    if (response.status() !== HTTP_NOT_FOUND) logger.error(message);
    throw new ApiError(message, response.status());
  }
}
