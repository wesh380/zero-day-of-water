#!/usr/bin/env node
/**
 * Verify that all HTML files with Cloudflare beacon have error suppression
 */

const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

async function verifyProtection() {
  console.log('🔍 Verifying Cloudflare Beacon error protection...\n');

  // پیدا کردن تمام فایل‌های HTML
  const htmlFiles = await glob('docs/**/*.html', {
    ignore: ['**/node_modules/**', '**/assets/**']
  });

  let missingProtection = [];
  let protected = 0;
  let noBeacon = 0;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // آیا فایل اسکریپت Cloudflare دارد؟
    if (!content.includes('cloudflareinsights.com')) {
      noBeacon++;
      continue;
    }

    // آیا فایل محافظت دارد؟
    const hasGlobalFooter = content.includes('global-footer.js');
    const hasSuppression = content.includes('Suppress Cloudflare Beacon');

    if (hasGlobalFooter || hasSuppression) {
      protected++;
    } else {
      missingProtection.push(file);
    }
  }

  console.log(`📊 Statistics:`);
  console.log(`   - Total HTML files: ${htmlFiles.length}`);
  console.log(`   - Files with Cloudflare beacon: ${protected + missingProtection.length}`);
  console.log(`   - Files with protection: ${protected}`);
  console.log(`   - Files without beacon: ${noBeacon}`);
  console.log(`   - Files missing protection: ${missingProtection.length}\n`);

  if (missingProtection.length > 0) {
    console.log('⚠️  Files missing protection:');
    missingProtection.forEach(file => console.log(`   - ${file}`));
    process.exit(1);
  } else {
    console.log('✅ All files with Cloudflare beacon are protected!');
  }
}

verifyProtection().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
