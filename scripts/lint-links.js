#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function ensureWaterCldExists() {
  const target = path.join(__dirname, '..', 'docs', 'water', 'cld', 'index.html');
  if (!fs.existsSync(target)) {
    throw new Error(`/water/cld/ missing (${target} not found)`);
  }
  console.log(`[lint:links] Found CLD landing page at ${target}`);
}

function ensureRedirect() {
  const netlifyPath = path.join(__dirname, '..', 'netlify.toml');
  if (!fs.existsSync(netlifyPath)) {
    throw new Error(`netlify.toml not found at ${netlifyPath}`);
  }
  const contents = fs.readFileSync(netlifyPath, 'utf8');
  const redirectPattern = /\[\[redirects\]\][^\[]*from\s*=\s*"\/test\/water-cld"[^\[]*to\s*=\s*"\/water\/cld\/"[^\[]*status\s*=\s*301/;
  if (!redirectPattern.test(contents)) {
    throw new Error('Missing 301 redirect for /test/water-cld → /water/cld/ in netlify.toml');
  }
  console.log('[lint:links] 301 redirect for /test/water-cld verified.');
}

try {
  ensureWaterCldExists();
  ensureRedirect();
} catch (err) {
  console.error(`[lint:links] error: ${err.message}`);
  process.exitCode = 1;
}
