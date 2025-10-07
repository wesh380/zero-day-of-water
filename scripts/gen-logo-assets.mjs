import sharp from "sharp";
import { mkdirSync, statSync } from "fs";
const src = "docs/page/landing/logo2-source.png"; // اگر png/svg است، همان مسیر/پسوند
const out = "docs/page/landing";
mkdirSync(out, { recursive: true });
const SIZES = [160, 240, 357];
const webpCfg = { lossless: true };
const avifCfg = { quality: 55, effort: 6 };

const results = [];
for (const w of SIZES) {
  const base = (w === 357) ? "logo2" : `logo2-${w}`;
  // WebP
  await sharp(src, { limitInputPixels: false })
    .resize({ width: w, withoutEnlargement: true })
    .toFile(`${out}/${base}.webp`, webpCfg);
  // AVIF (با تحمل خطا)
  try{
    await sharp(src, { limitInputPixels: false })
      .resize({ width: w, withoutEnlargement: true })
      .toFile(`${out}/${base}.avif`, avifCfg);
  }catch(e){
    console.warn("AVIF encode failed, continuing with WebP only for", base, e?.message||e);
  }
  // گزارش اندازه‌ها
  const files = [`${out}/${base}.webp`, `${out}/${base}.avif`];
  for (const f of files) {
    try { results.push({ file:f, bytes: statSync(f).size }); } catch {}
  }
}
console.log(JSON.stringify({ generated: results }, null, 2));
