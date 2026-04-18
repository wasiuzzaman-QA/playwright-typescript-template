import { Page, Response } from '@playwright/test';

/**
 * Trigger an action and wait for a matching API response simultaneously.
 * Prevents race conditions between click and network call.
 */
export async function waitForResponse(
  page:       Page,
  urlPattern: string | RegExp,
  action:     () => Promise<void>,
): Promise<Response> {
  const [response] = await Promise.all([
    page.waitForResponse(urlPattern),
    action(),
  ]);
  return response;
}

/**
 * Poll until a condition returns true or the timeout elapses.
 */
export async function waitUntil(
  condition:  () => Promise<boolean>,
  timeout  = 10_000,
  interval = 500,
): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await sleep(interval);
  }
  throw new Error(`waitUntil: condition not met within ${timeout}ms`);
}

/**
 * Explicit pause. Prefer Playwright's built-in auto-waits wherever possible.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
