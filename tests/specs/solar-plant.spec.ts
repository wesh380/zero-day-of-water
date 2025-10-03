import { test, expect } from '@playwright/test';

const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost']);

const allowRequest = (url: string) => {
  try {
    if (url.startsWith('data:') || url.startsWith('about:') || url.startsWith('file:')) {
      return true;
    }
    const target = new URL(url);
    return ALLOWED_HOSTS.has(target.hostname);
  } catch (error) {
    return true;
  }
};

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const requestUrl = route.request().url();
    if (allowRequest(requestUrl)) {
      route.continue();
    } else {
      route.abort();
    }
  });
});

test('solar landing lists plant CTA', async ({ page }) => {
  await page.goto('/solar/');

  await expect(page).toHaveURL(/\/solar\/?$/);
  const plantCta = page.locator('a[href="/solar/plant/"]');
  await expect(plantCta).toBeVisible();
  await expect(plantCta).toHaveAttribute('href', '/solar/plant/');
});

test('solar plant calculator computes KPIs for sample input', async ({ page }) => {
  await page.goto('/solar/plant/');

  const metricsToCheck = [
    '#result-total-capex',
    '#result-first-year-revenue',
    '#result-first-year-om',
    '#result-npv',
    '#comparison-investment-value',
    '#comparison-penalty-value',
    '#comparison-ratio',
  ];

  for (const selector of metricsToCheck) {
    await expect(page.locator(selector)).not.toHaveText('—', { timeout: 5_000 });
  }

  const capexField = page.locator('#input-capacity-kw');
  const capexKpi = page.locator('#result-total-capex');

  const initialCapex = (await capexKpi.textContent())?.trim() ?? '';

  await capexField.fill('750');
  await page.click('[data-testid="btn-calculate"]');

  await expect.poll(async () => (await capexKpi.textContent())?.trim() ?? '').not.toBe(initialCapex);
  await expect(page.locator('[data-testid="comparison-investment-label"]')).toHaveText(/٪$/);
  await expect(page.locator('[data-testid="comparison-penalty-label"]')).toHaveText(/٪$/);
});

