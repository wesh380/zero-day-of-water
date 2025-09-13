// @ts-check
// Smoke test ensuring CLD graph renders and data loads without 404s.
const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.BASE_URL || 'http://127.0.0.1:5173/water/cld/';
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
    } catch { req.continue(); }
  });

  const consoleErrors = [];
  page.on('console', msg => {
    const t = msg.type();
    const txt = msg.text();
    if (t === 'error' || /fetch.*(404|5\d\d)|CSP/i.test(txt)) consoleErrors.push(txt);
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#graph', { timeout: 30000 });
  await page.waitForFunction(
    () => window.cy && window.cy.nodes && window.cy.nodes().length > 0,
    { timeout: 40000 }
  );

  const height = await page.$eval('#graph', el => el.getBoundingClientRect().height);
  if (height < 40) throw new Error('Graph container height < 40px');

  const nodes = await page.evaluate(() => window.cy?.nodes()?.length || 0);
  if (nodes < 1) throw new Error('No nodes rendered');

  if (consoleErrors.length) throw new Error('Console errors:\n' + consoleErrors.join('\n'));

  console.log('CLD smoke ✅', { nodes, height });
  await browser.close();
})();

