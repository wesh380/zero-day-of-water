#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, firefox, webkit } from 'playwright';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { AxeBuilder } from '@axe-core/playwright';
import { XMLParser } from 'fast-xml-parser';
import { stringify as csvStringify } from 'csv-stringify/sync';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

import {
  DOMAIN,
  START_PATHS,
  MAX_PAGES,
  RATE_LIMIT_RPS,
  TIMEOUT_MS,
  BROWSERS,
  VIEWPORTS,
  THEMES,
  LANG_DIRS,
  ZOOM_LEVELS,
  MOTION_PREFS,
  EXCLUDE_PATHS,
  STOP_CONDITIONS,
  OUTPUT_BASE_DIR,
  LIGHTHOUSE_MAX_PAGES,
  TAP_TARGET_MIN_SIZE,
  MIN_FONT_SIZE_PX,
  getAuditDate,
  resolveOutputDir,
  REPORT_PATHS,
  SUMMARY_FILENAME,
  FINDINGS_FILENAME,
  LATEST_MARKER
} from './config.mjs';

const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith('--date='))?.split('=')[1];
const auditDate = getAuditDate(dateArg);
const outputRoot = resolveOutputDir(auditDate);
const outputDir = path.join(process.cwd(), outputRoot);
const screenshotDir = path.join(outputDir, REPORT_PATHS.screenshots);
const diffDir = path.join(outputDir, REPORT_PATHS.diffs);
const reportsDir = path.join(outputDir, REPORT_PATHS.reports);
const domainOrigin = new URL(DOMAIN).origin;

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toSlug(urlStr) {
  try {
    const url = new URL(urlStr);
    const pathname = url.pathname.replace(/\/+$/, '') || 'home';
    return pathname
      .split('/')
      .filter(Boolean)
      .join('-')
      .replace(/[^a-zA-Z0-9\-]/g, '-');
  } catch (err) {
    return 'unknown';
  }
}

function shouldExclude(urlStr) {
  try {
    const url = new URL(urlStr);
    return EXCLUDE_PATHS.some((excluded) => url.pathname.startsWith(excluded));
  } catch (err) {
    return true;
  }
}

async function fetchSitemapPages() {
  const sitemapUrl = new URL('/sitemap.xml', DOMAIN).toString();
  try {
    const response = await fetchWithTimeout(sitemapUrl);
    if (!response.ok) return [];
    const text = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(text);
    const urls = new Set();
    if (parsed?.urlset?.url) {
      const entries = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
      for (const entry of entries) {
        if (entry.loc) {
          urls.add(entry.loc.trim());
        }
      }
    }
    return Array.from(urls);
  } catch (error) {
    console.warn(`Failed to load sitemap: ${error.message}`);
    return [];
  }
}

async function bfsPages(limit = MAX_PAGES) {
  const visited = new Set();
  const queue = START_PATHS.map((path) => new URL(path, DOMAIN).toString());
  const results = [];
  let repeat4xx = 0;
  while (queue.length && results.length < limit) {
    const current = queue.shift();
    if (visited.has(current) || shouldExclude(current)) continue;
    visited.add(current);
    try {
      const res = await fetchWithTimeout(current, { method: 'HEAD' });
      if (res.status >= 400) {
        repeat4xx += 1;
        if (repeat4xx >= STOP_CONDITIONS.repeat_4xx) {
          console.warn(`Stopping crawl after ${repeat4xx} consecutive 4xx responses.`);
          break;
        }
        continue;
      }
      repeat4xx = 0;
    } catch (error) {
      console.warn(`Skipping ${current}: ${error.message}`);
      continue;
    }
    results.push(current);
    if (results.length >= limit) break;
    try {
      const res = await fetchWithTimeout(current);
      if (!res.ok) continue;
      const html = await res.text();
      const linkMatches = html.matchAll(/href\s*=\s*"([^"]+)"/gi);
      for (const match of linkMatches) {
        const href = match[1];
        if (!href) continue;
        try {
          const url = new URL(href, current);
          if (url.origin === domainOrigin && !shouldExclude(url.toString())) {
            queue.push(url.toString());
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch links for ${current}: ${error.message}`);
    }
    await delay(1000 / RATE_LIMIT_RPS);
  }
  return results;
}

function buildIssue(base, overrides = {}) {
  return Object.assign({
    page: base.page,
    browser: base.browser,
    viewport: base.viewport,
    theme: base.theme,
    language: base.language,
    direction: base.direction,
    zoom: base.zoom,
    motion: base.motion,
    issueType: 'generic',
    severity: 'P3',
    selector: 'html',
    evidence: '',
    suggestedFix: '',
    boundingBox: null
  }, overrides);
}

function analyzeTapTargets(data, baseIssue) {
  const issues = [];
  for (const target of data.tapTargets) {
    const severity = target.size < TAP_TARGET_MIN_SIZE ? 'P2' : 'P3';
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'tap-target',
        severity,
        selector: target.selector,
        evidence: `Tap target ${target.selector} has ${target.size.toFixed(1)}px smallest dimension`,
        suggestedFix: 'Increase the tap target size to at least 44px or add padding/margin.',
        boundingBox: target.boundingBox
      })
    );
  }
  return issues;
}

function analyzeFonts(data, baseIssue) {
  const issues = [];
  for (const typo of data.smallFonts) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'typography',
        severity: 'P3',
        selector: typo.selector,
        evidence: `Font size ${typo.fontSize.toFixed(1)}px below recommended minimum`,
        suggestedFix: 'Increase font size to at least 14px and ensure adequate line-height.',
        boundingBox: typo.boundingBox
      })
    );
  }
  return issues;
}

function analyzeOverflows(data, baseIssue) {
  const issues = [];
  if (data.horizontalOverflow) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'horizontal-overflow',
        severity: 'P1',
        selector: data.horizontalOverflow.selector,
        evidence: `Horizontal overflow detected: scroll width ${data.horizontalOverflow.scrollWidth}px`,
        suggestedFix: 'Allow layout to wrap, remove fixed widths, or add max-width:100%.',
        boundingBox: data.horizontalOverflow.boundingBox
      })
    );
  }
  for (const overflow of data.overflowElements) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'overflow-element',
        severity: 'P2',
        selector: overflow.selector,
        evidence: `Element overflows viewport with scrollWidth ${overflow.scrollWidth}px`,
        suggestedFix: 'Use responsive sizing, overflow-wrap, or allow flex/grid wrapping.',
        boundingBox: overflow.boundingBox
      })
    );
  }
  return issues;
}

function analyzeImages(data, baseIssue) {
  const issues = [];
  for (const img of data.imagesWithoutResponsiveAttrs) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'responsive-image',
        severity: 'P4',
        selector: img.selector,
        evidence: 'Image missing responsive srcset/sizes attributes',
        suggestedFix: 'Provide srcset/sizes or <picture> for better responsive loading.',
        boundingBox: img.boundingBox
      })
    );
  }
  for (const img of data.imagesOverflowing) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'image-overflow',
        severity: 'P2',
        selector: img.selector,
        evidence: 'Image exceeds viewport width and lacks max-width constraint.',
        suggestedFix: 'Add max-width: 100% and responsive sizing.',
        boundingBox: img.boundingBox
      })
    );
  }
  return issues;
}

function analyzeRTL(data, baseIssue) {
  const issues = [];
  for (const mismatch of data.directionMismatches) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'rtl-ltr',
        severity: 'P3',
        selector: mismatch.selector,
        evidence: `Directional style ${mismatch.property}: ${mismatch.value} may break RTL/LTR layouts`,
        suggestedFix: 'Replace left/right with logical properties (inline-start/inline-end).',
        boundingBox: mismatch.boundingBox
      })
    );
  }
  return issues;
}

function analyzeCLS(data, baseIssue) {
  const issues = [];
  if (data.cumulativeLayoutShift && data.cumulativeLayoutShift.value > 0.1) {
    issues.push(
      buildIssue(baseIssue, {
        issueType: 'layout-shift',
        severity: data.cumulativeLayoutShift.value > 0.25 ? 'P2' : 'P3',
        selector: data.cumulativeLayoutShift.topSelector,
        evidence: `CLS score ${data.cumulativeLayoutShift.value.toFixed(3)} with shifting element ${data.cumulativeLayoutShift.topSelector}`,
        suggestedFix: 'Reserve space for content and avoid late-loading size changes.',
        boundingBox: data.cumulativeLayoutShift.boundingBox
      })
    );
  }
  return issues;
}

function mapAxeFindings(axeResults, baseIssue) {
  const impactToSeverity = {
    critical: 'P1',
    serious: 'P2',
    moderate: 'P3',
    minor: 'P4'
  };
  const issues = [];
  if (!axeResults?.violations) return issues;
  for (const violation of axeResults.violations) {
    for (const node of violation.nodes) {
      issues.push(
        buildIssue(baseIssue, {
          issueType: `axe:${violation.id}`,
          severity: impactToSeverity[violation.impact] ?? 'P3',
          selector: node.target?.[0] ?? violation.id,
          evidence: `${violation.help}: ${node.failureSummary}`,
          suggestedFix: violation.helpUrl || 'Resolve according to WCAG guidance.',
          boundingBox: node.elementBounds ?? null
        })
      );
    }
  }
  return issues;
}

function computeStats(findings) {
  const stats = {
    totalFindings: findings.length,
    pagesWithP1: new Set(),
    severityCounts: { P1: 0, P2: 0, P3: 0, P4: 0 },
    issuesByType: new Map()
  };
  for (const finding of findings) {
    stats.severityCounts[finding.severity] += 1;
    const key = `${finding.page}|${finding.issueType}`;
    stats.issuesByType.set(key, (stats.issuesByType.get(key) ?? 0) + 1);
    if (finding.severity === 'P1') {
      stats.pagesWithP1.add(finding.page);
    }
  }
  return stats;
}

async function loadPageData(page) {
  return await page.evaluate(({ tapSize, minFontSize }) => {
    const root = document.documentElement;
    const viewportWidth = window.innerWidth;

    function selectorFor(el) {
      if (!(el instanceof Element)) return 'unknown';
      if (el.id) return `#${el.id}`;
      const parts = [];
      let current = el;
      while (current && parts.length < 5) {
        let part = current.tagName.toLowerCase();
        if (current.classList.length) {
          part += '.' + Array.from(current.classList).slice(0, 2).join('.');
        }
        const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((c) => c.tagName === current.tagName) : [];
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join(' > ');
    }

    function serializeRect(rect) {
      if (!rect) return null;
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }

    const overflow = root.scrollWidth > viewportWidth + 1;
    let overflowSelector = 'html';
    let overflowBounding = null;
    if (overflow) {
      const bodyOverflow = Array.from(document.body.querySelectorAll('*')).find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > viewportWidth + 1;
      });
      if (bodyOverflow) {
        overflowSelector = selectorFor(bodyOverflow);
        overflowBounding = serializeRect(bodyOverflow.getBoundingClientRect());
      }
    }

    const overflowElements = [];
    for (const el of document.body.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const computed = window.getComputedStyle(el);
      if (['fixed', 'absolute'].includes(computed.position)) continue;
      if (el.scrollWidth - rect.width > 2 && rect.width > viewportWidth) {
        overflowElements.push({
          selector: selectorFor(el),
          scrollWidth: el.scrollWidth,
          boundingBox: serializeRect(rect)
        });
      }
    }

    const tapTargets = [];
    const interactiveSelectors = 'a, button, [role="button"], [role="link"], input, textarea, select, [onclick]';
    for (const el of document.querySelectorAll(interactiveSelectors)) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      const smallest = Math.min(rect.width, rect.height);
      if (smallest < tapSize) {
        tapTargets.push({
          selector: selectorFor(el),
          size: smallest,
          boundingBox: serializeRect(rect)
        });
      }
    }

    const smallFonts = [];
    for (const el of document.querySelectorAll('*')) {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize || '0');
      if (fontSize && fontSize < minFontSize) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        smallFonts.push({
          selector: selectorFor(el),
          fontSize,
          boundingBox: serializeRect(rect)
        });
      }
    }

    const imagesWithoutResponsiveAttrs = [];
    const imagesOverflowing = [];
    for (const img of document.querySelectorAll('img')) {
      const rect = img.getBoundingClientRect();
      const selector = selectorFor(img);
      const boundingBox = serializeRect(rect);
      if (!img.srcset && !img.sizes) {
        imagesWithoutResponsiveAttrs.push({ selector, boundingBox });
      }
      if (rect.width > viewportWidth && !img.style.maxWidth) {
        imagesOverflowing.push({ selector, boundingBox });
      }
    }

    const directionMismatches = [];
    for (const el of document.querySelectorAll('*')) {
      const style = window.getComputedStyle(el);
      if (style.left !== 'auto' || style.right !== 'auto') {
        directionMismatches.push({
          selector: selectorFor(el),
          property: style.left !== 'auto' ? 'left' : 'right',
          value: style.left !== 'auto' ? style.left : style.right,
          boundingBox: serializeRect(el.getBoundingClientRect())
        });
      }
    }

    const layoutShift = window.__layoutShiftEntries?.reduce(
      (acc, entry) => {
        if (entry.hadRecentInput) return acc;
        acc.value += entry.value;
        if (!acc.topEntry || entry.value > acc.topEntry.value) {
          acc.topEntry = entry;
        }
        return acc;
      },
      { value: 0, topEntry: null }
    );

    let cls = null;
    if (layoutShift && layoutShift.topEntry) {
      const topSource = layoutShift.topEntry.sources?.[0] ?? null;
      const selector = topSource?.selector ?? 'layout-shift-source';
      const boundingBox = topSource?.currentRect
        ? serializeRect({
            x: topSource.currentRect.x,
            y: topSource.currentRect.y,
            width: topSource.currentRect.width,
            height: topSource.currentRect.height
          })
        : null;
      cls = {
        value: layoutShift.value,
        topSelector: selector,
        boundingBox
      };
    }

    const horizontalOverflow = overflow
      ? { selector: overflowSelector, scrollWidth: root.scrollWidth, boundingBox: overflowBounding }
      : null;

    return {
      horizontalOverflow,
      overflowElements,
      tapTargets,
      smallFonts,
      imagesWithoutResponsiveAttrs,
      imagesOverflowing,
      directionMismatches,
      cumulativeLayoutShift: cls
    };
  }, { tapSize: TAP_TARGET_MIN_SIZE, minFontSize: MIN_FONT_SIZE_PX });
}

function formatModeKey({ viewport, theme, direction, language, zoom, motion }) {
  return `${viewport}-${theme}-${direction}-${language}-z${zoom.toFixed(2)}-${motion}`;
}

function makeScreenshotPath(pageSlug, browser, comboKey) {
  return path.join(screenshotDir, pageSlug, browser, `${comboKey}.png`);
}

function makeDiffPath(pageSlug, browser, comboKeyA, comboKeyB) {
  return path.join(diffDir, pageSlug, browser, `${comboKeyA}__vs__${comboKeyB}.png`);
}

async function createDiffImage(pathA, pathB, outputPath) {
  try {
    const [imgA, imgB] = await Promise.all([sharp(pathA).raw().ensureAlpha().toBuffer({ resolveWithObject: true }), sharp(pathB).raw().ensureAlpha().toBuffer({ resolveWithObject: true })]);
    if (imgA.info.width !== imgB.info.width || imgA.info.height !== imgB.info.height) {
      return;
    }
    const diffBuffer = Buffer.alloc(imgA.info.width * imgA.info.height * 4);
    pixelmatch(imgA.data, imgB.data, diffBuffer, imgA.info.width, imgA.info.height, { threshold: 0.1 });
    await sharp(diffBuffer, { raw: { width: imgA.info.width, height: imgA.info.height, channels: 4 } }).png().toFile(outputPath);
  } catch (error) {
    console.warn(`Failed to create diff ${outputPath}: ${error.message}`);
  }
}

async function runLighthouseAudits(pages) {
  const results = [];
  const launcher = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
  try {
    const options = { port: launcher.port, output: 'json', logLevel: 'error' };
    const config = null;
    for (const pageUrl of pages.slice(0, LIGHTHOUSE_MAX_PAGES)) {
      try {
        const runnerResult = await lighthouse(pageUrl, options, config);
        results.push({
          url: pageUrl,
          categories: Object.fromEntries(
            Object.entries(runnerResult.lhr.categories).map(([key, value]) => [key, { score: value.score, title: value.title }])
          ),
          audits: runnerResult.lhr.audits
        });
      } catch (error) {
        console.warn(`Lighthouse failed for ${pageUrl}: ${error.message}`);
      }
    }
  } finally {
    await launcher.kill();
  }
  return results;
}

async function ensureLatestMarker() {
  await ensureDir(path.join(process.cwd(), OUTPUT_BASE_DIR));
  const markerPath = path.join(process.cwd(), OUTPUT_BASE_DIR, LATEST_MARKER);
  await writeFile(markerPath, JSON.stringify({ date: auditDate, generatedAt: new Date().toISOString() }, null, 2));
}

async function writeFindings(findings, combos, lighthouseResults) {
  await ensureDir(reportsDir);
  const findingsPath = path.join(reportsDir, FINDINGS_FILENAME);
  const summaryPath = path.join(reportsDir, SUMMARY_FILENAME);
  const stats = computeStats(findings);
  const summary = {
    auditDate,
    totalPages: combos.pages.size,
    totalScenarios: combos.totalScenarios,
    severityCounts: stats.severityCounts,
    pagesWithP1: Array.from(stats.pagesWithP1),
    lighthouse: lighthouseResults.map((item) => ({ url: item.url, categories: item.categories })),
    generatedAt: new Date().toISOString()
  };
  await writeFile(findingsPath, JSON.stringify({ findings, lighthouse: lighthouseResults }, null, 2));
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));

  const csvPath = path.join(reportsDir, 'findings.csv');
  const records = findings.map((finding) => ({
    Page: finding.page,
    Browser: finding.browser,
    Viewport: finding.viewport,
    Theme: finding.theme,
    Language: finding.language,
    Direction: finding.direction,
    Zoom: finding.zoom,
    Motion: finding.motion,
    IssueType: finding.issueType,
    Severity: finding.severity,
    Selector: finding.selector,
    Evidence: finding.evidence,
    SuggestedFix: finding.suggestedFix,
    BoundingBox: finding.boundingBox ? JSON.stringify(finding.boundingBox) : ''
  }));
  const csv = csvStringify(records, { header: true });
  await writeFile(csvPath, csv);
}

async function saveSummaryToConsole(findings, combos) {
  const stats = computeStats(findings);
  const totalPages = combos.pages.size;
  const pagesWithoutP1 = totalPages - stats.pagesWithP1.size;
  const passRate = totalPages === 0 ? 0 : Math.round((pagesWithoutP1 / totalPages) * 100);
  const typeCounts = {};
  for (const finding of findings) {
    typeCounts[finding.issueType] = (typeCounts[finding.issueType] ?? 0) + 1;
  }
  const sortedIssues = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log('Responsive audit summary');
  console.log(`Pages covered: ${totalPages}`);
  console.log(`Scenarios executed: ${combos.totalScenarios}`);
  console.log(`Pages passing without P1 issues: ${passRate}%`);
  console.log('Top recurring issues:');
  for (const [issueType, count] of sortedIssues) {
    console.log(`  - ${issueType}: ${count}`);
  }
  const byPage = new Map();
  for (const finding of findings) {
    const key = finding.page;
    if (!byPage.has(key)) byPage.set(key, []);
    byPage.get(key).push(finding);
  }
  const pageRisk = Array.from(byPage.entries())
    .map(([page, list]) => {
      const riskScore = list.reduce((acc, item) => {
        const weight = item.severity === 'P1' ? 4 : item.severity === 'P2' ? 3 : item.severity === 'P3' ? 2 : 1;
        return acc + weight;
      }, 0);
      return { page, riskScore };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);
  console.log('Highest risk pages:');
  for (const entry of pageRisk) {
    console.log(`  - ${entry.page}: score ${entry.riskScore}`);
  }
  console.log(`Report path: ${path.join(outputRoot, REPORT_PATHS.reports, 'responsive-findings.md')}`);
  return stats;
}

async function ensureOutputStructure() {
  await ensureDir(screenshotDir);
  await ensureDir(diffDir);
  await ensureDir(reportsDir);
}

async function createInitScripts(context, options) {
  await context.addInitScript(({ dir, lang }) => {
    function selectorFor(el) {
      if (!(el instanceof Element)) return 'unknown';
      if (el.id) return `#${el.id}`;
      const parts = [];
      let current = el;
      while (current && parts.length < 5) {
        let part = current.tagName.toLowerCase();
        if (current.classList.length) {
          part += '.' + Array.from(current.classList).slice(0, 2).join('.');
        }
        const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((c) => c.tagName === current.tagName) : [];
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join(' > ');
    }

    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    window.__layoutShiftEntries = [];
    try {
      new PerformanceObserver((list) => {
        window.__layoutShiftEntries.push(
          ...list.getEntries().map((entry) => ({
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            sources: entry.sources?.map((source) => {
              const node = source.node;
              const selector = node && node instanceof Element ? selectorFor(node) : 'unknown';
              return {
                selector,
                currentRect: source.currentRect,
                previousRect: source.previousRect
              };
            }) ?? []
          }))
        );
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer failed', error);
    }
  }, options);
}

async function runScenario(browserName, pageUrl, viewport, theme, langDir, zoom, motion, comboState, findings) {
  const browserType = { chromium, firefox, webkit }[browserName];
  if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    colorScheme: theme,
    locale: langDir.lang,
    reducedMotion: motion,
    timezoneId: 'UTC'
  });
  try {
    await createInitScripts(context, { dir: langDir.dir, lang: langDir.lang });
    const page = context.pages()[0] ?? (await context.newPage());
    await page.setDefaultTimeout(TIMEOUT_MS);
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: TIMEOUT_MS });
    if (zoom !== 1) {
      await page.evaluate((z) => {
        document.body.style.transformOrigin = 'top left';
        document.body.style.transform = `scale(${z})`;
        document.body.style.width = `${100 / z}%`;
      }, zoom);
    }
    await page.waitForTimeout(1_000);
    const baseIssue = {
      page: pageUrl,
      browser: browserName,
      viewport: viewport.name,
      theme,
      language: langDir.lang,
      direction: langDir.dir,
      zoom,
      motion
    };
    const data = await loadPageData(page);
    const axeResults = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const issues = [
      ...analyzeOverflows(data, baseIssue),
      ...analyzeTapTargets(data, baseIssue),
      ...analyzeFonts(data, baseIssue),
      ...analyzeImages(data, baseIssue),
      ...analyzeRTL(data, baseIssue),
      ...analyzeCLS(data, baseIssue),
      ...mapAxeFindings(axeResults, baseIssue)
    ];
    findings.push(...issues);

    const comboKey = formatModeKey({
      viewport: viewport.name,
      theme,
      direction: langDir.dir,
      language: langDir.lang,
      zoom,
      motion
    });
    const pageSlug = toSlug(pageUrl);
    const screenshotPath = makeScreenshotPath(pageSlug, browserName, comboKey);
    await ensureDir(path.dirname(screenshotPath));
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const diffKey = `${pageSlug}|${browserName}|${theme}|${langDir.dir}|${langDir.lang}|${zoom}|${motion}`;
    if (!comboState.has(diffKey)) {
      comboState.set(diffKey, []);
    }
    const prevScreens = comboState.get(diffKey);
    if (prevScreens.length > 0) {
      const last = prevScreens[prevScreens.length - 1];
      const diffPath = makeDiffPath(pageSlug, browserName, last.comboKey, comboKey);
      await ensureDir(path.dirname(diffPath));
      await createDiffImage(last.path, screenshotPath, diffPath);
    }
    prevScreens.push({ comboKey, path: screenshotPath });

    comboState.pages.add(pageUrl);
    comboState.totalScenarios += 1;
  } catch (error) {
    const baseIssue = {
      page: pageUrl,
      browser: browserName,
      viewport: viewport.name,
      theme,
      language: langDir.lang,
      direction: langDir.dir,
      zoom,
      motion
    };
    findings.push(
      buildIssue(baseIssue, {
        issueType: 'navigation-failure',
        severity: 'P1',
        evidence: `Failed to render scenario: ${error.message}`,
        suggestedFix: 'Investigate network errors, script exceptions, or timeouts preventing render.'
      })
    );
    console.error(`Scenario failed for ${pageUrl} (${browserName} ${viewport.name} ${theme} ${langDir.lang} zoom ${zoom} motion ${motion}): ${error.stack}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  await ensureOutputStructure();
  await ensureLatestMarker();

  let pages = await fetchSitemapPages();
  if (!pages.length) {
    pages = await bfsPages();
  }
  pages = pages.filter((pageUrl, index) => index < MAX_PAGES && !shouldExclude(pageUrl));

  const comboState = new Map();
  comboState.pages = new Set();
  comboState.totalScenarios = 0;

  const findings = [];

  for (const pageUrl of pages) {
    for (const browserName of BROWSERS) {
      for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) {
          for (const langDir of LANG_DIRS) {
            for (const zoom of ZOOM_LEVELS) {
              for (const motion of MOTION_PREFS) {
                await runScenario(browserName, pageUrl, viewport, theme, langDir, zoom, motion, comboState, findings);
              }
            }
          }
        }
      }
    }
  }

  const lighthouseResults = await runLighthouseAudits(pages);

  await writeFindings(findings, comboState, lighthouseResults);
  const stats = await saveSummaryToConsole(findings, comboState);
  if (stats.pagesWithP1.size > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
