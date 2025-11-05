const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'], ignoreHTTPSErrors: true });
  try {
    const page = await browser.newPage();
    const url = process.env.CY_URL || 'https://wesh360.ir/water/hub';
    await page.goto(url, { waitUntil: 'networkidle2' });

    const cyState = await page.evaluate(() => {
      const cy = window.cy;
      try {
        return cy && typeof cy.state === 'function' ? cy.state() : null;
      } catch (e) {
        return null;
      }
    });

    const reportPath = path.join(process.cwd(), 'runtime-report.json');
    let report = {};
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (e) {
      // ignore if file does not exist
    }
    report.cyState = cyState;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})();
