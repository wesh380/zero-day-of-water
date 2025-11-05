const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const screenshotPath = path.join(process.cwd(), '.mcp-artifacts', 'desk-1440.png');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    protocolTimeout: 0,
    args: [
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--remote-allow-origins=*',
      '--force-device-scale-factor=1',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length ? pages[0] : await browser.newPage();

  await page.setViewport({ width: 1440, height: 3000, deviceScaleFactor: 1, isMobile: false });

  await page.goto('https://wesh360.ir', { waitUntil: 'networkidle0', timeout: 90000 });

  const metrics = await page.evaluate(() => ({
    windowInnerWidth: window.innerWidth,
    documentClientWidth: document.documentElement ? document.documentElement.clientWidth : null,
    devicePixelRatio: window.devicePixelRatio,
    minWidthMatch: window.matchMedia('(min-width: 1024px)').matches
  }));

  await page.screenshot({ path: screenshotPath, fullPage: true, captureBeyondViewport: true, timeout: 0 });

  await browser.close();

  console.log(JSON.stringify({ screenshotPath, metrics }, null, 2));
}

main().catch((error) => {
  console.error('run failed:', error);
  process.exit(1);
});
