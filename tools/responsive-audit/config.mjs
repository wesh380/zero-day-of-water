export const DOMAIN = 'https://wesh360.ir';
export const START_PATHS = ['/', '/gas/', '/water/', '/research/'];
export const MAX_PAGES = 200;
export const RATE_LIMIT_RPS = 1;
export const TIMEOUT_MS = 45_000;
export const BROWSERS = ['chromium', 'firefox', 'webkit'];
export const VIEWPORTS = [
  { name: 'Desktop-1440', width: 1440, height: 900, deviceScaleFactor: 1.0 },
  { name: 'Desktop-1920', width: 1920, height: 1080, deviceScaleFactor: 1.25 },
  { name: 'iPad-portrait', width: 834, height: 1194, deviceScaleFactor: 2.0 },
  { name: 'iPhone-12', width: 390, height: 844, deviceScaleFactor: 3.0 },
  { name: 'Android-360', width: 360, height: 800, deviceScaleFactor: 2.75 }
];
export const THEMES = ['light', 'dark'];
export const LANG_DIRS = [
  { lang: 'fa-IR', dir: 'rtl' },
  { lang: 'en', dir: 'ltr' }
];
export const ZOOM_LEVELS = [1.0, 1.25, 2.0];
export const MOTION_PREFS = ['no-preference', 'reduce'];
export const EXCLUDE_PATHS = ['/api', '/admin', '/assets'];
export const STOP_CONDITIONS = { max_pages: MAX_PAGES, repeat_4xx: 5 };
export const OUTPUT_BASE_DIR = 'docs/audits/responsive';

export const LIGHTHOUSE_MAX_PAGES = 10;
export const TAP_TARGET_MIN_SIZE = 44;
export const MIN_FONT_SIZE_PX = 14;

export function getAuditDate(input) {
  if (input) return input;
  return new Date().toISOString().slice(0, 10);
}

export function resolveOutputDir(date) {
  return `${OUTPUT_BASE_DIR}/${date}`;
}

export const REPORT_PATHS = {
  screenshots: 'screenshots',
  diffs: 'diffs',
  reports: 'reports'
};

export const SUMMARY_FILENAME = 'summary.json';
export const FINDINGS_FILENAME = 'findings.json';
export const LATEST_MARKER = 'latest.json';
