import { expect, test } from '@playwright/test';
import { expectNumericValue, gotoAndVerify } from './utils';

const numberInputs = [
  ['#cost_production', '2600'],
  ['#cost_energy', '2200'],
  ['#loss_network', '18'],
  ['#maintenance', '1400'],
  ['#hidden_subsidy', '22'],
  ['#power_change', '3'],
];

// This suite validates that each major calculator renders numeric outputs once a user provides reasonable inputs.
test.describe('Mission critical calculators', () => {
  test('Water cost calculator returns numeric tariffs after recalculation', async ({ page }) => {
    // تست می‌کند که ماشین‌حساب قیمت آب بعد از وارد کردن مقادیر پایه، خروجی‌های قیمتی واقعی تولید کند.
    await gotoAndVerify(page, '/water/cost-calculator.html');

    for (const [selector, value] of numberInputs) {
      const input = page.locator(selector);
      await input.fill('');
      await input.type(value);
    }

    await page.getByRole('button', { name: 'به‌روزرسانی محاسبات' }).click();

    const realPrice = await expectNumericValue(page.locator('[data-testid="bill-amount"], #true-price'));
    const finalPrice = await expectNumericValue(page.locator('[data-testid="consumer-bill"], #final-price'));

    expect(realPrice).toBeGreaterThan(0);
    expect(finalPrice).toBeGreaterThan(0);
  });

  test('Solar plant calculator produces updated KPIs', async ({ page }) => {
    // تست می‌کند که ماشین‌حساب نیروگاه خورشیدی با ورودی‌های ساده مقدار NPV و CAPEX منطقی برگرداند.
    await gotoAndVerify(page, '/solar/plant/');

    await page.locator('[data-testid="input-year"]').fill('1403');
    await page.locator('[data-testid="input-annual-consumption"]').fill('1200000');
    await page.locator('[data-testid="input-is-obliged"]').check();
    await page.locator('[data-testid="input-ramp-pct"]').fill('5');
    await page.locator('[data-testid="input-cap-share-pct"]').fill('20');
    await page.locator('[data-testid="input-green-board"]').fill('56000');
    await page.locator('[data-testid="input-green-board-growth"]').fill('15');
    await page.locator('[data-testid="input-grid-price"]').fill('45000');
    await page.locator('[data-testid="input-capex-per-kw"]').fill('300000000');
    await page.locator('[data-testid="input-om-pct"]').fill('3');
    await page.locator('[data-testid="input-discount-pct"]').fill('22');
    await page.locator('[data-testid="input-horizon-years"]').fill('20');
    await page.locator('[data-testid="input-capacity-kw"]').fill('500');
    await page.locator('[data-testid="input-specific-yield"]').fill('1600');
    await page.locator('[data-testid="input-pr-loss-pct"]').fill('15');

    await page.getByRole('button', { name: 'محاسبه' }).click();

    const totalCapex = await expectNumericValue(page.locator('[data-testid="result-total-capex"]'));
    const npv = await expectNumericValue(page.locator('[data-testid="npv-value"], [data-testid="result-npv"]'));

    expect(totalCapex).toBeGreaterThan(0);
    expect(Number.isFinite(npv)).toBe(true);
  });

  test('Household dashboard food footprint leaves placeholder state', async ({ page }) => {
    // تست می‌کند که داشبورد خانوار (صفحه insights آب) پس از کلیک محاسبه، نتیجه‌ای غیر از «—» نشان دهد.
    await gotoAndVerify(page, '/water/insights.html');

    await page.fill('#food-input', 'نان، گوشت گاو');
    await page.getByRole('button', { name: /محاسبه ردپای آب/ }).click();

    const footprint = await expectNumericValue(page.locator('[data-testid="family-water-result"], #water-result'));
    expect(footprint).toBeGreaterThan(0);
  });
});
