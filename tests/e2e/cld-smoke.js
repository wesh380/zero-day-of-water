// @ts-check
// Minimal smoke test for CLD page ensuring graph renders without 404.
const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const PORT = process.env.TEST_PORT ? parseInt(process.env.TEST_PORT, 10) : 9099;
const ROOT = path.resolve(__dirname, '../../docs');

function serve(){
  const server = http.createServer((req, res) => {
    const u = req.url.split('?')[0];
    let p = path.join(ROOT, u);
    if (u === '/' || u.startsWith('/test')) p = path.join(ROOT, 'test', 'water-cld.html');
    fs.readFile(p, (err, data) => {
      if (err){ res.statusCode = 404; return res.end('Not Found'); }
      const ext = path.extname(p).toLowerCase();
      const ct = ext === '.html' ? 'text/html' :
                 ext === '.js'   ? 'application/javascript' :
                 ext === '.css'  ? 'text/css' :
                 ext === '.json' ? 'application/json' : 'text/plain';
      res.setHeader('Content-Type', ct + '; charset=utf-8');
      res.statusCode = 200; res.end(data);
    });
  });
  return new Promise((ok, ko) => { server.on('error', ko); server.listen(PORT, '0.0.0.0', () => ok(server)); });
}

(async () => {
  let server;
  try { server = await serve(); } catch (e) { console.error(e); process.exit(1); }
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => {
    const txt = m.text();
    if (/CSP|404|fetch bad status/i.test(txt)) errors.push(txt);
  });
  page.on('pageerror', e => errors.push('PAGEERR:' + e.message));

  await page.goto(`http://localhost:${PORT}/test/water-cld.html`, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.waitForFunction(() => window.cy && window.cy.nodes && window.cy.nodes().length > 0, { timeout: 30000 }).catch(() => {});
  const height = await page.$eval('#graph', el => el.getBoundingClientRect().height).catch(() => 0);
  const nodes = await page.evaluate(() => (window.cy && window.cy.nodes ? window.cy.nodes().length : 0));

  if (height < 40) errors.push('graph height ' + height);
  if (nodes < 1) errors.push('no nodes rendered');
  if (errors.length){
    console.error('CLD smoke FAIL', errors);
    await browser.close(); server.close(); process.exit(1);
  }
  console.log('CLD smoke ✅', { nodes, height });
  await browser.close(); server.close();
})();
