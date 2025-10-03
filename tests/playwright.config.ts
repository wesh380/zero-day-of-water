import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 90_000,
  retries: 1,
  use: {
    baseURL: 'http://127.0.0.1:5050',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: 'npm run serve:docs',
    port: 5050,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop' },
  ],
});
