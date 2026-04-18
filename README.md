# Playwright TypeScript Base Template

Minimal, production-ready base for Playwright + TypeScript UI test projects.
Clone this once, extend it per project — no example specs included.

---

## What's included

| File / folder | Purpose |
|---|---|
| `playwright.config.ts` | Multi-browser projects, auth dependencies, reporters |
| `config/env.config.ts` | Typed `.env` loader — resolves base URL by `ENV=` |
| `src/pages/BasePage.ts` | POM base class — click, fill, assert, wait helpers |
| `src/utils/auth.helper.ts` | Three auth strategies: UI login, API login, token injection |
| `src/utils/wait.helper.ts` | `waitForResponse`, `waitUntil`, `sleep` |
| `src/fixtures/base.fixture.ts` | Extended `test` with `authenticatedPage` + `adminPage` fixtures |
| `src/tests/auth.setup.ts` | Global auth setup — runs once, writes `.auth/*.json` |
| `.github/workflows/playwright.yml` | CI/CD: lint → auth → test (3 browsers) → publish report |
| `.env.example` | All supported environment variables with descriptions |

---

## Setup

```bash
# 1. Use as a template (GitHub) or clone directly
git clone <this-repo> my-project && cd my-project

# 2. Install dependencies
npm install

# 3. Install browsers
npx playwright install --with-deps

# 4. Configure environment
cp .env.example .env
# Fill in your base URLs and credentials

# 5. Run auth setup — writes .auth/testUser.json and .auth/admin.json
npm run auth:setup
```

---

## Adding a page object

```typescript
// src/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput:   Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput    = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton  = page.getByRole('button', { name: /sign in/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }
}
```

Then export from `src/pages/index.ts` and optionally register as a fixture
in `src/fixtures/base.fixture.ts`.

---

## Adding a spec

```typescript
// src/tests/login.spec.ts
import { test, expect } from '../fixtures/base.fixture';

test('user can log in @smoke', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'password');
  await expect(loginPage.page).toHaveURL(/\/dashboard/);
});
```

---

## Running tests

```bash
npm test                    # all tests, all browsers
npm run test:smoke          # @smoke tag only
npm run test:regression     # @regression tag only
npm run test:headed         # watch the browser
npm run test:staging        # point at staging
npm run test:debug          # step-through debugger
npm run test:ui             # Playwright UI mode
npm run report              # open last HTML report
```

---

## Auth strategies

Three strategies are available in `src/utils/auth.helper.ts`:

**1 — UI login** (default): logs in through the browser, saves cookies + localStorage to `.auth/<role>.json`.
Update the selectors in `loginViaUiAndSave()` to match your app's login page.

**2 — API login** (faster): calls your REST login endpoint and writes the token to storage state.
Update the endpoint and response shape in `loginViaApiAndSave()`.

**3 — Token injection**: injects a static JWT from `.env AUTH_TOKEN` into localStorage before page load.
Use with the `authenticatedPage` fixture.

---

## CI/CD secrets

Add these to your repository's **Settings → Secrets**:

```
DEV_BASE_URL        STAGING_BASE_URL    PROD_BASE_URL
ADMIN_EMAIL         ADMIN_PASSWORD
TEST_USER_EMAIL     TEST_USER_PASSWORD
API_BASE_URL        API_KEY
SLACK_WEBHOOK_URL   (optional)
```

---

## Locator priority

1. `getByRole()` — most resilient, accessibility-aligned
2. `getByLabel()` — form fields
3. `getByTestId()` — `data-testid` attributes
4. `getByText()` — static visible text
5. CSS / XPath — last resort only
