# Fuel & Carbon Dashboard QA Plan

## Acceptance Criteria
- [x] No console errors and no failed network requests when loading `docs/gas/fuel-carbon.html`.
- [x] Scripts, fonts, and images load without 404 responses.
- [x] No ReferenceError or version conflict for Chart.js or Tailwind; libraries load once.
- [x] Layout remains unchanged in the first gas dashboard.
- [x] Page is responsive at mobile, tablet, and desktop widths with RTL text and Vazirmatn font.
- [x] KPI cards populated from `kpiData`.
- [x] Two doughnut charts and one 24‑month line chart render.
- [x] “اگر/آنگاه” slider updates simulated carbon intensity.
- [x] Selecting an appliance displays CO₂ output in grams per hour.
- [x] Mazut warning card applies `mazut-warning`/`mazut-danger` correctly.
- [x] Breadcrumb links resolve to `../index.html` and `./index.html` without 404.
- [x] Gas landing page contains a card linking to `./fuel-carbon.html`.

## CSP Domains
If Content Security Policy headers are enabled, all assets load from `self` and no external domains are required.

## Known Follow-ups
- Migrate remaining pages from Google Fonts to local `docs/fonts/vazirmatn/` to reduce CSP and performance risks.
- Consolidate global loading of Chart.js, its date adapter, and Tailwind if multiple pages load them separately.
- Replace mock data with real API integration for KPIs and charts.

## Fix log
- Dashboard only showed static text because required scripts were blocked by CSP and browser caching.
- Added local `vendor` copies of Chart.js and its date-fns adapter, updated script paths with `?v=1` cache-busting, and inserted a hidden JS boot status span.

## Routing Fix
- Updated landing page card to link to `/gas/` instead of the old `/gas/energy.html`.
- Added Netlify redirect: `/gas/energy    /gas/   301` to forward legacy requests.
