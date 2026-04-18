import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — extended by every Page Object.
 * Provides typed wrappers around Playwright actions and assertions
 * so individual page objects stay clean and focused on selectors + flows.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────

  async navigate(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // ── Interactions ─────────────────────────────────────────────

  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  async scrollTo(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  // ── Queries ──────────────────────────────────────────────────

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  async getValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  async isChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }

  // ── Assertions ───────────────────────────────────────────────

  async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  async assertHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  async assertText(locator: Locator, expected: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(expected);
  }

  async assertContains(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toContainText(expected);
  }

  async assertValue(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveValue(expected);
  }

  async assertCount(locator: Locator, expected: number): Promise<void> {
    await expect(locator).toHaveCount(expected);
  }

  async assertUrl(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expected);
  }

  async assertTitle(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  // ── Waits ────────────────────────────────────────────────────

  async waitForSelector(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ── Misc ─────────────────────────────────────────────────────

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path:     `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }
}
