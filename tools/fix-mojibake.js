#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const suspiciousCharRegex = /[ØÙÛÂ�]/g;
const suspiciousStringRegex = /(â€|œ|‹|�)/g;
const letterRegex = /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF]/g;

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { paths: [], relax: false, force: false };
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--paths') {
      i += 1;
      while (i < args.length && !args[i].startsWith('--')) {
        result.paths.push(args[i]);
        i += 1;
      }
      continue;
    }
    if (arg === '--relax') {
      result.relax = true;
    } else if (arg === '--force') {
      result.force = true;
    } else {
      console.warn(`Unknown flag ignored: ${arg}`);
    }
    i += 1;
  }
  return result;
}

function walkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function ensureMetaCharset(html) {
  const newline = '\n';
  let updated = html.replace(/<meta\s+http-equiv\s*=\s*["']?Content-Type["']?[^>]*>\s*/gi, '');
  updated = updated.replace(/<meta\s+charset[^>]*>\s*/gi, '');

  const headOpenMatch = updated.match(/<head[^>]*>/i);
  const headCloseIndex = updated.toLowerCase().indexOf('</head>');
  if (!headOpenMatch || headCloseIndex === -1) {
    return { content: updated, changed: updated !== html };
  }

  const headOpen = headOpenMatch[0];
  const headStart = headOpenMatch.index + headOpen.length;
  const beforeHead = updated.slice(0, headStart);
  let headInner = updated.slice(headStart, headCloseIndex);
  const afterHead = updated.slice(headCloseIndex);

  if (headInner.startsWith('\r\n')) {
    headInner = headInner.slice(2);
  } else if (headInner.startsWith('\n')) {
    headInner = headInner.slice(1);
  }

  const metaLine = `${newline}  <meta charset="utf-8">${newline}`;
  const newHeadInner = metaLine + headInner;
  const rebuilt = beforeHead + newHeadInner + afterHead;
  return { content: rebuilt, changed: rebuilt !== html };
}

function analyzeContent(content) {
  const charMatches = content.match(suspiciousCharRegex) || [];
  const stringMatches = content.match(suspiciousStringRegex) || [];
  const mojibakeTokens = charMatches.length + stringMatches.length;
  const letters = content.match(letterRegex) || [];
  const ratio = letters.length === 0 ? 0 : mojibakeTokens / letters.length;
  return { mojibakeTokens, ratio };
}

function resolvePaths(givenPaths) {
  const resolved = [];
  const errors = [];
  for (const rel of givenPaths) {
    const abs = path.resolve(process.cwd(), rel);
    if (!abs.startsWith(docsDir)) {
      errors.push({ path: rel, reason: 'outside_docs' });
      continue;
    }
    if (!abs.toLowerCase().endsWith('.html')) {
      errors.push({ path: rel, reason: 'not_html' });
      continue;
    }
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      errors.push({ path: rel, reason: 'missing' });
      continue;
    }
    resolved.push(abs);
  }
  return { resolved, errors };
}

function maybeFixFile(filePath, options, summary) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { mojibakeTokens, ratio } = analyzeContent(original);
  const thresholds = options.relax
    ? { tokens: 5, ratio: 0.005 }
    : { tokens: 20, ratio: 0.02 };

  let mustFix = mojibakeTokens >= thresholds.tokens || ratio > thresholds.ratio;
  if (options.force) {
    mustFix = true;
  }

  let content = original;
  let changed = false;
  let reason;

  if (mustFix) {
    const candidate = Buffer.from(content, 'latin1').toString('utf8');
    const shorter = candidate.length < content.length * 0.9;
    if (candidate.includes('\uFFFD')) {
      summary.push({ path: relPath(filePath), action: 'skipped', reason: 'replacement_characters' });
      return;
    }
    if (shorter) {
      summary.push({ path: relPath(filePath), action: 'skipped', reason: 'shrunk_gt_10_percent' });
      return;
    }
    if (candidate !== content) {
      content = candidate;
      changed = true;
    }
  }

  const { content: withMeta, changed: metaChanged } = ensureMetaCharset(content);
  content = withMeta;
  if (metaChanged) {
    changed = true;
  }

  if (!changed) {
    summary.push({ path: relPath(filePath), action: 'unchanged' });
    return;
  }

  content = content.replace(/\r\n/g, '\n');
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  summary.push({ path: relPath(filePath), action: 'fixed' });
}

function relPath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function main() {
  if (!fs.existsSync(docsDir)) {
    console.error('docs directory not found');
    process.exit(1);
  }

  const args = parseArgs(process.argv);
  const summary = [];
  const pathsToProcess = [];

  if (args.paths.length) {
    const { resolved, errors } = resolvePaths(args.paths);
    for (const error of errors) {
      summary.push({ path: error.path, action: 'skipped', reason: error.reason });
    }
    pathsToProcess.push(...resolved);
    if (!pathsToProcess.length) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }
  } else {
    pathsToProcess.push(...walkHtmlFiles(docsDir));
  }

  for (const file of pathsToProcess) {
    maybeFixFile(file, { relax: args.relax, force: args.force && args.paths.length > 0 }, summary);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
