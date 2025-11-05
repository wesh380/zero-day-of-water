const puppeteer = require('puppeteer');

(async () => {
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
      '--start-maximized',
      '--force-device-scale-factor=1',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length ? pages[0] : await browser.newPage();
  await page.setViewport({ width: 1440, height: 3000, deviceScaleFactor: 1 });

  await page.goto('https://wesh360.ir', { waitUntil: 'networkidle0', timeout: 90000 });

  const data = await page.evaluate(() => {
    const mainEl = document.querySelector('main, #app, body');
    const styles = mainEl ? getComputedStyle(mainEl) : null;
    const viewportMeta = document.querySelector('meta[name=viewport]');
    return {
      layout: {
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement ? document.documentElement.clientWidth : null,
        mainW: styles ? styles.width : null,
        mainMaxW: styles ? styles.maxWidth : null,
        hasViewportMeta: viewportMeta ? viewportMeta.content : null
      },
      media: {
        min768: matchMedia('(min-width: 768px)').matches,
        min1024: matchMedia('(min-width: 1024px)').matches,
        min1440: matchMedia('(min-width: 1440px)').matches
      }
    };
  });

  await browser.close();

  console.log(JSON.stringify(data, null, 2));
})();
