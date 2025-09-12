#!/usr/bin/env node
/*
 Test & CSP Audit Report (A5-preflight)
 - Scans npm scripts related to tests/lint/e2e/csp
 - Inventories test files and docs test pages
 - Summarizes GitHub workflows steps for test/lint/CSP
 - Inventories CSP policy definitions from docs/_headers and netlify.toml
 - Scans scripts/tools for CSP-related keywords
 - Outputs Markdown to stdout and also writes REPORTS/test-csp-audit.md
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function readJSONSafe(p){
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch(e){ return null; }
}

function listFilesRecursive(dir, opts={}){
  const { exts=null, includeDirs=false } = opts;
  const res = [];
  function walk(d){
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes:true }); } catch(_){ return; }
    for (const ent of entries){
      const fp = path.join(d, ent.name);
      if (ent.isDirectory()){
        if (includeDirs) res.push(fp);
        walk(fp);
      } else if (ent.isFile()){
        if (!exts) { res.push(fp); }
        else if (exts.includes(path.extname(ent.name).toLowerCase())) res.push(fp);
      }
    }
  }
  walk(dir);
  return res;
}

function rel(p){
  try { return path.relative(process.cwd(), p); } catch(_){ return p; }
}

function getEnvVersions(){
  const env = { node: 'unknown', npm: 'unknown' };
  try { env.node = cp.execSync('node -v', {stdio:['ignore','pipe','ignore']}).toString().trim(); } catch(_){ }
  try { env.npm  = cp.execSync('npm -v',  {stdio:['ignore','pipe','ignore']}).toString().trim(); } catch(_){ }
  return env;
}

function pickScripts(pkg){
  const out = [];
  if (!pkg || !pkg.scripts) return out;
  const RX = /(test|e2e|lint|csp|scan|puppeteer|playwright)/i;
  for (const [k, v] of Object.entries(pkg.scripts)){
    if (RX.test(k) || RX.test(String(v))) out.push({ name:k, cmd:String(v) });
  }
  return out;
}

function summarizeWorkflows(){
  const wfDir = path.join('.github','workflows');
  const files = listFilesRecursive(wfDir, { exts:['.yml','.yaml'] });
  const RX_STEP = /(npm\s+run\s+[^\n]+|npm\s+test|yarn\s+[^\n]+|pnpm\s+[^\n]+|node\s+[^\n]+|npx\s+[^\n]+)/i;
  const RX_INT = /(test|e2e|lint|csp|content-security-policy|inline\s*style|playwright|puppeteer)/i;
  const results = [];
  for (const f of files){
    let txt = '';
    try { txt = fs.readFileSync(f,'utf8'); } catch(_){ continue; }
    const lines = txt.split(/\r?\n/);
    const name = (lines.find(l=>/^name\s*:\s*/i.test(l))||'').replace(/^name\s*:\s*/i,'').trim() || path.basename(f);
    // crude jobs parse: collect job ids under jobs:
    const jobs = [];
    let inJobs = false;
    for (const l of lines){
      if (/^jobs:\s*$/.test(l)) { inJobs = true; continue; }
      if (inJobs){
        const m = l.match(/^\s{2,}([A-Za-z0-9_-]+):\s*$/); if (m) jobs.push(m[1]);
        if (/^\S/.test(l) && !/^jobs:/.test(l)) inJobs = false; // out of jobs
      }
    }
    const steps = lines.filter(l=>/\brun\s*:/i.test(l) && (RX_STEP.test(l) || RX_INT.test(l))).map(s=>s.trim());
    results.push({ file: rel(f), name, jobs, steps });
  }
  return results;
}

function inventoryHeaders(){
  const p = path.join('docs','_headers');
  let txt = '';
  try { txt = fs.readFileSync(p,'utf8'); } catch(_){ return { file: rel(p), items: [] }; }
  const lines = txt.split(/\r?\n/);
  let ctx = '';
  const items = [];
  for (const l of lines){
    const line = l.trim();
    if (/^\//.test(line)) ctx = line; // route context
    if (/content-security-policy/i.test(line) || /\b(style-src|script-src)\b/i.test(line)){
      items.push({ route: ctx || '(global)', line: line });
    }
  }
  return { file: rel(p), items };
}

function inventoryNetlify(){
  const p = path.join('netlify.toml');
  let txt = '';
  try { txt = fs.readFileSync(p,'utf8'); } catch(_){ return { file: rel(p), entries: [] }; }
  const lines = txt.split(/\r?\n/);
  const entries = [];
  for (let i=0;i<lines.length;i++){
    if (/content-security-policy/i.test(lines[i])){
      // find nearest context upwards
      let ctx = '';
      for (let j=i-1;j>=0;j--){
        const lj = lines[j].trim();
        if (/^\[\[headers\]\]/.test(lj) || /^for\s*=\s*"/.test(lj)) { ctx = lj; break; }
      }
      entries.push({ context: ctx || '(unknown)', line: lines[i].trim() });
    }
  }
  return { file: rel(p), entries };
}

function scanCspInScripts(){
  const dirs = ['scripts','tools'];
  const RX = /(\bCSP\b|Content-Security-Policy|style-src|script-src|inline-style)/i;
  const hits = [];
  for (const d of dirs){
    if (!fs.existsSync(d)) continue;
    const files = listFilesRecursive(d, { exts:['.js','.ts','.sh','.ps1','.md','.yml','.yaml','.toml'] });
    for (const f of files){
      let t='';
      try { t = fs.readFileSync(f,'utf8'); } catch(_){ continue; }
      if (RX.test(t)){
        const lines = t.split(/\r?\n/).filter(l=>RX.test(l)).slice(0,5);
        hits.push({ file: rel(f), samples: lines });
      }
    }
  }
  return hits;
}

function shortList(arr, max=10){
  return arr.slice(0, max);
}

function main(){
  const env = getEnvVersions();
  const pkg = readJSONSafe(path.join('package.json')) || {};
  const scripts = pickScripts(pkg);

  const unitFiles = fs.existsSync('tests/unit') ? listFilesRecursive('tests/unit', { exts:['.js','.ts'] }) : [];
  const e2eFiles  = fs.existsSync('tests/e2e') ? listFilesRecursive('tests/e2e',  { exts:['.js','.ts'] }) : [];
  const docsTests = fs.existsSync('docs/test') ? listFilesRecursive('docs/test', { exts:['.html','.js'] }) : [];

  const workflows = summarizeWorkflows();
  const headersInv = inventoryHeaders();
  const netlifyInv = inventoryNetlify();
  const cspScans = scanCspInScripts();

  // Gaps & suggestions
  const gaps = [];
  if (unitFiles.length === 0) gaps.push('- No unit tests detected under tests/unit');
  if (e2eFiles.length === 0) gaps.push('- No e2e tests detected under tests/e2e');
  if (workflows.length === 0) gaps.push('- No GitHub Actions workflows detected');
  if ((headersInv.items||[]).length === 0 && (netlifyInv.entries||[]).length === 0) gaps.push('- No CSP policies found in docs/_headers or netlify.toml');
  if (scripts.length === 0) gaps.push('- No npm scripts detected for tests/e2e/lint/csp');

  let md = '';
  md += '# Test & CSP Audit\n\n';
  md += '## Environment\n';
  md += `- node: ${env.node}\n`;
  md += `- npm: ${env.npm}\n\n`;

  md += '## NPM Scripts (tests/lint/e2e/csp)\n';
  if (scripts.length){
    for (const s of scripts) md += `- ${s.name}: ${s.cmd}\n`;
  } else { md += '- none found\n'; }
  md += '\n';

  md += '## Test Inventory\n';
  md += `- unit: ${unitFiles.length} files\n`;
  md += shortList(unitFiles.map(rel)).map(p=>`  - ${p}`).join('\n') + (unitFiles.length? '\n' : '');
  md += `- e2e: ${e2eFiles.length} files\n`;
  md += shortList(e2eFiles.map(rel)).map(p=>`  - ${p}`).join('\n') + (e2eFiles.length? '\n' : '');
  md += `- docs/test: ${docsTests.length} files\n`;
  md += shortList(docsTests.map(rel)).map(p=>`  - ${p}`).join('\n') + (docsTests.length? '\n' : '');
  md += '\n';

  md += '## GitHub Workflows summary\n';
  if (workflows.length){
    for (const w of workflows){
      md += `- ${w.name} (${w.file})\n`;
      if ((w.jobs||[]).length) md += `  - jobs: ${w.jobs.join(', ')}\n`;
      if ((w.steps||[]).length){
        md += '  - steps:\n';
        for (const s of w.steps) md += `    - ${s}\n`;
      }
    }
  } else { md += '- none found\n'; }
  md += '\n';

  md += '## CSP Policies Inventory\n';
  md += `- headers: ${headersInv.file}\n`;
  if ((headersInv.items||[]).length){
    for (const it of headersInv.items){ md += `  - [${it.route}] ${it.line}\n`; }
  } else { md += '  - none found\n'; }
  md += `- netlify: ${netlifyInv.file}\n`;
  if ((netlifyInv.entries||[]).length){
    for (const it of netlifyInv.entries){ md += `  - ${it.context} -> ${it.line}\n`; }
  } else { md += '  - none found\n'; }
  md += '\n';

  md += '## CSP/Inline-style Checks\n';
  if (cspScans.length){
    for (const h of cspScans){
      md += `- ${h.file}\n`;
      for (const s of h.samples) md += `  - ${s.trim()}\n`;
    }
  } else { md += '- none found\n'; }
  md += '\n';

  md += '## Gaps & Suggestions\n';
  if (gaps.length){ for (const g of gaps) md += `${g}\n`; }
  else { md += '- No obvious gaps detected.\n'; }
  md += '\n';

  try { fs.mkdirSync(path.join('REPORTS'), { recursive: true }); } catch(_){ }
  try { fs.writeFileSync(path.join('REPORTS','test-csp-audit.md'), md, 'utf8'); } catch(_){ }
  process.stdout.write(md);
}

main();

