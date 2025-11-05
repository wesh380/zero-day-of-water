const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildTimestampFolder(baseDir) {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const folderName = `preview-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const folderPath = path.join(baseDir, folderName);
  return { folderName, folderPath };
}

async function main() {
  const artifactsBase = path.join(process.cwd(), '.mcp-artifacts');
  const { folderName, folderPath } = buildTimestampFolder(artifactsBase);
  await fs.promises.mkdir(folderPath, { recursive: true });
  const outputPath = path.join(folderPath, 'webvitals.json');

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
  await page.setViewport({ width: 1440, height: 3000, deviceScaleFactor: 1 });

  try {
    await page.goto('https://wesh360.ir', { waitUntil: 'networkidle0', timeout: 90000 });

    await page.evaluate(() => {
      window.__wv = { lcp: null, cls: 0 };
      try {
        const l = new PerformanceObserver((list) => {
          const e = list.getEntries().pop();
          if (e) {
            window.__wv.lcp = {
              time: e.startTime,
              size: e.size,
              tag: e.element ? e.element.tagName : null,
              url: e.url || null
            };
          }
        });
        l.observe({ type: 'largest-contentful-paint', buffered: true });
        let cls = 0;
        const c = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) {
              cls += e.value;
            }
          }
          window.__wv.cls = cls;
        });
        c.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver setup failed', e);
      }
    });

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

    const webVitals = await page.evaluate(() => window.__wv || null);

    if (!webVitals) {
      throw new Error('window.__wv is not defined.');
    }

    const payload = {
      folderName,
      outputPath,
      webVitals
    };

    await fs.promises.writeFile(outputPath, JSON.stringify(webVitals, null, 2), 'utf8');

    console.log(JSON.stringify(payload, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('webvitals run failed:', error);
  process.exit(1);
});
