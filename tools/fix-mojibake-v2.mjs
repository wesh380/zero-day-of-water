#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const REPORT_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'fix-v2-report.json');

const CP1252_REVERSE = new Map([
  [0x20AC, 0x80],
  [0x201A, 0x82],
  [0x0192, 0x83],
  [0x201E, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02C6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8A],
  [0x2039, 0x8B],
  [0x0152, 0x8C],
  [0x017D, 0x8E],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201C, 0x93],
  [0x201D, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02DC, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9A],
  [0x203A, 0x9B],
  [0x0153, 0x9C],
  [0x017E, 0x9E],
  [0x0178, 0x9F],
]);

function cp1252BufferFrom(text) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++;
      }
    }
    if (code <= 0xff) {
      bytes.push(code);
    } else if (CP1252_REVERSE.has(code)) {
      bytes.push(CP1252_REVERSE.get(code));
    } else {
      return null;
    }
  }
  return Buffer.from(bytes);
}

function decodePath(p) {
  if (p.startsWith('file://')) {
    return new URL(p).pathname;
  }
  return p;
}

function countMatches(str, regex) {
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

function countTokens(str) {
  const pattern1 = /[ØÙÛÂÃð]/g;
  const pattern2 = /(â€|â€“|â€¦|œ|‹|�|âš|ï¸|â‚)/g;
  return countMatches(str, pattern1) + countMatches(str, pattern2);
}

function countFa(str) {
  return countMatches(str, /[\u0600-\u06FF]/g);
}

function countLetters(str) {
  return countMatches(str, /[A-Za-z\u0600-\u06FF]/g);
}

function shouldFix(text) {
  const tokens = countTokens(text);
  if (tokens === 0) return false;
  const letters = countLetters(text);
  if (letters === 0) return true;
  if (tokens >= 5) return true;
  return tokens / letters > 0.01;
}

function fixText(text) {
  if (!shouldFix(text)) {
    return { changed: false, text };
  }
  let fixed;
  const buffer = cp1252BufferFrom(text);
  if (!buffer) {
    return { changed: false, text };
  }
  try {
    fixed = buffer.toString('utf8');
  } catch (err) {
    return { changed: false, text };
  }
  if (fixed.includes('\uFFFD')) {
    return { changed: false, text };
  }
  const tokensBefore = countTokens(text);
  const tokensAfter = countTokens(fixed);
  const faBefore = countFa(text);
  const faAfter = countFa(fixed);
  if (tokensAfter < tokensBefore && faAfter >= faBefore) {
    return { changed: true, text: fixed };
  }
  return { changed: false, text };
}

function ensureUtf8Meta(html) {
  return html.replace(/<head([^>]*)>([\s\S]*?)<\/head>/gi, (match, attrs, inner) => {
    let content = inner;
    content = content.replace(/<meta[^>]*http-equiv=["']?Content-Type["']?[^>]*>\s*/gi, '');
    content = content.replace(/<meta[^>]*charset[^>]*>\s*/gi, '');

    const prefixMatch = content.match(/^(\s*(?:<!--[\s\S]*?-->\s*)*)/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const rest = content.slice(prefix.length);
    let insertion = '<meta charset="utf-8">';
    if (rest.length > 0 && !rest.startsWith('\n')) {
      const indentMatch = prefix.match(/(?:\n)([ \t]*)$/);
      const indent = indentMatch ? indentMatch[1] : '';
      insertion += `\n${indent}`;
    }
    return `<head${attrs}>${prefix}${insertion}${rest}</head>`;
  });
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const paths = [];
  let write = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--write') {
      write = true;
    } else if (arg === '--paths') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        paths.push(decodePath(args[i]));
        i++;
      }
      i--;
    } else {
      paths.push(decodePath(arg));
    }
  }
  if (paths.length === 0) {
    console.error('No paths provided. Use --paths <list...>');
    process.exit(1);
  }
  return { paths, write };
}

function readReport() {
  try {
    const raw = fs.readFileSync(REPORT_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      const map = new Map();
      for (const entry of data) {
        if (entry && typeof entry.path === 'string') {
          map.set(entry.path, entry);
        }
      }
      return map;
    }
  } catch (err) {
    // ignore
  }
  return new Map();
}

function writeReport(map) {
  const data = Array.from(map.values());
  fs.writeFileSync(REPORT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function processFile(filePath, write) {
  const original = fs.readFileSync(filePath, 'utf8');
  const parts = original.split(/(<[^>]+>)/g);
  let inScript = 0;
  let inStyle = 0;
  let touchedChunks = 0;
  let tokensBeforeTotal = 0;
  let tokensAfterTotal = 0;
  let faBeforeTotal = 0;
  let faAfterTotal = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    if (part.startsWith('<')) {
      if (part.startsWith('<!--') && part.endsWith('-->')) {
        const commentBody = part.slice(4, -3);
        tokensBeforeTotal += countTokens(commentBody);
        faBeforeTotal += countFa(commentBody);
        if (inScript === 0 && inStyle === 0) {
          const { changed, text } = fixText(commentBody);
          if (changed) {
            parts[i] = `<!--${text}-->`;
            touchedChunks++;
            tokensAfterTotal += countTokens(text);
            faAfterTotal += countFa(text);
          } else {
            tokensAfterTotal += countTokens(commentBody);
            faAfterTotal += countFa(commentBody);
          }
        } else {
          tokensAfterTotal += countTokens(commentBody);
          faAfterTotal += countFa(commentBody);
        }
        continue;
      }
      let currentPart = part;
      const tagMatch = currentPart.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        const isClosing = /^<\//.test(part);
        if (!isClosing && tagName !== 'script' && tagName !== 'style') {
          let mutated = false;
          currentPart = currentPart.replace(/(=)("([^"]*)"|'([^']*)')/g, (match, eq, quoted, doubleContent, singleContent) => {
            const quoteChar = quoted[0];
            const value = doubleContent !== undefined ? doubleContent : singleContent !== undefined ? singleContent : '';
            const tokensBeforeValue = countTokens(value);
            const faBeforeValue = countFa(value);
            tokensBeforeTotal += tokensBeforeValue;
            faBeforeTotal += faBeforeValue;
            if (tokensBeforeValue === 0) {
              tokensAfterTotal += tokensBeforeValue;
              faAfterTotal += faBeforeValue;
              return match;
            }
            const { changed, text } = fixText(value);
            if (changed) {
              mutated = true;
              touchedChunks++;
              const tokensAfterValue = countTokens(text);
              const faAfterValue = countFa(text);
              tokensAfterTotal += tokensAfterValue;
              faAfterTotal += faAfterValue;
              return `${eq}${quoteChar}${text}${quoteChar}`;
            }
            tokensAfterTotal += tokensBeforeValue;
            faAfterTotal += faBeforeValue;
            return match;
          });
          if (mutated) {
            parts[i] = currentPart;
          }
        }
        if (tagName === 'script') {
          if (isClosing) {
            if (inScript > 0) inScript--;
          } else if (!/\/>$/.test(currentPart)) {
            inScript++;
          }
        } else if (tagName === 'style') {
          if (isClosing) {
            if (inStyle > 0) inStyle--;
          } else if (!/\/>$/.test(currentPart)) {
            inStyle++;
          }
        }
      }
      continue;
    }
    const isProcessable = inScript === 0 && inStyle === 0;
    const originalText = part;
    tokensBeforeTotal += countTokens(originalText);
    faBeforeTotal += countFa(originalText);
    if (!isProcessable) {
      tokensAfterTotal += countTokens(originalText);
      faAfterTotal += countFa(originalText);
      continue;
    }
    const { changed, text } = fixText(originalText);
    if (changed) {
      parts[i] = text;
      touchedChunks++;
      tokensAfterTotal += countTokens(text);
      faAfterTotal += countFa(text);
    } else {
      tokensAfterTotal += countTokens(originalText);
      faAfterTotal += countFa(originalText);
    }
  }

  let resultContent = parts.join('');
  if (write) {
    resultContent = ensureUtf8Meta(resultContent);
    fs.writeFileSync(filePath, resultContent.replace(/\r?\n/g, '\n'), 'utf8');
  } else {
    resultContent = ensureUtf8Meta(resultContent);
  }

  return {
    touchedChunks,
    tokensBefore: tokensBeforeTotal,
    tokensAfter: tokensAfterTotal,
    faBefore: faBeforeTotal,
    faAfter: faAfterTotal,
  };
}

function main() {
  const { paths, write } = parseArgs(process.argv);
  const reportMap = readReport();
  const summary = [];

  for (const filePath of paths) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    const stats = processFile(absolutePath, write);
    summary.push({ path: filePath, ...stats });
    reportMap.set(filePath, { path: filePath, ...stats });
  }

  writeReport(reportMap);

  for (const item of summary) {
    const { path: p, touchedChunks, tokensBefore, tokensAfter, faBefore, faAfter } = item;
    console.log(`${write ? 'WRITE' : 'DRY'} ${p}`);
    console.log(`  touchedChunks: ${touchedChunks}`);
    console.log(`  tokens: ${tokensBefore} -> ${tokensAfter}`);
    console.log(`  fa: ${faBefore} -> ${faAfter}`);
  }
}

main();
