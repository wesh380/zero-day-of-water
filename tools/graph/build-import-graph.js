#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir) {
  const res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...walk(p));
    else if (entry.isFile() && p.endsWith('.js')) res.push(p);
  }
  return res;
}

const root = path.join(__dirname, '../../docs/assets/cld');
const files = walk(root);
const edges = [];
const nodes = new Set();
const importRe = /import\s+(?:[^'";]+?\s+from\s+)?['"]([^'";]+)['"]/g;
const exportRe = /export\s+\*\s+from\s+['"]([^'";]+)['"]/g;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  nodes.add(f);
  let m;
  while ((m = importRe.exec(src)) !== null) {
    edges.push([f, m[1]]);
  }
  while ((m = exportRe.exec(src)) !== null) {
    edges.push([f, m[1]]);
  }
}

console.log('graph TD');
for (const f of nodes) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const hasEdges = edges.some(e => e[0] === f || e[1] === f);
  if (!hasEdges) {
    console.log(`  "${rel}"`);
  }
}
for (const [from, to] of edges) {
  const a = path.relative(root, from).replace(/\\/g, '/');
  const b = to.replace(/\.js$/, '');
  console.log(`  "${a}" --> "${b}"`);
}
