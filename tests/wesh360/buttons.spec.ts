import { expect, test } from '@playwright/test';
import { primaryInteractions } from './pageData';
import { escapeForRegex, gotoAndVerify } from './utils';

test.describe('Critical buttons and links', () => {
  for (const interaction of primaryInteractions) {
    test(`${interaction.description} (${interaction.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      await gotoAndVerify(page, interaction.path);

      for (const action of interaction.actions) {
        const locator = page.getByRole(action.role, {
          name: action.name,
          exact: action.exact ?? true,
        });

        if (action.navigates && action.target) {
          const waitPattern = new RegExp(escapeForRegex(action.target));
          await Promise.all([
            page.waitForURL(waitPattern, { timeout: 20_000 }),
            locator.click(),
          ]);
          await page.waitForLoadState('networkidle');
          await expect(page).not.toHaveTitle(/404|خطا|error/i);
          await page.goBack({ waitUntil: 'networkidle' });
        } else {
          await locator.click();
          if (action.assertVisibleSelector) {
            const assertion = page.locator(action.assertVisibleSelector);
            await expect(assertion).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(assertion).not.toBeVisible({ timeout: 5_000 });
          }
        }
      }

      expect(consoleErrors).toEqual([]);
    });
  }
});
