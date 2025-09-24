#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main() {
  const configPath = path.join(__dirname, '..', 'docs', 'config', 'api.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing api config at ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  let baseUrl;
  try {
    const config = JSON.parse(raw);
    baseUrl = config.baseUrl;
  } catch (err) {
    throw new Error(`Failed to parse ${configPath}: ${err}`);
  }

  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error(`docs/config/api.json must contain a string baseUrl (got: ${baseUrl})`);
  }

  const healthUrl = new URL('/api/health', baseUrl).toString();
  console.log(`[test:api] GET ${healthUrl}`);

  let response;
  try {
    response = await fetch(healthUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
  } catch (err) {
    throw new Error(`Request failed: ${err.message}`);
  }

  const text = await response.text();
  console.log(`[test:api] status=${response.status}`);
  if (text) {
    console.log(text);
  }

  if (!response.ok) {
    throw new Error(`Health check returned HTTP ${response.status}`);
  }
}

main().catch((err) => {
  console.error(`[test:api] error: ${err.message}`);
  process.exitCode = 1;
});
