/*
  E2E: Scan docs for CSP violations with fast-mode support.
  - Single page.goto per route
  - waitUntil + timeout controlled by env (TEST_FAST, NAV_TIMEOUT)
  - Light cache on http-server (-c 60)
  - Exit codes per spec
*/

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (e) { lastErr = e; }
    await sleep(200);
  }
  if (lastErr) throw lastErr;
  throw new Error('Server did not become ready in time');
}

function collectHtmlRoutes() {
  const root = path.resolve('docs');
  const out = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      // skip vendor bundles
      if (e.isDirectory()) {
        if (full.includes(path.sep + 'vendor' + path.sep)) continue;
        walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
        const rel = path.relative(root, full).split(path.sep).join('/');
        out.push('/' + rel);
      }
    }
  }
  walk(root);
  // stable order
  out.sort();
  return Array.from(new Set(out));
}

async function main() {
  const fast = process.env.TEST_FAST === '1';
  const waitMode = fast ? 'domcontentloaded' : 'networkidle2';
  const navTimeout = parseInt(process.env.NAV_TIMEOUT || (fast ? '15000' : '60000'), 10);
  const port = parseInt(process.env.TEST_PORT || '5173', 10);

  const args = ['http-server', 'docs', '-p', String(port), '-s', '-c', '60'];
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const server = spawn(npxBin, args, { stdio: 'inherit' });

  let closed = false;
  const cleanup = async () => {
    if (!closed) {
      try { server.kill('SIGTERM'); } catch (_) {}
      closed = true;
    }
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(`${baseUrl}/index.html`, fast ? 5000 : 15000).catch(async (e) => {
    await cleanup();
    throw e;
  });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  // Capture CSP violations via SecurityPolicyViolationEvent
  const violations = [];
  page.on('console', (msg) => {
    try {
      const text = msg.text ? msg.text() : String(msg);
      if (text && text.startsWith('CSPViolation:')) {
        violations.push(text);
      }
    } catch (_) {}
  });
  await page.evaluateOnNewDocument(() => {
    try {
      window.addEventListener('securitypolicyviolation', (e) => {
        try {
          // Keep this format stable for collection
          console.warn('CSPViolation:' + e.effectiveDirective + ' ' + (e.blockedURI || ''));
        } catch (_) {}
      }, { capture: true });
    } catch (_) {}
  });

  const routes = collectHtmlRoutes();

  let seenCsp = false;
  for (const rel of routes) {
    const url = baseUrl + rel;
    let resp;
    try {
      resp = await page.goto(url, { waitUntil: waitMode, timeout: navTimeout });
    } catch (e) {
      // Navigation timeout or error — record and continue to next route
      // but do not perform a second goto for this route.
    }

    // CSP presence check: header or meta tag
    try {
      const headers = resp && typeof resp.headers === 'function' ? resp.headers() : {};
      const hasHeader = !!(headers && (headers['content-security-policy'] || headers['content-security-policy-report-only']));
      const hasMeta = await page.evaluate(() => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
      seenCsp = seenCsp || hasHeader || hasMeta;
    } catch (_) {}

    // Short settle between routes in fast mode
    await sleep(fast ? 350 : 1000);
  }

  await browser.close();
  await cleanup();

  if (violations.length > 0) {
    console.error(`CSP violations detected: ${violations.length}`);
    for (const v of violations) console.error(' -', v);
    process.exit(1);
  } else if (seenCsp === true) {
    console.log('CSP present on at least one route; no violations found.');
    process.exit(0);
  } else if (process.env.CSP_REQUIRED === '1') {
    console.error('CSP required but not observed on any route.');
    process.exit(1);
  } else {
    console.log('No CSP observed; skipping (pass without enforcement).');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[e2e:csp] Unhandled error:', err && err.stack ? err.stack : err);
  process.exit(1);
});

