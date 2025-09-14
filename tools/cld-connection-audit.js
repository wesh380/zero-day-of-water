#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const REPORT_DIR = path.join(ROOT, 'reports');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'reports']);
const TEXT_EXTS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.html', '.htm']);

function walk(dir){
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries){
    if (entry.isDirectory()){
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...walk(path.join(dir, entry.name)));
    } else {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const PATTERNS = [
  { type: 'esm_import', regex: /(?:^\s*import\s+[^'"()]+\s+from\s+['"][^'"]+['"])|(?:import\s*\(\s*['"][^'"]+['"]\s*\))/ },
  { type: 'global_bootstrap', regex: /(?:window\.)?bootstrap\b/i },
  { type: 'inline_var', regex: /(?:window|self|globalThis)\.[a-zA-Z_$][\w$]*\s*=/ },
  { type: 'cy_add', regex: /cy\.add\s*\(/ },
  { type: 'fetch_json', regex: /fetch\s*\(\s*['"][^'"]+\.json[^'"]*['"]\s*/ }
];

function scanFile(file){
  if (!TEXT_EXTS.has(path.extname(file).toLowerCase())) return null;
  const rel = path.relative(ROOT, file);
  let content;
  try {
    content = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  } catch(err){
    return null;
  }
  const matches = [];
  content.forEach((line, idx) => {
    PATTERNS.forEach(pat => {
      if (pat.regex.test(line)){
        matches.push({ type: pat.type, line: idx + 1, text: line.trim() });
      }
    });
  });
  if (matches.length) return { file: rel, matches };
  return null;
}

function main(){
  const files = walk(DOCS_DIR);
  const results = [];
  files.forEach(file => {
    const res = scanFile(file);
    if (res) results.push(res);
  });

  fs.writeFileSync(
    path.join(REPORT_DIR, 'cld-connection-audit.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  const md = [];
  md.push('# CLD Connection Audit\n');
  results.forEach(r => {
    md.push(`## ${r.file}`);
    r.matches.forEach(m => {
      md.push(`- [${m.line}] (${m.type}) \`${m.text.replace(/`/g, '\\`')}\``);
    });
    md.push('');
  });
  fs.writeFileSync(
    path.join(REPORT_DIR, 'cld-connection-audit.md'),
    md.join('\n'),
    'utf8'
  );
  console.log(`CLD connection audit written to reports/cld-connection-audit.{md,json} (${results.length} files)`);
}

main();
