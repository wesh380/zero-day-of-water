const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'docs', 'assets');
const DIST = path.join(ASSETS, 'dist');

(async function main(){
  await fs.ensureDir(DIST);

  // 1) JS های CLD با ترتیب صریح گاردها -> هسته -> افزونه‌ها
  const manualOrder = [
    // debug / early
    'docs/assets/debug/sentinel.js',
    // core: kernel → guards → store → loop-detect → core facade
    'docs/assets/cld/core/kernel/shim.js',
    'docs/assets/cld/core/kernel/adapter.js',
    'docs/assets/water-cld.kernel.js',
    'docs/assets/water-cld.cy-stub.js',
    'docs/assets/water-cld.cy-addclass-patch.js',
    'docs/assets/cld/core/guards/batch-guard.js',
    'docs/assets/cld/core/guards/collection-guard.js',
    'docs/assets/water-cld.cy-safe-add.js',
    'docs/assets/cld/core/store.js',
    'docs/assets/cld/core/loop-detect.js',
    'docs/assets/cld/core/index.js',
    // legacy mapper/validate (kept for compatibility)
    'docs/assets/cld-mapper.js',
    'docs/assets/cld-validate.js',
    // loader → ui → entry
    'docs/assets/cld/loader/paths.js',
    'docs/assets/cld/loader/runtime-guards.js',
    'docs/assets/cld/loader/init.js',
    'docs/assets/cld/ui/controls.js',
    'docs/assets/cld/ui/legend.js',
    'docs/assets/cld/ui/search.js',
    'docs/assets/water-cld.cy-alias.js',
    'docs/assets/water-cld.js'
  ].map(p => path.resolve(ROOT, p));

  const allJs = glob.sync('**/*.js', {
    cwd: ASSETS, nodir: true, absolute: true,
    ignore: ['**/vendor/**','**/dist/**','**/*worker*.js','**/*sim-worker*.js']
  }).filter(f => /cld|water-cld/i.test(f));

  const orderedJs = manualOrder.concat(
    allJs.filter(f => !manualOrder.includes(f)).sort()
  );

  let jsBundle = '(function(window,document){\n"use strict";\n';
  for (const f of orderedJs) {
    const src = await fs.readFile(f, 'utf8');
    jsBundle += '\n/* === ' + path.relative(ASSETS, f) + ' === */\n' + src + '\n';
  }
  jsBundle += '\n})(window, document);\n';

  const min = await minify(jsBundle, {
    compress:true,
    mangle:{ reserved:['cytoscape','dagre','elk'] },
    ecma:2017,
    sourceMap: true
  });
  await fs.writeFile(path.join(DIST,'water-cld.bundle.js'), min.code, 'utf8');
  if (min.map) {
    await fs.writeFile(path.join(DIST,'water-cld.bundle.js.map'), min.map, 'utf8');
  }

  // 2) CSS های CLD
  const cssFiles = glob.sync('**/*.css', {
    cwd: ASSETS, nodir: true, absolute: true,
    ignore: ['**/vendor/**','**/dist/**']
  }).filter(f => /cld|water-cld/i.test(f));

  let cssConcat = '';
  for (const f of cssFiles) cssConcat += '/* ' + path.relative(ASSETS, f) + ' */\n' + await fs.readFile(f,'utf8') + '\n';
  const minCss = new CleanCSS({}).minify(cssConcat || '/* no CLD css found */');
  if (minCss.errors?.length) { console.error(minCss.errors); process.exit(1); }
  await fs.writeFile(path.join(DIST,'water-cld.bundle.css'), minCss.styles, 'utf8');

  // 3) مانيفست برای شفافیت
  const workers = glob.sync('**/*{worker,sim-worker}*.js', {
    cwd: ASSETS, nodir:true, absolute:true,
    ignore:['**/vendor/**','**/dist/**']
  }).filter(f => /cld|water-cld|sim/i.test(f));

  const manifest = {
    generatedAt: new Date().toISOString(),
    jsSources: orderedJs.map(f=>path.relative(ASSETS,f)),
    cssSources: cssFiles.map(f=>path.relative(ASSETS,f)),
    workers: workers.map(f=>path.relative(ASSETS,f))
  };
  await fs.writeJson(path.join(DIST,'water-cld.manifest.json'), manifest, { spaces: 2 });

  console.log('[CLD] built dist files');
})().catch(e=>{ console.error(e); process.exit(1); });
