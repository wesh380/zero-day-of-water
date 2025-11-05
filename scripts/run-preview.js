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

async function adjustFixedElements(page) {
  return page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    let count = 0;
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        el.dataset.mcpPrevPosition = el.style.position || '';
        el.dataset.mcpPrevTop = el.style.top || '';
        el.dataset.mcpPrevBottom = el.style.bottom || '';
        el.style.position = 'static';
        el.style.top = 'auto';
        el.style.bottom = 'auto';
        count += 1;
      }
    }
    return count;
  });
}

async function restoreFixedElements(page) {
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-mcp-prev-position]'));
    for (const el of elements) {
      el.style.position = el.dataset.mcpPrevPosition;
      el.style.top = el.dataset.mcpPrevTop;
      el.style.bottom = el.dataset.mcpPrevBottom;
      delete el.dataset.mcpPrevPosition;
      delete el.dataset.mcpPrevTop;
      delete el.dataset.mcpPrevBottom;
    }
  });
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

    const totalLongTaskTime = longTaskDetails.reduce((sum, entry) => sum + entry.duration, 0);

    longTaskDetails.sort((a, b) => b.duration - a.duration);
    const topLongTasks = longTaskDetails.slice(0, 5);

    return {
      navigationStart: nav ? nav.startTime : 0,
      lcp,
      cls,
      totalLongTaskTime,
      topLongTasks,
      longTaskCount: longTaskDetails.length
    };
  });
}

async function collectMetrics(page) {
  return page.evaluate(() => ({
    bodyScrollHeight: document.body ? document.body.scrollHeight : null,
    documentScrollHeight: document.documentElement ? document.documentElement.scrollHeight : null,
    windowInnerHeight: window.innerHeight,
    clientWidth: document.documentElement ? document.documentElement.clientWidth : null,
    clientHeight: document.documentElement ? document.documentElement.clientHeight : null
  }));
}

async function collectLinks(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => ({
    text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
    href: a.href
  })));
}

async function main() {
  const WATER_CARD_ARIA_SUBSTRING = '\u0648\u0631\u0648\u062F \u0628\u0647 \u062F\u0627\u0634\u0628\u0648\u0631\u062F \u0622\u0628';

  const artifactsBase = path.join(process.cwd(), '.mcp-artifacts');
  const { folderName, folderPath } = buildTimestampFolder(artifactsBase);
  await fs.promises.mkdir(folderPath, { recursive: true });

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

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  const activeRequests = new Map();
  const completedRequests = [];

  client.on('Network.requestWillBeSent', (params) => {
    activeRequests.set(params.requestId, {
      requestId: params.requestId,
      url: params.request.url,
      method: params.request.method,
      startTime: params.timestamp,
      frameId: params.frameId
    });
  });

  client.on('Network.responseReceived', (params) => {
    const record = activeRequests.get(params.requestId);
    if (record) {
      record.status = params.response.status;
      record.mimeType = params.response.mimeType;
    }
  });

  client.on('Network.loadingFinished', (params) => {
    const record = activeRequests.get(params.requestId);
    if (record) {
      record.endTime = params.timestamp;
      record.encodedDataLength = params.encodedDataLength;
      record.duration = (record.endTime - record.startTime) * 1000;
      completedRequests.push(record);
      activeRequests.delete(params.requestId);
    }
  });

  client.on('Network.loadingFailed', (params) => {
    const record = activeRequests.get(params.requestId);
    if (record) {
      record.endTime = params.timestamp;
      record.failure = params.errorText;
      record.duration = record.endTime && record.startTime ? (record.endTime - record.startTime) * 1000 : null;
      completedRequests.push(record);
      activeRequests.delete(params.requestId);
    }
  });

  const result = {
    folderName,
    folderPath,
    home: {},
    trace: {},
    network: [],
    water: {}
  };

  try {
    await page.goto('https://wesh360.ir', { waitUntil: 'networkidle0', timeout: 90000 });

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

    const fixedAdjustedHome = await adjustFixedElements(page);

    const homeScreenshotPath = path.join(folderPath, 'home-full.png');
    const homeScreenshotBuffer = await page.screenshot({
      path: homeScreenshotPath,
      fullPage: true,
      captureBeyondViewport: true,
      timeout: 0
    });

    await restoreFixedElements(page);

    const homeImageWidth = homeScreenshotBuffer.readUInt32BE(16);
    const homeImageHeight = homeScreenshotBuffer.readUInt32BE(20);

    const homeMetrics = await collectMetrics(page);

    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 }).catch(() => {});

    const tracePath = path.join(folderPath, 'trace.json');
    await page.tracing.start({
      path: tracePath,
      screenshots: false,
      categories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.stack',
        'v8.execute'
      ]
    });
    await sleep(10000);
    await page.tracing.stop();

    const perfSummary = await collectPerformanceSummary(page);

    const topNetworkRequests = completedRequests
      .filter((record) => typeof record.duration === 'number' && record.duration >= 300)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((record) => {
        try {
          const urlObj = new URL(record.url, 'https://wesh360.ir');
          const shortUrl = urlObj.origin + urlObj.pathname;
          return {
            method: record.method,
            status: record.status || null,
            durationMs: Number(record.duration.toFixed(1)),
            url: shortUrl
          };
        } catch (error) {
          return {
            method: record.method,
            status: record.status || null,
            durationMs: Number(record.duration.toFixed(1)),
            url: record.url
          };
        }
      });

    result.home = {
      screenshotPath: homeScreenshotPath,
      image: { width: homeImageWidth, height: homeImageHeight },
      metrics: homeMetrics,
      fixedElementsAdjusted: fixedAdjustedHome
    };

    result.trace = {
      tracePath,
      performance: {
        lcp: perfSummary.lcp,
        cls: perfSummary.cls,
        totalLongTaskTime: perfSummary.totalLongTaskTime,
        longTaskCount: perfSummary.longTaskCount,
        topLongTasks: perfSummary.topLongTasks.map((entry) => ({
          startTime: entry.startTime,
          duration: entry.duration,
          name: entry.name,
          attribution: entry.attribution
        }))
      }
    };

    result.network = topNetworkRequests;

    completedRequests.length = 0;

    const clicked = await page.evaluate((ariaSubstring) => {
      const anchors = Array.from(document.querySelectorAll('a'));
      for (const anchor of anchors) {
        const aria = (anchor.getAttribute('aria-label') || '').trim();
        if (aria.includes(ariaSubstring)) {
          anchor.dataset.mcpClickTarget = '1';
          anchor.scrollIntoView({ behavior: 'auto', block: 'center' });
          return true;
        }
      }
      return false;
    }, WATER_CARD_ARIA_SUBSTRING);

    if (!clicked) {
      throw new Error('Link with aria-label containing the target substring was not found.');
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 90000 }),
      page.click('[data-mcp-click-target="1"]')
    ]);

    await sleep(1000);

    const fixedAdjustedWater = await adjustFixedElements(page);
    const waterScreenshotPath = path.join(folderPath, 'water-dashboard.png');
    const waterScreenshotBuffer = await page.screenshot({
      path: waterScreenshotPath,
      fullPage: true,
      captureBeyondViewport: true,
      timeout: 0
    });
    await restoreFixedElements(page);

    const waterImageWidth = waterScreenshotBuffer.readUInt32BE(16);
    const waterImageHeight = waterScreenshotBuffer.readUInt32BE(20);
    const waterLinks = await collectLinks(page);

    result.water = {
      screenshotPath: waterScreenshotPath,
      image: { width: waterImageWidth, height: waterImageHeight },
      links: waterLinks,
      fixedElementsAdjusted: fixedAdjustedWater
    };

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('automation failed:', error);
  process.exit(1);
});
