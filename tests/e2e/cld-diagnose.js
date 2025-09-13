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
  // Wait for graph counts if possible (best-effort)
  try {
    await page.waitForFunction(() => {
      try {
        const dbg = (window.CLD_DEBUG && typeof window.CLD_DEBUG.health === 'function') ? window.CLD_DEBUG.health() : null;
        const cyInst = (window.CLD_CORE && typeof window.CLD_CORE.getCy==='function') ? window.CLD_CORE.getCy() : (window.cy || null);
        const counts = dbg?.counts || (cyInst ? { nodes: cyInst.nodes().length, edges: cyInst.edges().length } : null);
        return !!(counts && (counts.nodes||0) > 0);
      } catch { return false; }
    }, { timeout: 15000 });
  } catch (_) {}

  // داده‌های داخل صفحه
  const diag = await page.evaluate(() => {
    const pick = k => (window[k] ? Object.keys(window[k]) : null);
    const dbg = (window.CLD_DEBUG && typeof window.CLD_DEBUG.health === 'function') ? window.CLD_DEBUG.health() : null;
    const el = dbg?.container?.selector ? document.querySelector(dbg.container.selector) : (document.querySelector('#cy, #graph, .cy-root, .cy-container'));
    const rect = el ? el.getBoundingClientRect() : null;
    const styles = el ? window.getComputedStyle(el) : null;
    const cyInst = (window.CLD_CORE && typeof window.CLD_CORE.getCy==='function') ? window.CLD_CORE.getCy() : (window.cy || null);
    const cyOk = !!cyInst;
    let counts = dbg?.counts || null;
    if (!counts && cyOk) counts = { nodes: cyInst.nodes().length, edges: cyInst.edges().length };
    const flags = {
      hasLoader: !!(window.CLD_LOADER || window.LOADER),
      hasCore: !!window.CLD_CORE,
      hasLoadModel: !!window.CLD_LOAD_MODEL,
      coreKeys: (window.CLD_CORE ? Object.keys(window.CLD_CORE) : []),
    };
    return {
      hasCy: dbg?.hasCy ?? cyOk,
      counts,
      containerSelector: dbg?.container?.selector || (el ? (el.id ? '#'+el.id : el.className) : null),
      containerRect: dbg?.container?.rect || (rect ? { w: rect.width, h: rect.height } : null),
      containerDisplay: dbg?.container?.display ?? (styles ? styles.display : null),
      containerVisibility: dbg?.container?.visibility ?? (styles ? styles.visibility : null),
      globals: dbg?.globals || {
        CLD_CORE: !!window.CLD_CORE,
        LOADER: !!window.LOADER,
        __MODEL__: !!window.__MODEL__,
        __cldModel: !!window.__cldModel
      },
      flags
    };
  });

  out.inpage = diag;

  // اسکرین‌شات وضعیت
  await page.screenshot({ path: path.join(outDir, 'cld-diagnose.png'), fullPage: true });

  fs.writeFileSync(path.join(outDir, 'cld-report.json'), JSON.stringify(out, null, 2));
  await browser.close();

  console.log('[DIAG] written:', path.join(outDir, 'cld-report.json'));
})();
