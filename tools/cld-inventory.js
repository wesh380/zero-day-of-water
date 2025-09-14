#!/usr/bin/env node
const fs = require('fs'); const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const HINTS = {
  core: /(cytoscape|cy\.add|cy\.json|elk|dagre|mapper|validate|initCore|setModel)/i,
  ui: /(controls|legend|search|filter|panel)/i,
  loader: /(bootstrap|loader|defer|init)/i
};
const NAME_HINTS = /(cld|water\-cld|cld\-model|layers\.config|poster)/i;

function walk(dir, acc=[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p, acc); }
    else acc.push(p);
  }
  return acc;
}

function isLikelyCLD(p, txt) {
  const n = path.basename(p);
  if (NAME_HINTS.test(n)) return true;
  if (HINTS.core.test(txt) || HINTS.ui.test(txt) || HINTS.loader.test(txt)) return true;
  return false;
}

function read(p){ try{ return fs.readFileSync(p,'utf8'); }catch{ return ''; } }

function classify(p, txt) {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.html') return 'HTML-host';
  if (ext === '.json') {
    try {
      const j = JSON.parse(txt);
      const nodes = j?.nodes || j?.Vertices || j?.NODES;
      const edges = j?.edges || j?.Links || j?.EDGES;
      if (Array.isArray(nodes) && Array.isArray(edges)) return 'Data';
    } catch {}
    return 'JSON-other';
  }
  if (ext === '.js') {
    const isCore = HINTS.core.test(txt);
    const isLoader = HINTS.loader.test(txt);
    const isUI = HINTS.ui.test(txt);
    if (isLoader) return 'Loader-candidate';
    if (isUI && !isCore) return 'UI-candidate';
    if (isCore) return 'Core-candidate';
    return 'JS-other';
  }
  return 'Other';
}

function extractHtmlScripts(html) {
  const srcs = [];
  const re = /<script[^>]*src=["']([^"']+)["']/ig;
  let m; while ((m = re.exec(html))) srcs.push(m[1]);
  return srcs;
}

function main(){
  const files = walk(ROOT, []).filter(p => !/node_modules|\.git|reports/i.test(p));
  const rows = [];
  for (const f of files) {
    const txt = read(f);
    if (!isLikelyCLD(f, txt)) continue;
    const role = classify(f, txt);
    const row = { file: path.relative(ROOT, f), role, size: fs.statSync(f).size };
    if (role === 'Data') {
      try {
        const j = JSON.parse(txt);
        const nodes = j?.nodes || j?.Vertices || j?.NODES || [];
        const edges = j?.edges || j?.Links || j?.EDGES || [];
        row.nodes = nodes.length; row.edges = edges.length;
      } catch {}
    }
    if (role === 'HTML-host') row.scripts = extractHtmlScripts(txt);
    rows.push(row);
  }

  // Markdown
  const md = [];
  md.push(`# CLD Inventory\n`);
  md.push(`| file | role | size | nodes | edges | scripts |\n|------|------|------:|------:|------:|---------|`);
  rows.forEach(r => {
    md.push(`| ${r.file} | ${r.role} | ${r.size} | ${r.nodes||''} | ${r.edges||''} | ${(r.scripts||[]).join('<br>')} |`);
  });
  fs.writeFileSync(path.join(REPORT_DIR, 'cld-inventory.md'), md.join('\n'), 'utf8');
  fs.writeFileSync(path.join(REPORT_DIR, 'cld-inventory.json'), JSON.stringify(rows,null,2),'utf8');
  console.log(`CLD inventory written to reports/cld-inventory.{md,json} (${rows.length} items)`);
}
main();
