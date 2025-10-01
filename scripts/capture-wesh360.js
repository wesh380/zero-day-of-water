const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const url = 'https://wesh360.ir';
  const screenshotPath = path.join(process.cwd(), '.mcp-artifacts', 'wesh360-home-full-1440.png');
  const viewport = { width: 1440, height: 3000, deviceScaleFactor: 1 };
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
      '--force-device-scale-factor=1'
    ]
  });
  const pages = await browser.pages();
  const page = pages.length ? pages[0] : await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await sleep(1000);

  const fixedChanged = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('*'));
    const updated = [];
    for (const el of candidates) {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        el.dataset.prevPosition = el.style.position || '';
        el.dataset.prevTop = el.style.top || '';
        el.dataset.prevBottom = el.style.bottom || '';
        el.style.position = 'static';
        el.style.top = 'auto';
        el.style.bottom = 'auto';
        updated.push(el);
      }
    }
    return updated.length;
  });

  const steps = 10;
  const delay = 1000;
  await page.evaluate(async ({ steps, delay }) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const doc = document.documentElement;
    const maxScrollTop = doc.scrollHeight - window.innerHeight;
    if (maxScrollTop <= 0) {
      return;
    }
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const target = progress * maxScrollTop;
      window.scrollTo(0, target);
      await sleep(delay);
    }
    window.scrollTo(0, doc.scrollHeight - window.innerHeight);
    await sleep(delay);
  }, { steps, delay });

  const metrics = await page.evaluate(() => ({
    bodyScrollHeight: document.body ? document.body.scrollHeight : null,
    documentScrollHeight: document.documentElement ? document.documentElement.scrollHeight : null,
    clientWidth: document.documentElement ? document.documentElement.clientWidth : null,
    clientHeight: document.documentElement ? document.documentElement.clientHeight : null
  }));

  await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
  const screenshotBuffer = await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    captureBeyondViewport: true,
    timeout: 0
  });

  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-prev-position]'));
    for (const el of elements) {
      el.style.position = el.dataset.prevPosition;
      el.style.top = el.dataset.prevTop;
      el.style.bottom = el.dataset.prevBottom;
      delete el.dataset.prevPosition;
      delete el.dataset.prevTop;
      delete el.dataset.prevBottom;
    }
  });

  await browser.close();

  const width = screenshotBuffer.readUInt32BE(16);
  const height = screenshotBuffer.readUInt32BE(20);

  const result = {
    screenshotPath,
    image: { width, height },
    metrics,
    fixedElementsAdjusted: fixedChanged
  };
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('capture failed:', error);
  process.exit(1);
});
