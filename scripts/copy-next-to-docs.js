#!/usr/bin/env node
/**
 * Copy Next.js static export to docs directory.
 *
 * Why: Netlify publishes docs/, so we need every exported Next.js route
 * (including the new /electricity/ and /gas/ hubs) copied alongside the
 * long-lived static dashboards. The previous logic only moved index.html,
 * which meant electricity/gas hubs never reached production and stayed 404.
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'out');
const targetDir = path.join(__dirname, '..', 'docs');

console.log('📦 Copying Next.js static export to docs...');

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.log('⚠️  Next.js output directory not found. Skipping copy.');
  process.exit(0);
}

try {
  // Copy all exported assets except we handle _next specially to avoid stale bundles.
  const entries = fs.readdirSync(sourceDir);

  entries.forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry);
    const targetPath = path.join(targetDir, entry);
    const stats = fs.statSync(sourcePath);

    if (entry === '_next') {
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      console.log('✅ Copied _next directory to docs/');
      return;
    }

    // For top-level HTML pages (index, sitemap, robots, hubs, etc.), overwrite so the export wins.
    if (stats.isFile()) {
      // Keep a backup of the landing page like before.
      if (entry === 'index.html' && fs.existsSync(targetPath)) {
        const backupPath = path.join(targetDir, 'index.html.backup');
        fs.copyFileSync(targetPath, backupPath);
        console.log('✅ Backed up old index.html');
      }

      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied file ${entry} to docs/`);
      return;
    }

    // Directories like /electricity and /gas contain the exported hub pages.
    if (stats.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      console.log(`✅ Copied directory ${entry} to docs/`);
    }
  });

  console.log('✨ Next.js static export copied successfully, including /electricity/ and /gas/.');
} catch (error) {
  console.error('❌ Error copying Next.js export:', error.message);
  // Don't fail the build, just warn
  process.exit(0);
}
