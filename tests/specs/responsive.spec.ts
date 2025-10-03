import { test, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1024, height: 1366 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

const CSS_RULES = [
  'img,svg,canvas,video,iframe{max-width:100%;height:auto}',
  'table{display:block;overflow-x:auto;width:100%}',
  '.row,.grid,.cards{flex-wrap:wrap}',
  '[data-nowrap]{white-space:nowrap}',
].join('\n');

const CSS_PATH = resolve(process.cwd(), 'docs/assets/css/responsive-fixes.css');
const INDEX_PATH = resolve(process.cwd(), 'docs/index.html');

const viewportLabel = (viewport: { width: number; height: number }) => `${viewport.width}x${viewport.height}`;

const shouldApplyFixes = () => {
  const value = process.env.PW_APPLY;
  if (!value) return false;
  const lowered = value.toLowerCase();
  return lowered !== '0' && lowered !== 'false';
};

const ensureCssFile = async () => {
  await mkdir(dirname(CSS_PATH), { recursive: true });
  if (!existsSync(CSS_PATH)) {
    await writeFile(CSS_PATH, `${CSS_RULES}\n`, 'utf8');
    return;
  }
  const current = await readFile(CSS_PATH, 'utf8');
  if (!current.includes('img,svg,canvas,video,iframe{max-width:100%;height:auto}')) {
    await writeFile(CSS_PATH, `${CSS_RULES}\n`, 'utf8');
  }
};

const ensureCssLink = async () => {
  if (!existsSync(INDEX_PATH)) return;
  const html = await readFile(INDEX_PATH, 'utf8');
  if (html.includes('responsive-fixes.css')) {
    return;
  }
  const linkBlock = `\n  <!-- Responsive audit fixes -->\n  <link rel="stylesheet" href="./assets/css/responsive-fixes.css">`;
  const updated = html.replace('</head>', `${linkBlock}\n</head>`);
  if (updated === html) {
    throw new Error('Could not inject responsive-fixes.css link into index.html');
  }
  await writeFile(INDEX_PATH, updated, 'utf8');
};

const offenderNote = (offenders: Array<{ selector: string; w: number; vw: number }>) => {
  if (!offenders.length) return '';
  const sample = offenders.slice(0, 3).map((item) => `${item.selector} (${item.w.toFixed(1)}px > ${item.vw}px)`).join('; ');
  return ` offenders: ${sample}`;
};

test.describe.configure({ mode: 'serial' });

test('Responsive pages stay within viewport bounds', async ({ page }, testInfo) => {
  const baseURL = testInfo.project.use?.baseURL ?? 'http://127.0.0.1:5050';
  const [{ getPageList }, { createReportWriter }] = await Promise.all([
    import('../utils/pageList.mjs'),
    import('../utils/report.mjs'),
  ]);

  const entries = await getPageList();
  if (!entries.length) {
    test.skip(true, 'No HTML pages found under docs/ for responsive audit');
  }

  const report = await createReportWriter();
  const summaryPages: Array<{
    url: string;
    relativePath: string;
    results: Array<{
      viewport: { width: number; height: number };
      overflow: boolean;
      offenders: Array<{ selector: string; w: number; vw: number }>;
      screenshot: string;
      json: string;
    }>;
  }> = [];

  const applyFixes = shouldApplyFixes();
  let cssWritten = false;
  let linkUpdated = false;

  const allowedHost = /(?:localhost|127\.0\.0\.1)/i;

  await page.route('**/*', (route) => {
    const requestUrl = route.request().url();
    if (requestUrl.startsWith('about:') || requestUrl.startsWith('data:') || requestUrl.startsWith('blob:')) {
      return route.continue();
    }
    if (requestUrl.startsWith(baseURL)) {
      return route.continue();
    }
    if (allowedHost.test(requestUrl)) {
      return route.continue();
    }
    return route.abort();
  });

  try {
    for (const entry of entries) {
      const pageSummary = { url: entry.url, relativePath: entry.relativePath, results: [] as Array<{ viewport: { width: number; height: number }; overflow: boolean; offenders: Array<{ selector: string; w: number; vw: number }>; screenshot: string; json: string }> };
      for (const viewport of VIEWPORTS) {
        const label = viewportLabel(viewport);
        await test.step(`${entry.url} @ ${label}`, async () => {
          await page.setViewportSize(viewport);
          const target = new URL(entry.url, baseURL).toString();
          await page.goto(target, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('body', { timeout: 15_000 });
          const evaluation = await page.evaluate(() => {
            const doc = document.documentElement;
            const overflow = doc.scrollWidth > doc.clientWidth;
            const offenders: Array<{ selector: string; w: number; vw: number }> = [];
            if (overflow) {
              const elements = Array.from(document.querySelectorAll('body *')) as HTMLElement[];
              for (const el of elements) {
                const rect = el.getBoundingClientRect();
                if (rect.width > window.innerWidth + 1) {
                  let selector = '';
                  if (el.id) {
                    selector = `#${el.id}`;
                  } else if (typeof el.className === 'string' && el.className.trim()) {
                    selector = `.${el.className.trim().replace(/\s+/g, '.')}`;
                  } else {
                    selector = el.tagName.toLowerCase();
                  }
                  offenders.push({ selector, w: Number(rect.width.toFixed(2)), vw: window.innerWidth });
                }
              }
            }
            return { overflow, offenders };
          });

          const viewportLabelText = viewportLabel(viewport);
          const expectation = expect.soft(evaluation.overflow, `${entry.url} overflow at ${viewportLabelText}${offenderNote(evaluation.offenders)}`);
          expectation.toBeFalsy();

          const artifacts = await report.artifactPaths(entry.safeName, viewportLabelText);
          await page.screenshot({ path: artifacts.screenshotPath, fullPage: true });
          const casePayload = {
            url: entry.url,
            relativePath: entry.relativePath,
            viewport,
            overflow: evaluation.overflow,
            offenders: evaluation.offenders,
          };
          await writeFile(artifacts.jsonPath, `${JSON.stringify(casePayload, null, 2)}\n`, 'utf8');

          pageSummary.results.push({
            viewport,
            overflow: evaluation.overflow,
            offenders: evaluation.offenders,
            screenshot: artifacts.relativeScreenshot,
            json: artifacts.relativeJson,
          });

          if (evaluation.overflow && applyFixes) {
            if (!cssWritten) {
              await ensureCssFile();
              cssWritten = true;
            }
            if (!linkUpdated) {
              await ensureCssLink();
              linkUpdated = true;
            }
          }
        });
      }
      summaryPages.push(pageSummary);
    }
  } finally {
    await page.unroute('**/*');
  }

  await report.writeSummary(summaryPages);
});
