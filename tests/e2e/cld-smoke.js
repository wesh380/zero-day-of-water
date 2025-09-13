// @ts-check
// Smoke test ensuring CLD graph renders and data loads without 404s.
const puppeteer = require('puppeteer');

(async () => {
  const primary = process.env.BASE_URL || '';
  const csv = process.env.BASE_URL_CANDIDATES || 'http://127.0.0.1:5173/water/cld/,http://127.0.0.1:5173/test/water-cld';
  const candidates = [...new Set([primary, ...csv.split(',').map(s => s.trim())].filter(Boolean))];
  const SELECTORS = ['#graph', '#cy', '#cld-graph', '.cytoscape-container'];
  const isCI = !!process.env.CI;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
  });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(90000);
  page.setDefaultTimeout(60000);

  await page.setRequestInterception(true);
  page.on('request', req => {
    try {
      const u = new URL(req.url());
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') req.continue();
      else req.abort();
    } catch {
      req.continue();
    }
  });

  const consoleErrors = [];
  page.on('console', msg => {
    const t = msg.type();
    const txt = msg.text();
    if (t === 'error' || /fetch.*(404|5\d\d)|CSP/i.test(txt)) consoleErrors.push(txt);
  });

  async function tryUrl(url) {
    const before = consoleErrors.length;
    const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
    for (const sel of SELECTORS) {
      try {
        await page.waitForSelector(sel, { timeout: 5000 });
        return {
          ok: true,
          url,
          selector: sel,
          status: res && res.status(),
          errors: consoleErrors.slice(before)
        };
      } catch {}
    }
    const title = await page.title();
    const snippet = await page.evaluate(() =>
      document.documentElement.innerHTML.replace(/\s+/g, ' ').slice(0, 500)
    );
    return {
      ok: false,
      url,
      status: res && res.status(),
      title,
      snippet,
      errors: consoleErrors.slice(before)
    };
  }

  let matched = null;
  const attempts = [];
  for (const u of candidates) {
    const r = await tryUrl(u);
    attempts.push(r);
    if (r.ok) {
      matched = r;
      break;
    }
  }

  if (!matched) {
    console.error('No selector matched on any candidate URL.');
    console.table(
      attempts.map(a => ({
        url: a.url,
        status: a.status,
        title: a.title,
        snippetStart: a.snippet?.slice(0, 80) || '',
        consoleErrorsCount: a.errors.length
      }))
    );
    if (consoleErrors.length)
      console.error('Console errors:\n' + consoleErrors.join('\n'));
    throw new Error('CLD smoke: container not found on any candidate');
  }

  const { url, selector, errors } = matched;
  await page.waitForFunction(
    () => window.cy && window.cy.nodes && window.cy.nodes().length > 0,
    { timeout: 40000 }
  );

  const height = await page.$eval(selector, el => el.getBoundingClientRect().height);
  if (height < 40) throw new Error('Graph container height < 40px');

  if (errors.length)
    throw new Error('Console errors:\n' + errors.join('\n'));

  await browser.close();
  console.log('CLD smoke ✅', { url, selector });
})();

