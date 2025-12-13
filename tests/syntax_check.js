// Syntax check script
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const appJsPath = path.join(__dirname, '../docs/solar/agrivoltaics/app.js');
const tempPath = path.join(__dirname, '../temp_check.js');

try {
  const content = fs.readFileSync(appJsPath, 'utf8');
  // Strip imports and exports
  const stripped = content
    .replace(/^import .*/gm, '')
    .replace(/^export async function/gm, 'async function')
    .replace(/^void getBaseUrl.*;/gm, '');

  fs.writeFileSync(tempPath, stripped);

  exec(`node -c ${tempPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Syntax Check Failed:\n${stderr}`);
      process.exit(1);
    }
    console.log('Syntax Check Passed');

    // Check shareModal placement logic
    // We want to ensure shareModal is INSIDE wrapper.
    // It's hard to regex this perfectly, but we can check if shareModal is followed by `)` then `;`
    // And before that we have `main` closed.

    // Actually, simply ensuring syntax is valid is the first step.
    // The previous error was "missing )", which means structure was broken.
    process.exit(0);
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
