const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.CLD_URL || 'https://wesh360.ir/water/cld/';
  const outDir = 'diagnostics';
  const out = { url, when: new Date().toISOString(), console: [], requests: [], failures: [] };

  const browser = await puppeteer.launch({ args:['--no-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => out.console.push({type: msg.type(), text: msg.text()}));
  page.on('requestfailed', req => out.failures.push({ url: req.url(), method: req.method(), err: req.failure()?.errorText }));
  page.on('response', async res => {
    if (['4','5'].includes(String(res.status())[0])) {
      out.requests.push({ url: res.url(), status: res.status(), type: res.request().resourceType() });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

  // داده‌های داخل صفحه
  const diag = await page.evaluate(() => {
    const pick = k => (window[k] ? Object.keys(window[k]) : null);
    const el = document.querySelector('#cy, #graph, .cy-root, .cy-container');
    const rect = el ? el.getBoundingClientRect() : null;
    const styles = el ? window.getComputedStyle(el) : null;
    const cyOk = !!window.cy;
    let counts = null;
    if (cyOk) counts = { nodes: window.cy.nodes().length, edges: window.cy.edges().length };
    return {
      hasCy: cyOk,
      counts,
      containerSelector: el ? (el.id ? '#'+el.id : el.className) : null,
      containerRect: rect ? { w: rect.width, h: rect.height } : null,
      containerDisplay: styles ? styles.display : null,
      containerVisibility: styles ? styles.visibility : null,
      globals: {
        CLD_CORE: !!window.CLD_CORE,
        LOADER: !!window.LOADER,
        __MODEL__: !!window.__MODEL__,
        __cldModel: !!window.__cldModel
      }
    };
  });

  out.inpage = diag;

  // اسکرین‌شات وضعیت
  await page.screenshot({ path: path.join(outDir, 'cld-diagnose.png'), fullPage: true });

  fs.writeFileSync(path.join(outDir, 'cld-report.json'), JSON.stringify(out, null, 2));
  await browser.close();

  console.log('[DIAG] written:', path.join(outDir, 'cld-report.json'));
})();

