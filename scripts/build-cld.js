const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const esbuild = require('esbuild');
const CleanCSS = require('clean-css');

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'docs', 'assets');
const DIST = path.join(ASSETS, 'dist');

(async function main(){
  await fs.ensureDir(DIST);

  // 1) bundle JS via esbuild
  await esbuild.build({
    entryPoints: [path.join(ASSETS, 'water-cld.js')],
    bundle: true,
    format: 'iife',
    minify: true,
    target: ['es2017'],
    outfile: path.join(DIST, 'water-cld.bundle.js'),
  });

  // 2) bundle CSS
  const cssFiles = glob.sync('**/*.css', {
    cwd: ASSETS, nodir: true, absolute: true,
    ignore: ['**/vendor/**','**/dist/**']
  }).filter(f => /cld|water-cld/i.test(f));

  let cssConcat = '';
  for (const f of cssFiles) cssConcat += '/* ' + path.relative(ASSETS, f) + ' */\n' + await fs.readFile(f, 'utf8') + '\n';
  const minCss = new CleanCSS({}).minify(cssConcat || '/* no CLD css found */');
  if (minCss.errors?.length) { console.error(minCss.errors); process.exit(1); }
  await fs.writeFile(path.join(DIST, 'water-cld.bundle.css'), minCss.styles, 'utf8');

  // 3) manifest
  const jsFiles = glob.sync('**/*.js', {
    cwd: ASSETS, nodir: true, absolute: true,
    ignore: ['**/vendor/**','**/dist/**','**/*worker*.js','**/*sim-worker*.js']
  }).filter(f => /cld|water-cld/i.test(f));
  const workers = glob.sync('**/*{worker,sim-worker}*.js', {
    cwd: ASSETS, nodir:true, absolute:true,
    ignore:['**/vendor/**','**/dist/**']
  }).filter(f => /cld|water-cld|sim/i.test(f));

  const manifest = {
    generatedAt: new Date().toISOString(),
    jsSources: jsFiles.map(f => path.relative(ASSETS, f)),
    cssSources: cssFiles.map(f => path.relative(ASSETS, f)),
    workers: workers.map(f => path.relative(ASSETS, f))
  };
  await fs.writeJson(path.join(DIST, 'water-cld.manifest.json'), manifest, { spaces: 2 });

  console.log('[CLD] built dist files');
})().catch(e => { console.error(e); process.exit(1); });

