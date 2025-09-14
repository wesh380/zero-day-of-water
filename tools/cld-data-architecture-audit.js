#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports');
const INVENTORY_PATH = path.join(REPORT_DIR, 'cld-inventory.json');
fs.mkdirSync(REPORT_DIR, { recursive: true });

function getDomain(file){
  const parts = file.split('/');
  const dataIdx = parts.indexOf('data');
  if (dataIdx === -1) return 'unknown';
  const after = parts.slice(dataIdx + 1);
  if (!after.length) return 'unknown';
  if (after.length > 1) return after[0];
  const base = after[0].split('.')[0];
  return base.split('-')[0];
}

function scoreModel(nodes, edges){
  const n = Number(nodes)||0;
  const e = Number(edges)||0;
  const ratio = n>0 ? e/n : 0;
  return n + e + ratio; // simple additive scoring
}

function main(){
  let inventory;
  try {
    inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH,'utf8'));
  } catch(err){
    console.error('Failed to read cld-inventory.json:', err.message);
    process.exit(1);
  }
  const rows = [];
  const recommended = {};
  for (const item of inventory){
    if(item.role !== 'Data') continue;
    const nodes = item.nodes || 0;
    const edges = item.edges || 0;
    const ratio = nodes>0 ? edges/nodes : 0;
    const score = scoreModel(nodes, edges);
    const domain = getDomain(item.file);
    const row = { domain, file: item.file, nodes, edges, ratio, score };
    rows.push(row);
    if(!recommended[domain] || score > recommended[domain].score){
      recommended[domain] = { file: item.file, score };
    }
  }

  // Markdown report
  const md = [];
  md.push('# CLD Data Architecture Audit\n');
  md.push('| domain | file | nodes | edges | ratio | score |');
  md.push('|--------|------|------:|------:|------:|------:|');
  rows.forEach(r => {
    md.push(`| ${r.domain} | ${r.file} | ${r.nodes} | ${r.edges} | ${r.ratio.toFixed(2)} | ${r.score.toFixed(2)} |`);
  });
  md.push('\n## Recommended Models\n');
  Object.entries(recommended).forEach(([domain, rec]) => {
    md.push(`- ${domain}: ${rec.file} (score ${rec.score.toFixed(2)})`);
  });
  fs.writeFileSync(path.join(REPORT_DIR, 'cld-data-architecture-audit.md'), md.join('\n'), 'utf8');

  // JSON report
  const jsonReport = { models: rows, recommended };
  fs.writeFileSync(path.join(REPORT_DIR, 'cld-data-architecture-audit.json'), JSON.stringify(jsonReport, null, 2), 'utf8');
  console.log(`CLD data architecture audit written to reports/cld-data-architecture-audit.{md,json} (${rows.length} models)`);
}

main();
