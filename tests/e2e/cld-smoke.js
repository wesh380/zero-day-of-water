// @ts-check
// Smoke test ensuring CLD graph renders and data loads without 404s.
const puppeteer = require('puppeteer');
let pptr = null;
try { pptr = require('puppeteer'); } catch { pptr = puppeteer; }

(async () => {
  const primary = process.env.BASE_URL || '';
  const csv = process.env.BASE_URL_CANDIDATES || 'http://127.0.0.1:5173/water/cld/,http://127.0.0.1:5173/test/water-cld';
  const candidates = [...new Set([primary, ...csv.split(',').map(s => s.trim())].filter(Boolean))];
  const SELECTORS = ['#graph', '#cy', '#cld-graph', '.cytoscape-container'];
  const isCI = !!process.env.CI;

  if (pptr.configure) { pptr.configure({ protocolTimeout: 120000 }); }
  const browser = await pptr.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 900 },
    args: isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
  });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(90000);
  page.setDefaultTimeout(60000);

  await page.setRequestInterception(true);
  page.on('request', req => {
    try {
      const u = new URL(req.url());
      const isHttp = u.protocol === 'http:' || u.protocol === 'https:';
      const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      if (!isHttp) return req.continue();
      if (isLocal) return req.continue();
      return req.abort();
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
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + String(e)));
  page.on('error', e => consoleErrors.push('error: ' + String(e)));

  async function tryUrl(url) {
    const before = consoleErrors.length;
    const res = await page
      .goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      .catch(e => ({ _err: e }));
    if (res && res._err) {
      return { ok: false, url, navError: String(res._err), errors: consoleErrors.slice(before) };
    }
    await page
      .waitForFunction(() => document.readyState !== 'loading', { timeout: 10000 })
      .catch(() => {});
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
    let title = 'n/a';
    let snippet = 'n/a';
    try { title = await page.title(); } catch {}
    try {
      const content = await Promise.race([
        page.content(),
        new Promise(r => setTimeout(() => r('<!-- timeout content -->'), 3000))
      ]);
      snippet = String(content).replace(/\s+/g, ' ').slice(0, 250);
    } catch {}
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
    console.error(
      'No selector matched on any candidate URL.\nAttempts:',
      attempts.map(a => ({
        url: a.url,
        status: a.status,
        title: a.title,
        snippetStart: a.snippet?.slice(0, 80) || '',
        consoleErrorsCount: a.errors.length,
        navError: a.navError
      }))
    );
    if (consoleErrors.length)
      console.error('Console errors:\n' + consoleErrors.join('\n'));
    throw new Error('CLD smoke: container not found on all candidates');
  }

  const { url, selector } = matched;
  await page.waitForFunction(
    () => window.cy && window.cy.nodes && window.cy.nodes().length > 0,
    { timeout: 50000 }
  );

  const height = await page.$eval(selector, el => el.getBoundingClientRect().height);
  if (height < 40) throw new Error('Graph container height < 40px');

  const data404 = consoleErrors.filter(t =>
    /water-cld-poster\.json|model\.json/i.test(t) && /404/.test(t)
  );
  if (data404.length) throw new Error('Data 404:\n' + data404.join('\n'));
  if (consoleErrors.length) throw new Error('Console errors:\n' + consoleErrors.join('\n'));

  await browser.close();
  console.log('CLD smoke ✅', { url, selector });
})();

