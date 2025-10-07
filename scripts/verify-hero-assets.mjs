#!/usr/bin/env node
import { readFile } from 'fs/promises';
import path from 'path';
import process from 'process';
import fg from 'fast-glob';

const allowedHeroPaths = new Set([
  '/assets/img/hero/hero-mobile.webp',
  '/assets/img/hero/hero-desktop-1280.webp',
  '/assets/img/hero/hero-desktop-1920.webp'
]);

const summary = {
  badPaths: [],
  badAvifRefs: [],
  badPreloads: [],
  heroPictures: {},
  cssBackgroundImageRefs: [],
  status: 'PENDING'
};

const pageConfigs = new Map([
  [
    path.normalize('docs/index.html'),
    {
      pageKey: 'landing',
      requireDesktopSource: false,
      requireDesktopPreload: false,
      requireMobilePreload: true
    }
  ],
  [
    path.normalize('docs/water/hub.html'),
    {
      pageKey: 'waterHub',
      requireDesktopSource: true,
      requireDesktopPreload: true,
      requireMobilePreload: true
    }
  ],
  [
    path.normalize('docs/water/insights.html'),
    {
      pageKey: 'waterInsights',
      requireDesktopSource: true,
      requireDesktopPreload: true,
      requireMobilePreload: true
    }
  ]
]);

function ensurePageSummary(pageKey) {
  if (!summary.heroPictures[pageKey]) {
    summary.heroPictures[pageKey] = {
      imgSrc: null,
      sourceWebp: [],
      preloads: {
        desktop: [],
        mobile: []
      }
    };
  }
  return summary.heroPictures[pageKey];
}

function getAttr(tag, attr) {
  const regex = new RegExp(`${attr}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i');
  const match = tag.match(regex);
  if (!match) return null;
  return match[2] ?? match[3] ?? null;
}

function getPosition(content, index) {
  const linesUntil = content.slice(0, index).split('\n');
  const line = linesUntil.length;
  const column = linesUntil[linesUntil.length - 1].length + 1;
  return { line, column };
}

function pushIssue(arr, file, content, index, value, message) {
  const pos = getPosition(content, index);
  arr.push({ file, line: pos.line, column: pos.column, value, message });
}

async function collectFiles() {
  const patterns = [
    'docs/index.html',
    'docs/**/*.html',
    'docs/assets/css/**/*.css',
    'docs/assets/js/**/*.js'
  ];
  const entries = await fg(patterns, {
    ignore: ['**/node_modules/**', '**/vendor/**', '**/dist/**', '**/images/**'],
    dot: false
  });
  return Array.from(new Set(entries.map((entry) => path.normalize(entry))));
}

function analyzeHeroReferences(file, content) {
  const heroRegex = /(\/assets\/img\/hero|\/page\/landing\/hero)[^"'\s<>)]*/g;
  for (const match of content.matchAll(heroRegex)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (value.startsWith('/page/landing/hero')) {
      pushIssue(summary.badPaths, file, content, index, value, 'legacy hero path reference');
      continue;
    }
    if (!allowedHeroPaths.has(value)) {
      pushIssue(summary.badPaths, file, content, index, value, 'unexpected hero asset reference');
    }
    if (value.endsWith('.avif')) {
      pushIssue(summary.badAvifRefs, file, content, index, value, 'hero AVIF reference is not allowed');
    }
  }
}

function checkCssBackground(file, content) {
  const heroUrlRegex = /(^|\})\s*\.hero(?:[:]{1,2}[^{]+)?[^{}]*\{[^}]*url\(/gis;
  for (const match of content.matchAll(heroUrlRegex)) {
    const index = match.index ?? 0;
    pushIssue(summary.cssBackgroundImageRefs, file, content, index, 'url(', 'hero should not define background images via url()');
  }
}

function analyzeHeroPicture(file, content, { pageKey, requireDesktopSource }) {
  const pageSummary = ensurePageSummary(pageKey);
  pageSummary.sourceWebp = [];
  const pictureMatch = content.match(/<picture[^>]*class=["']hero-picture["'][^>]*>[\s\S]*?<\/picture>/i);
  if (!pictureMatch) {
    summary.badPreloads.push({ file, line: null, column: null, value: null, message: 'hero <picture> not found' });
    return;
  }
  const pictureHtml = pictureMatch[0];
  const imgMatch = pictureHtml.match(/<img[^>]*>/i);
  if (!imgMatch) {
    summary.badPreloads.push({ file, line: null, column: null, value: null, message: 'hero <img> not found' });
  } else {
    const imgTag = imgMatch[0];
    const imgSrc = getAttr(imgTag, 'src');
    pageSummary.imgSrc = imgSrc;
    if (imgSrc !== '/assets/img/hero/hero-mobile.webp') {
      summary.badPreloads.push({ file, line: null, column: null, value: imgSrc, message: 'hero <img> src must be hero-mobile.webp' });
    }
  }

  const sourceMatches = [...pictureHtml.matchAll(/<source[^>]*>/gi)];
  const desktopSources = [];
  for (const sourceMatch of sourceMatches) {
    const sourceTag = sourceMatch[0];
    const type = getAttr(sourceTag, 'type')?.toLowerCase() ?? '';
    const media = getAttr(sourceTag, 'media') ?? '';
    if (type.includes('image/avif')) {
      summary.badAvifRefs.push({ file, line: null, column: null, value: '<source>', message: 'hero picture must not include AVIF sources' });
    }
    if (type.includes('image/webp') && media.includes('(min-width:1024px)')) {
      const srcset = getAttr(sourceTag, 'srcset') ?? '';
      const sizes = getAttr(sourceTag, 'sizes') ?? '';
      const entries = srcset.split(',').map((item) => item.trim()).filter(Boolean);
      pageSummary.sourceWebp = entries;
      desktopSources.push({ entries, sizes, media });
      const required = ['/assets/img/hero/hero-desktop-1280.webp 1280w', '/assets/img/hero/hero-desktop-1920.webp 1920w'];
      const unexpected = entries.filter((entry) => !required.includes(entry));
      const missing = required.filter((entry) => !entries.includes(entry));
      if (unexpected.length) {
        summary.badPreloads.push({ file, line: null, column: null, value: unexpected, message: 'desktop hero source has unexpected srcset entries' });
      }
      if (missing.length) {
        summary.badPreloads.push({ file, line: null, column: null, value: missing, message: 'desktop hero source missing required srcset entries' });
      }
      if (sizes.trim() !== '100vw') {
        summary.badPreloads.push({ file, line: null, column: null, value: sizes, message: 'desktop hero source sizes must be 100vw' });
      }
    }
  }

  if (requireDesktopSource && desktopSources.length === 0) {
    summary.badPreloads.push({ file, line: null, column: null, value: '(missing desktop <source>)', message: 'hero picture must include a desktop <source>' });
  }
  if (desktopSources.length > 1) {
    summary.badPreloads.push({ file, line: null, column: null, value: desktopSources.length, message: 'hero picture should include only one desktop <source>' });
  }
}

function analyzePreloads(file, content, { pageKey, requireDesktopPreload, requireMobilePreload, expectDesktopSource }) {
  const pageSummary = ensurePageSummary(pageKey);
  pageSummary.preloads.desktop = [];
  pageSummary.preloads.mobile = [];
  const preloadMatches = [...content.matchAll(/<link[^>]+rel=["']preload["'][^>]*>/gi)];
  const requiredDesktopEntries = ['/assets/img/hero/hero-desktop-1280.webp 1280w', '/assets/img/hero/hero-desktop-1920.webp 1920w'];

  for (const match of preloadMatches) {
    const tag = match[0];
    const asAttr = getAttr(tag, 'as') ?? '';
    if (asAttr !== 'image') continue;
    const href = getAttr(tag, 'href');
    if (!href) continue;
    const imagesrcset = getAttr(tag, 'imagesrcset') ?? '';
    const imagesizes = getAttr(tag, 'imagesizes') ?? '';
    const media = getAttr(tag, 'media') ?? '';
    if (!href.includes('/assets/img/hero/')) continue;
    if (!allowedHeroPaths.has(href)) {
      summary.badPreloads.push({ file, line: null, column: null, value: href, message: 'hero preload references unexpected asset' });
    }
    if (href.endsWith('.avif')) {
      summary.badAvifRefs.push({ file, line: null, column: null, value: href, message: 'hero preload must not reference AVIF asset' });
    }
    if (href === '/assets/img/hero/hero-mobile.webp') {
      const entries = imagesrcset.split(',').map((item) => item.trim()).filter(Boolean);
      pageSummary.preloads.mobile.push({ href, media, imagesrcset: entries, imagesizes });
      if (entries.some((entry) => entry !== '/assets/img/hero/hero-mobile.webp 828w')) {
        summary.badPreloads.push({ file, line: null, column: null, value: imagesrcset, message: 'mobile hero preload imagesrcset must only include hero-mobile.webp 828w' });
      }
      if (imagesizes.trim() !== '100vw') {
        summary.badPreloads.push({ file, line: null, column: null, value: imagesizes, message: 'mobile hero preload imagesizes must be 100vw' });
      }
      if (media.trim() !== '(max-width:1023.98px)') {
        summary.badPreloads.push({ file, line: null, column: null, value: media || '(missing media)', message: 'mobile hero preload media must be (max-width:1023.98px)' });
      }
    } else if (href === '/assets/img/hero/hero-desktop-1280.webp') {
      const entries = imagesrcset.split(',').map((item) => item.trim()).filter(Boolean);
      pageSummary.preloads.desktop.push({ href, media, imagesrcset: entries, imagesizes });
      const unexpected = entries.filter((entry) => !requiredDesktopEntries.includes(entry));
      const missing = requiredDesktopEntries.filter((entry) => !entries.includes(entry));
      if (unexpected.length) {
        summary.badPreloads.push({ file, line: null, column: null, value: unexpected, message: 'desktop hero preload imagesrcset has unexpected entries' });
      }
      if (missing.length) {
        summary.badPreloads.push({ file, line: null, column: null, value: missing, message: 'desktop hero preload imagesrcset missing entries' });
      }
      if (imagesizes.trim() !== '100vw') {
        summary.badPreloads.push({ file, line: null, column: null, value: imagesizes, message: 'desktop hero preload imagesizes must be 100vw' });
      }
      if (media.trim() !== '(min-width:1024px)') {
        summary.badPreloads.push({ file, line: null, column: null, value: media || '(missing media)', message: 'desktop hero preload media must be (min-width:1024px)' });
      }
    } else if (href === '/assets/img/hero/hero-desktop-1920.webp') {
      summary.badPreloads.push({ file, line: null, column: null, value: href, message: 'desktop hero preload href must be hero-desktop-1280.webp' });
    }
  }

  if (requireMobilePreload && pageSummary.preloads.mobile.length === 0) {
    summary.badPreloads.push({ file, line: null, column: null, value: '(missing mobile preload)', message: 'mobile hero preload missing' });
  }
  if (pageSummary.preloads.mobile.length > 1) {
    summary.badPreloads.push({ file, line: null, column: null, value: pageSummary.preloads.mobile.length, message: 'multiple mobile hero preloads found' });
  }

  if (requireDesktopPreload && pageSummary.preloads.desktop.length === 0) {
    summary.badPreloads.push({ file, line: null, column: null, value: '(missing desktop preload)', message: 'desktop hero preload missing' });
  }
  if (!expectDesktopSource && pageSummary.preloads.desktop.length > 0) {
    summary.badPreloads.push({ file, line: null, column: null, value: '(unused desktop preload)', message: 'desktop hero preload exists but hero picture has no matching desktop source' });
  }
  if (pageSummary.preloads.desktop.length > 1) {
    summary.badPreloads.push({ file, line: null, column: null, value: pageSummary.preloads.desktop.length, message: 'multiple desktop hero preloads found' });
  }
}

async function main() {
  const files = await collectFiles();
  await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf8');
      analyzeHeroReferences(file, content);
      if (file.endsWith('.css')) {
        checkCssBackground(file, content);
      }
      const config = pageConfigs.get(file);
      if (config) {
        analyzeHeroPicture(file, content, config);
        const pageSummary = ensurePageSummary(config.pageKey);
        const expectDesktopSource = pageSummary.sourceWebp.length > 0;
        analyzePreloads(file, content, {
          pageKey: config.pageKey,
          requireDesktopPreload: config.requireDesktopPreload,
          requireMobilePreload: config.requireMobilePreload,
          expectDesktopSource
        });
      }
    })
  );

  const hasIssues = summary.badPaths.length || summary.badAvifRefs.length || summary.badPreloads.length || summary.cssBackgroundImageRefs.length;
  summary.status = hasIssues ? 'FAIL' : 'PASS';
  const output = JSON.stringify(summary, null, 2);
  console.log(output);
  process.exitCode = hasIssues ? 1 : 0;
}

main().catch((error) => {
  console.error(JSON.stringify({ status: 'ERROR', message: error.message }, null, 2));
  process.exitCode = 1;
});
