const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'], ignoreHTTPSErrors: true });
  const page = await browser.newPage();

  await page.goto('https://wesh360.ir/water/hub', { waitUntil: 'networkidle2' });

  // Scroll to bottom to trigger lazy content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));

  const flagStatus = await page.evaluate(() => {
    const el = document.querySelector('.emoji-flag');
    return el ? { text: el.textContent.trim(), html: el.innerHTML.trim() } : null;
  });

  if (!flagStatus) {
    console.log('❌ پرچم در DOM پیدا نشد.');
  } else if (
    flagStatus.text.includes('IR') ||
    (!flagStatus.html.includes('<img') && !/\p{RI}/u.test(flagStatus.text))
  ) {
    console.log('⚠️ پرچم به درستی نمایش داده نمی‌شود — شروع اصلاح...');
    const svgPath = path.join(__dirname, '../docs/assets/flags/ir.svg');
    const svgData = fs.readFileSync(svgPath, 'utf8');
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`;
    await page.evaluate((dataUrl) => {
      const el = document.querySelector('.emoji-flag');
      if (el) {
        el.innerHTML = `<img src="${dataUrl}" alt="پرچم ایران" class="flag-img-fix">`;
      }
    }, dataUrl);
    await page.addStyleTag({
      content: `.flag-img-fix { width: 1.5em; height: auto; vertical-align: middle; display: inline-block; }`
    });
    console.log('✅ پرچم اصلاح شد.');
  } else {
    console.log('✅ پرچم درست نمایش داده می‌شود.');
  }

  await page.screenshot({ path: 'flag-check.png', fullPage: true });
  await browser.close();
})();
