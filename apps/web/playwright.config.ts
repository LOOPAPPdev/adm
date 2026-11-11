import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Uses the preinstalled Chromium when present (sandbox); otherwise Playwright's own.
const local = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const executablePath = process.env.PW_CHROMIUM ?? (existsSync(local) ? local : undefined);

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  fullyParallel: false,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3123/', trace: 'off', launchOptions: { executablePath } },
  webServer: { command: 'npx next start -p 3123', url: 'http://localhost:3123/', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ }
  ]
});
