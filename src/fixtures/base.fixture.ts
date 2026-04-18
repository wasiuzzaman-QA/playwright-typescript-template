import { test as base, Page } from '@playwright/test';
import { envConfig }           from '../../config/env.config';
import { injectEnvToken }      from '../utils/auth.helper';

// ── Extend this type as you add page objects ──────────────────
// Example:
//   import { LoginPage, DashboardPage } from '../pages';
//   type PageFixtures = { loginPage: LoginPage; dashboardPage: DashboardPage };
type PageFixtures = Record<string, never>;

type AuthFixtures = {
  /** Page with AUTH_TOKEN from .env pre-injected into localStorage */
  authenticatedPage: Page;
  /** Page loaded with admin storageState (.auth/admin.json) */
  adminPage: Page;
};

export const test = base.extend<PageFixtures & AuthFixtures>({

  // Pre-injects AUTH_TOKEN from .env before any navigation
  authenticatedPage: async ({ page }, use) => {
    if (envConfig.authToken) await injectEnvToken(page);
    await use(page);
  },

  // Opens a fresh context using admin auth state
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: '.auth/admin.json' });
    const page    = await context.newPage();
    await use(page);
    await context.close();
  },

  // ── Add page object fixtures below ───────────────────────────
  // loginPage: async ({ page }, use) => {
  //   const lp = new LoginPage(page);
  //   await lp.goto();
  //   await use(lp);
  // },
});

export { expect } from '@playwright/test';
