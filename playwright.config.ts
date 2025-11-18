import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/wesh360',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: 'list',
  use: {
    baseURL: 'https://wesh360.ir',
    trace: 'off',
    ...devices['Desktop Chrome'],
  },
});
