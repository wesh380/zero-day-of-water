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

async function collectPerformanceSummary(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const layoutShifts = performance.getEntriesByType('layout-shift');
    const longTasks = performance.getEntriesByType('longtask');

    const lcpEntry = lcpEntries.length ? lcpEntries[lcpEntries.length - 1] : null;
    const lcp = lcpEntry ? (lcpEntry.renderTime || lcpEntry.loadTime || lcpEntry.startTime) : null;

    let cls = 0;
    for (const entry of layoutShifts) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }

    const longTaskDetails = longTasks.map((entry) => ({
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      attribution: (entry.attribution || []).map((attrib) => ({
        name: attrib.name,
        entryType: attrib.entryType,
        startTime: attrib.startTime,
        duration: attrib.duration,
        containerType: attrib.containerType,
        containerName: attrib.containerName,
        containerId: attrib.containerId
      }))
    }));

    longTaskDetails.sort((a, b) => b.duration - a.duration);

    const totalLongTaskTime = longTaskDetails.reduce((sum, entry) => sum + entry.duration, 0);

    return {
      navigationStart: nav ? nav.startTime : 0,
      lcp,
      cls,
      totalLongTaskTime,
      longTaskCount: longTaskDetails.length,
      topLongTasks: longTaskDetails.slice(0, 5)
    };
  });
}

async function main() {
  const artifactsBase = path.join(process.cwd(), '.mcp-artifacts');
  const { folderName, folderPath } = buildTimestampFolder(artifactsBase);
  await fs.promises.mkdir(folderPath, { recursive: true });

  const tracePath = path.join(folderPath, 'trace-before-nav.json');

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
    await page.tracing.start({
      path: tracePath,
      screenshots: false,
      categories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.stack',
        'v8.execute',
        'loading'
      ]
    });

    await page.goto('https://wesh360.ir', { waitUntil: 'load', timeout: 90000 });
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 }).catch(() => {});

    await sleep(5000);

    await page.tracing.stop();

    const perfSummary = await collectPerformanceSummary(page);

    const summary = {
      folderName,
      tracePath,
      performance: {
        lcp: perfSummary.lcp,
        cls: perfSummary.cls,
        totalLongTaskTime: perfSummary.totalLongTaskTime,
        longTaskCount: perfSummary.longTaskCount,
        topLongTasks: perfSummary.topLongTasks
      }
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('trace run failed:', error);
  process.exit(1);
});
