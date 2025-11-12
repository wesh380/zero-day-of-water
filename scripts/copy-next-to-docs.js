#!/usr/bin/env node
/**
 * Copy Next.js static export to docs directory
 * This script copies the Next.js landing page to replace the existing HTML landing page
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
  // Copy index.html to docs/
  const indexSource = path.join(sourceDir, 'index.html');
  const indexTarget = path.join(targetDir, 'index.html');

  if (fs.existsSync(indexSource)) {
    // Backup old index.html
    const backupPath = path.join(targetDir, 'index.html.backup');
    if (fs.existsSync(indexTarget)) {
      fs.copyFileSync(indexTarget, backupPath);
      console.log('✅ Backed up old index.html');
    }

    fs.copyFileSync(indexSource, indexTarget);
    console.log('✅ Copied index.html to docs/');
  }

  // Copy _next directory if it exists
  const nextDirSource = path.join(sourceDir, '_next');
  const nextDirTarget = path.join(targetDir, '_next');

  if (fs.existsSync(nextDirSource)) {
    // Remove old _next directory
    if (fs.existsSync(nextDirTarget)) {
      fs.rmSync(nextDirTarget, { recursive: true, force: true });
    }

    // Copy new _next directory
    fs.cpSync(nextDirSource, nextDirTarget, { recursive: true });
    console.log('✅ Copied _next directory to docs/');
  }

  console.log('✨ Next.js static export copied successfully!');
} catch (error) {
  console.error('❌ Error copying Next.js export:', error.message);
  // Don't fail the build, just warn
  process.exit(0);
}
