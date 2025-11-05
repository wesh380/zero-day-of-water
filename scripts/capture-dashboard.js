const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const homeUrl = 'https://wesh360.ir';
  const screenshotPath = path.join(process.cwd(), '.mcp-artifacts', 'wesh360-water-dashboard.png');
  const viewport = { width: 1440, height: 3000, deviceScaleFactor: 1 };
  const linkText = '\u062f\u0627\u0634\u0628\u0648\u0631\u062f \u0622\u0628';

  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 0,
    defaultViewport: null,
    args: [
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--remote-allow-origins=*',
      '--start-maximized',
      '--force-device-scale-factor=1',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length ? pages[0] : await browser.newPage();
  await page.setViewport(viewport);

  await page.goto(homeUrl, { waitUntil: 'networkidle0', timeout: 90000 });

  await page.evaluate(async () => {
    const sleepInner = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const steps = 10;
    const delay = 1000;
    const doc = document.documentElement;
    const maxScrollTop = doc.scrollHeight - window.innerHeight;
    if (maxScrollTop <= 0) {
      return;
    }
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const target = progress * maxScrollTop;
      window.scrollTo(0, target);
      await sleepInner(delay);
    }
    window.scrollTo(0, doc.scrollHeight - window.innerHeight);
    await sleepInner(delay);
  });

  const marked = await page.evaluate((targetText) => {
    const anchors = Array.from(document.querySelectorAll('a'));
    for (const anchor of anchors) {
      const label = (anchor.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const normalized = (anchor.textContent || '').replace(/\s+/g, ' ').trim();
      const href = anchor.getAttribute('href') || '';
      if (
        label.includes(targetText) ||
        normalized.includes(targetText) ||
        href.includes('/water/hub')
      ) {
        anchor.dataset.mcpClickTarget = '1';
        anchor.scrollIntoView({ behavior: 'auto', block: 'center' });
        return true;
      }
    }
    return false;
  }, linkText);

  if (!marked) {
    await browser.close();
    throw new Error(`Link containing '${linkText}' not found.`);
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 90000 }),
    page.click('[data-mcp-click-target="1"]')
  ]);

  await sleep(1000);

  const metrics = await page.evaluate(() => ({
    bodyScrollHeight: document.body ? document.body.scrollHeight : null,
    documentScrollHeight: document.documentElement ? document.documentElement.scrollHeight : null,
    clientWidth: document.documentElement ? document.documentElement.clientWidth : null,
    clientHeight: document.documentElement ? document.documentElement.clientHeight : null
  }));

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map((a) => ({
      text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
      href: a.href
    }));
  });

  await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
  const screenshotBuffer = await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    captureBeyondViewport: true,
    timeout: 0
  });

  await browser.close();

  const width = screenshotBuffer.readUInt32BE(16);
  const height = screenshotBuffer.readUInt32BE(20);

  const result = {
    screenshotPath,
    image: { width, height },
    metrics,
    links
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('capture failed:', error);
  process.exit(1);
});
