import { statSync } from "fs";
const files = [
  "docs/page/landing/logo2.webp",
  "docs/page/landing/logo2-240.webp",
  "docs/page/landing/logo2-160.webp",
  "docs/page/landing/logo2.avif",
  "docs/page/landing/logo2-240.avif",
  "docs/page/landing/logo2-160.avif",
];
const bad = files.filter(f => { try { return statSync(f).size === 0; } catch { return true; } });
if (bad.length) { console.error("Zero-byte or missing:", bad); process.exit(1); }
console.log("✓ Logo assets OK");
