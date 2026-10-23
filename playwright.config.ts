import { defineConfig, devices } from '@playwright/test';

// Off the usual 3000/3100 — `reuseExistingServer` would otherwise pick up a
// `next dev` (overlay in every screenshot) or a stale `next start` whose
// chunks no longer match `.next`.
const E2E_PORT = 3210;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // A production server, not `next dev` — dev mode overlays a build
        // activity indicator that pops in and out nondeterministically and
        // makes visual-regression screenshots flaky.
        command: `pnpm build && pnpm start -p ${E2E_PORT}`,
        // /login is the one page that renders without a real Supabase
        // project wired up (see e2e/login.spec.ts), so it doubles as the
        // readiness probe.
        url: `http://localhost:${E2E_PORT}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
