import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './config/env.config';

export default defineConfig({
  // ── Discovery ────────────────────────────────────────────────
  testDir:   './src/tests',
  testMatch: '**/*.spec.ts',

  // ── Execution ────────────────────────────────────────────────
  fullyParallel: true,
  workers:       process.env.CI ? 2 : 4,
  retries:       process.env.CI ? 2 : 0,
  timeout:       envConfig.defaultTimeout,

  // ── Reporting ────────────────────────────────────────────────
  reporter: [
    ['list'],
    ['html',  { outputFolder: 'reports/html',          open: 'never' }],
    ['json',  { outputFile:   'reports/results.json' }],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  // ── Shared browser settings ──────────────────────────────────
  use: {
    baseURL:           envConfig.baseUrl,
    headless:          envConfig.headless,
    slowMo:            envConfig.slowMo,
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'retain-on-failure',
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
    viewport:          { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  outputDir: 'reports/artifacts',

  // ── Projects ─────────────────────────────────────────────────
  projects: [
    // Auth setup — runs once, saves .auth/*.json consumed by all browser projects
    {
      name:      'setup',
      testMatch: '**/auth.setup.ts',
    },

    {
      name: 'chromium',
      use:  {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use:  {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use:  {
        ...devices['Desktop Safari'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile — no auth dependency by default; add if needed
    {
      name: 'mobile-chrome',
      use:  { ...devices['Pixel 5'] },
    },
  ],
});
