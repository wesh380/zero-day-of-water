# Playwright production checks

These checks use the deployed domain (`https://wesh360.ir`) so they do not rely on a local Next.js build.

## Setup
1. Install dependencies if you have not already run `npm install`.
2. Install the Playwright browsers and system deps:
   ```bash
   npx playwright install --with-deps chromium
   ```

## Running the tests
* Execute the entire suite (smoke, buttons, calculators):
  ```bash
  npx playwright test
  ```
* Run an individual spec:
  ```bash
  npx playwright test tests/wesh360/smoke.spec.ts
  ```

## What each spec covers
* `smoke.spec.ts` — navigates to every high-priority URL (dashboards, calculators, research, placeholder “به‌زودی” sections) and fails if the HTTP status is ≥ 400 or if the title hints at a 404/500.
* `buttons.spec.ts` — opens each primary CTA/link on the homepage, water hub, calculators, and research portal, ensuring no `console.error` events fire and that overlays/tabs become visible when expected.
* `calculators.spec.ts` — feeds realistic inputs into the water cost calculator, solar plant calculator, and the household/food-footprint widget to ensure the outputs leave the placeholder (`—`) state and become numeric values.

The suite is configured via `playwright.config.ts` at the repo root with `baseURL` pointing to the production site and the `list` reporter for CI readability.
