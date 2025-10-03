#!/usr/bin/env node

const base = process.argv[2] || process.env.MIME_CHECK_BASE || 'http://127.0.0.1:5050';

const targets = [
  { path: '/assets/tailwind.css', expect: 'text/css' },
  { path: '/assets/unified-badge.js', expect: 'application/javascript' },
  { path: '/electricity/index.js', expect: 'application/javascript' }
];

let allOk = true;

function logResult(ok, message) {
  const prefix = ok ? 'PASS' : 'FAIL';
  console.log(`${prefix}: ${message}`);
}

for (const target of targets) {
  const url = new URL(target.path, base).toString();
  try {
    const response = await fetch(url, { method: 'GET' });
    const type = response.headers.get('content-type') || '';

    if (!response.ok) {
      allOk = false;
      logResult(false, `${target.path} → HTTP ${response.status}`);
      continue;
    }

    if (type.includes(target.expect)) {
      logResult(true, `${target.path} → ${type}`);
    } else {
      allOk = false;
      logResult(false, `${target.path} → unexpected content-type: ${type}`);
    }
  } catch (error) {
    allOk = false;
    logResult(false, `${target.path} → fetch error: ${error.message}`);
  }
}

process.exit(allOk ? 0 : 1);
