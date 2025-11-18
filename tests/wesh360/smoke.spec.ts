import { test } from '@playwright/test';
import { importantPages } from './pageData';
import { gotoAndVerify } from './utils';

test.describe('Production smoke coverage', () => {
  for (const pageTarget of importantPages) {
    test(`loads ${pageTarget.title} (${pageTarget.path})`, async ({ page }) => {
      // Placeholder pages (به‌زودی) are still expected to load successfully even if content is limited.
      await gotoAndVerify(page, pageTarget.path);
    });
  }
});
