const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const puppeteer = require('puppeteer-core');

// --- simple static server over /docs with dynamic port and retry ---
function serveDocs(rootDir) {
  const root = path.resolve(rootDir);
  const server = http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '').split('?')[0]);
      let filePath = path.join(root, urlPath);
      if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.statusCode = 404; res.end('not found'); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const types = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.ico':'image/x-icon' };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    } catch (e) { res.statusCode = 500; res.end('server error'); }
  });

  async function findPort(start) {
    let p = Number(start) || 8082;
    const upper = 8100;
    // probe binding with net to avoid event leak
    async function canListen(port) {
      return await new Promise((resolve) => {
        const s = net.createServer()
          .once('error', () => resolve(false))
          .once('listening', () => { s.close(() => resolve(true)); })
          .listen(port, '127.0.0.1');
      });
    }
    while (!(await canListen(p))) {
      p = p < upper ? p + 1 : 0;
      if (p === 0) break;
    }
    return p;
  }

  async function start(startPort) {
    const port = await findPort(startPort || process.env.PORT);
    await new Promise((res) => server.listen(port, '127.0.0.1', res));
    console.log('[serve]', `http://localhost:${port}`);
    return { server, port };
  }
  return { start };
}

function execPathFromEnv() { return process.env.PUPPETEER_EXECUTABLE_PATH || null; }

(async () => {
  const srv = serveDocs('docs');
  const { server, port } = await srv.start(process.env.PORT);
  const base = `http://localhost:${port}`;
  const rel = process.env.REL || '/water/cld/index.html';
  const url = base + rel;

  let browser;
  const launchOpts = { headless: 'new' };
  const exe = execPathFromEnv();
  if (exe) launchOpts.executablePath = exe;
  try {
    const startTs = Date.now();
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    const pageLogs = [];
    page.on('console', (m) => pageLogs.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => pageLogs.push(`pageerror: ${e.message}`));

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector('#cy', { timeout: 15000 });

    const diags = [];
    const deadline = Date.now() + 15000;
    let ready = false; let lastDiag = null;
    while (Date.now() < deadline) {
      lastDiag = await page.evaluate(() => {
        const root = document.querySelector('#cy');
        const bb = root ? { w: root.clientWidth, h: root.clientHeight } : { w: 0, h: 0 };
        const C = globalThis.CLD_CORE || {};
        const cy = (C && typeof C.getCy === 'function' && C.getCy()) || (globalThis.cy && typeof globalThis.cy.nodes === 'function' && globalThis.cy) || null;
        const counts = cy ? { n: cy.nodes().length, e: cy.edges().length } : { n: 0, e: 0 };
        return { hasRoot: !!root, visible: bb.w > 0 && bb.h > 0, bb, hasCy: !!cy, counts };
      });
      diags.push({ t: Date.now(), ...lastDiag });
      if (lastDiag.hasCy && lastDiag.counts.n > 0 && lastDiag.counts.e > 0 && lastDiag.visible) { ready = true; break; }
      await new Promise(r => setTimeout(r, 250));
    }

    fs.mkdirSync(path.join('tests', 'artifacts'), { recursive: true });
    await page.screenshot({ path: path.join('tests', 'artifacts', 'cld-render.png'), fullPage: true });
    const logPath = path.join('tests', 'artifacts', 'render-run.log');
    const summary = ready ? 'READY' : 'NOT_READY';
    const body = [
      `summary: ${summary}`,
      `url: ${url}`,
      `elapsedMs: ${Date.now() - startTs}`,
      'lastDiag: ' + JSON.stringify(lastDiag),
      'pageLogs (tail):',
      ...pageLogs.slice(-20)
    ].join('\n');
    fs.writeFileSync(logPath, body, 'utf8');

    await browser.close();
    await new Promise(res => server.close(res));
    if (!ready) {
      console.error('E2E FAIL', { lastDiag });
      process.exit(1);
    }
    console.log('READY:', lastDiag);
    process.exit(0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch(_){}
    try { await new Promise(res => server.close(res)); } catch(_){}
    console.error('E2E EXC:', e && (e.stack || e.message || e));
    process.exit(1);
  }
})();
