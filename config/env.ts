import dotenv from 'dotenv';
import path from 'path';

const envName = process.env.ENV ?? 'dev';
dotenv.config({ path: path.resolve(__dirname, `../.env.${envName}`) });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var "${key}" (ENV=${envName}). Check .env.${envName}`);
  }
  return value;
}

export const env = {
  name: envName,
  isCI: !!process.env.CI,
  baseUrl: required('BASE_URL'),
  admin: {
    username: required('ADMIN_USERNAME'),
    password: required('ADMIN_PASSWORD'),
  },
  essDefaultPassword: process.env.ESS_DEFAULT_PASSWORD ?? 'Test@12345',
};