#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const suspiciousRegex = /[ØÙÛÂ]|â€|œ|‹/g;
const letterRegex = /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF]/g;

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

function maybeFixFile(filePath, changedFiles) {
  const original = fs.readFileSync(filePath, 'utf8');
  const matches = original.match(suspiciousRegex) || [];
  const letters = original.match(letterRegex) || [];
  const ratio = letters.length === 0 ? 0 : matches.length / letters.length;
  const shouldFix = matches.length >= 20 || ratio > 0.02;

  let content = original;
  let changed = false;

  if (shouldFix) {
    const candidate = Buffer.from(content, 'latin1').toString('utf8');
    const shorter = candidate.length < content.length * 0.9;
    if (candidate.includes('\uFFFD') || shorter) {
      console.log('SKIP', path.relative(process.cwd(), filePath));
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
    return;
  }

  content = content.replace(/\r\n/g, '\n');
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  changedFiles.push(path.relative(process.cwd(), filePath));
}

function main() {
  if (!fs.existsSync(docsDir)) {
    console.error('docs directory not found');
    process.exit(1);
  }
  const files = walkHtmlFiles(docsDir);
  const changedFiles = [];
  for (const file of files) {
    maybeFixFile(file, changedFiles);
  }
  if (changedFiles.length) {
    console.log('Changed files:');
    for (const file of changedFiles) {
      console.log(' -', file);
    }
  } else {
    console.log('No files updated.');
  }
}

main();
