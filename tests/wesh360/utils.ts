import { expect, Locator, Page } from '@playwright/test';

export async function gotoAndVerify(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response, `No response for ${path}`).not.toBeNull();
  if (response) {
    expect(response.status(), `HTTP status for ${path}`).toBeLessThan(400);
  }
  const title = await page.title();
  expect(title).not.toMatch(/404|خطا|error/i);
  return response;
}

const persianDigits: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

export function toEnglishDigits(raw: string | null): string {
  if (!raw) return '';
  return raw.replace(/[۰-۹]/g, (digit) => persianDigits[digit] ?? digit);
}

export function extractNumber(raw: string | null): number {
  const normalized = toEnglishDigits(raw)
    .replace(/[^0-9.-]/g, '')
    .replace(/(\..*?)\./g, '$1');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function expectNumericValue(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect(locator).not.toHaveText(/—|--|NaN|undefined/, { timeout: 15_000 });
  const text = await locator.innerText();
  const numeric = extractNumber(text);
  expect(Number.isNaN(numeric), `Value "${text}" is not numeric`).toBe(false);
  return numeric;
}

export function escapeForRegex(value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
