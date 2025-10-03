import fg from 'fast-glob';
import { existsSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

const DOCS_ROOT = resolve(process.cwd(), 'docs');
const CURATED = [
  '/index.html',
  '/dash/',
  '/water/',
  '/electricity/',
  '/gas/',
  '/oil/',
];

const SLASH = '/';

const toPosix = (value) => value.split(sep).join(SLASH);

const toSafeName = (url) => {
  const trimmed = url.replace(/^\/+/, '');
  const dashed = trimmed.replace(/\//g, '-').replace(/\.+/g, '-');
  const safe = dashed.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return safe.length ? safe : 'root';
};

const dedupe = (list) => Array.from(new Set(list));

const ensureCuratedPath = (entry) => {
  const trimmed = entry.replace(/^\/+/, '');
  if (!trimmed) return null;
  const base = trimmed.replace(/\/$/, '');
  const candidates = [];
  if (trimmed.endsWith('/')) {
    candidates.push(join(base, 'index.html'));
    candidates.push(`${base}.html`);
  } else {
    candidates.push(trimmed);
    candidates.push(join(trimmed, 'index.html'));
  }

  for (const candidate of dedupe(candidates)) {
    const absolute = resolve(DOCS_ROOT, candidate);
    if (existsSync(absolute)) {
      return toPosix(candidate);
    }
  }
  return null;
};

export const filePathToUrl = (filePath) => {
  const rel = toPosix(relative(DOCS_ROOT, filePath));
  const cleaned = rel.startsWith(SLASH) ? rel.slice(1) : rel;
  return `${SLASH}${cleaned}`;
};

export const getPageList = async () => {
  const shouldScanAll = Boolean(process.env.PW_ALL && process.env.PW_ALL !== '0');
  if (shouldScanAll) {
    const matches = await fg('**/*.html', {
      cwd: DOCS_ROOT,
      ignore: ['assets/**', 'dev/**'],
      dot: false,
    });
    return matches
      .map((rel) => ({
        relativePath: toPosix(rel),
        url: `${SLASH}${toPosix(rel)}`,
        safeName: toSafeName(toPosix(rel)),
        absolutePath: resolve(DOCS_ROOT, rel),
      }))
      .sort((a, b) => a.url.localeCompare(b.url));
  }

  const resolved = CURATED.map(ensureCuratedPath).filter(Boolean);
  const unique = dedupe(resolved);
  return unique
    .map((rel) => ({
      relativePath: rel,
      url: `${SLASH}${rel}`,
      safeName: toSafeName(rel),
      absolutePath: resolve(DOCS_ROOT, rel),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
};

export const docsRoot = DOCS_ROOT;
