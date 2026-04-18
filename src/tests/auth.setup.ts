import { test as setup } from '@playwright/test';
import { loginViaUiAndSave } from '../utils/auth.helper';

/**
 * Auth setup project — declared in playwright.config.ts as a dependency
 * for all browser projects. Runs once and writes .auth/<role>.json.
 *
 * Add or remove roles to match your application's user model.
 * Switch to loginViaApiAndSave() if your app has a REST login endpoint.
 */

setup('save auth state — testUser', async ({ page, context }) => {
  await loginViaUiAndSave(page, context, 'testUser');
});

setup('save auth state — admin', async ({ page, context }) => {
  await loginViaUiAndSave(page, context, 'admin');
});
