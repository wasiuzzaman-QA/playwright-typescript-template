import * as dotenv from 'dotenv';
import * as path   from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type Environment = 'development' | 'staging' | 'production';
export type UserRole    = 'admin' | 'testUser';

const ENV = (process.env.ENV ?? 'development') as Environment;

const BASE_URLS: Record<Environment, string> = {
  development: process.env.DEV_BASE_URL     ?? 'https://dev.example.com',
  staging:     process.env.STAGING_BASE_URL ?? 'https://staging.example.com',
  production:  process.env.PROD_BASE_URL    ?? 'https://example.com',
};

export const envConfig = {
  env:        ENV,
  baseUrl:    BASE_URLS[ENV],
  apiBaseUrl: process.env.API_BASE_URL ?? '',
  apiKey:     process.env.API_KEY      ?? '',

  headless:       process.env.HEADLESS !== 'false',
  slowMo:         parseInt(process.env.SLOW_MO         ?? '0'),
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT ?? '30000'),

  users: {
    admin: {
      email:    process.env.ADMIN_EMAIL     ?? '',
      password: process.env.ADMIN_PASSWORD  ?? '',
      role:     'admin' as const,
    },
    testUser: {
      email:    process.env.TEST_USER_EMAIL    ?? '',
      password: process.env.TEST_USER_PASSWORD ?? '',
      role:     'testUser' as const,
    },
  },

  authToken: process.env.AUTH_TOKEN,
} as const;

export type EnvConfig      = typeof envConfig;
export type UserCredentials = typeof envConfig.users[UserRole];
