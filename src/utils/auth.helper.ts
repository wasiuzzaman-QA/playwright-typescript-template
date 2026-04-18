import { Page, BrowserContext, request } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';
import { envConfig, UserRole } from '../../config/env.config';

const AUTH_DIR = path.resolve(process.cwd(), '.auth');

// ── Paths ─────────────────────────────────────────────────────

export function authStatePath(role: UserRole): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

export function hasAuthState(role: UserRole): boolean {
  return fs.existsSync(authStatePath(role));
}

function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// ── Strategy 1: UI login + save state ────────────────────────
// Use when the app has no API login endpoint.
// Call from auth.setup.ts — runs once before all browser projects.

export async function loginViaUiAndSave(
  page:    Page,
  context: BrowserContext,
  role:    UserRole,
): Promise<void> {
  ensureAuthDir();
  const { email, password } = envConfig.users[role];

  // TODO: update selectors and URL to match your app
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

  await context.storageState({ path: authStatePath(role) });
  console.info(`✔ Auth state saved — role: ${role}`);
}

// ── Strategy 2: API login + save state ───────────────────────
// Faster than UI login. Use when your app exposes a login endpoint.

export async function loginViaApiAndSave(role: UserRole): Promise<void> {
  ensureAuthDir();
  const { email, password } = envConfig.users[role];

  const ctx = await request.newContext({
    baseURL: envConfig.apiBaseUrl || envConfig.baseUrl,
  });

  // TODO: update endpoint and response shape to match your API
  const res = await ctx.post('/api/auth/login', {
    data: { email, password },
  });

  if (!res.ok()) {
    throw new Error(`API login failed for "${role}": ${res.status()} ${await res.text()}`);
  }

  const { token } = await res.json() as { token: string };

  const state = {
    cookies: [],
    origins: [{
      origin:       envConfig.baseUrl,
      localStorage: [
        { name: 'authToken', value: token },
        { name: 'userRole',  value: role  },
      ],
    }],
  };

  fs.writeFileSync(authStatePath(role), JSON.stringify(state, null, 2));
  await ctx.dispose();
  console.info(`✔ API auth state saved — role: ${role}`);
}

// ── Strategy 3: Token injection ───────────────────────────────
// Injects a JWT into localStorage before page load.
// Useful for static service-account tokens stored in .env.

export async function injectToken(page: Page, token: string): Promise<void> {
  await page.addInitScript((jwt) => {
    window.localStorage.setItem('authToken', jwt);
  }, token);
}

export async function injectEnvToken(page: Page): Promise<void> {
  if (!envConfig.authToken) throw new Error('AUTH_TOKEN is not set in .env');
  await injectToken(page, envConfig.authToken);
}

// ── Cookie helper ─────────────────────────────────────────────

export async function setSessionCookie(
  context: BrowserContext,
  name:    string,
  value:   string,
): Promise<void> {
  await context.addCookies([{
    name, value,
    url:      envConfig.baseUrl,
    httpOnly: true,
    secure:   true,
  }]);
}

// ── Credentials ───────────────────────────────────────────────

export function getCredentials(role: UserRole): typeof envConfig.users[UserRole] {
  return envConfig.users[role];
}

// ── Cleanup ───────────────────────────────────────────────────

export function clearAuthStates(): void {
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.info('✔ Auth states cleared');
  }
}
