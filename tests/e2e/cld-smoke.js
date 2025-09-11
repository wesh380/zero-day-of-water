const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

async function waitForServer(url, timeoutMs=30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function ping(){
      const req = http.get(url, res => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now()-start > timeoutMs) reject(new Error('server timeout'));
        else setTimeout(ping, 500);
      });
      req.end();
    })();
  });
}

(async () => {
  const port = process.env.TEST_PORT || '8080';
  const url = `http://localhost:${port}/test/water-cld.html`;

  // اگر سرویس داخلی داری، از "npm run serve-docs" استفاده کن؛
  // در غیر این صورت http-server را روی docs بالا بیاور.
  const useInternalServe = !!process.env.USE_SERVE_DOCS;
  const cmd = useInternalServe ? 'npm' : 'npx';
  const args = useInternalServe ? ['run','serve-docs'] : ['http-server','docs','-p',port,'-s','-c-1'];

  const server = spawn(cmd, args, {stdio:'inherit', shell:true});
  try {
    await waitForServer(url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const consoleLogs = [];
    page.on('console', m => consoleLogs.push(m.text()));

    await page.goto(url, {waitUntil:'networkidle2', timeout:60000});

    // انتظار برای cy (اگر موجود شد)
    await page.waitForFunction('window.cy && cy.ready', {timeout:30000}).catch(()=>{});

    const counts = await page.evaluate(() => {
      const result = { nodes:null, edges:null };
      if (window.cy) {
        result.nodes = window.cy.nodes().length;
        result.edges = window.cy.edges().length;
      }
      return result;
    });

    if (!counts.nodes || counts.nodes <= 0) {
      console.error('E2E FAIL: nodes not rendered', counts, consoleLogs.slice(-10));
      process.exit(1);
    }
    console.log('E2E OK:', counts);
    await browser.close();
    server.kill();
    process.exit(0);
  } catch (e) {
    console.error('E2E EXC:', e);
    server.kill();
    process.exit(1);
  }
})();

