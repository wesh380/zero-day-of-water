#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const cmd = (process.argv[2] || 'all').toLowerCase();
const ts  = new Date().toISOString().replace(/[-:T]/g,'').slice(0,12); // YYYYMMDDHHMM
const out = process.env.OUTDIR || `.mcp-artifacts/preview-${ts}`;
mkdirSync(out, { recursive:true });

const run = (file, extra=[]) => {
  const p = spawnSync('node', [file, '--out', out, ...extra], { stdio:'inherit' });
  if (p.status !== 0) process.exit(p.status ?? 1);
};

const base = 'scripts/mcp';
const exists = (f) => spawnSync('node', ['-e', `require('fs').accessSync('${f}')`]).status === 0;

switch (cmd) {
  case 'desk':      run(`${base}/run-desk-1440.js`); break;
  case 'webvitals': run(`${base}/run-webvitals.js`); break;
  case 'trace':     run(`${base}/run-trace-before-nav.js`); break;
  case 'dashboard': run(`${base}/capture_dashboard.js`); break;
  case 'all':
  default:
    if (exists(`${base}/run-desk-1440.js`))        run(`${base}/run-desk-1440.js`);
    if (exists(`${base}/run-webvitals.js`))        run(`${base}/run-webvitals.js`);
    if (exists(`${base}/run-trace-before-nav.js`)) run(`${base}/run-trace-before-nav.js`);
    if (exists(`${base}/capture_dashboard.js`))    run(`${base}/capture_dashboard.js`);
}
console.log(`\nArtifacts in: ${out}`);
