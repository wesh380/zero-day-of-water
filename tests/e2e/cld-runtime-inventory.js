const { spawn } = require('child_process');
const http = require('http'); const path = require('path'); const fs = require('fs');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const sha1 = str => crypto.createHash('sha1').update(str).digest('hex');
const jsonSeen = [];
const REPORT_DIR = path.join(process.cwd(), 'reports'); fs.mkdirSync(REPORT_DIR, {recursive:true});

function waitFor(url, ms=30000){
  const t0 = Date.now();
  return new Promise((res, rej) => {
    (function ping(){
      const req = http.get(url, r=>{ r.resume(); res(); }).on('error', ()=>{
        if (Date.now()-t0>ms) rej(new Error('server timeout')); else setTimeout(ping, 400);
      }); req.end();
    })();
  });
}

async function probe(url){
  const browser = await puppeteer.launch({ args:['--no-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'] });
  const page = await browser.newPage();
  const requests = [];
  const respTasks = [];
  page.on('requestfinished', req => requests.push(req.url()));
  page.on('response', res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (!/json/i.test(ct) && !/\.json($|\?)/i.test(url)) return;
    const p = res.text().then(body => {
      try {
        const hash = sha1(body);
        if (jsonSeen.find(j => j.sha1 === hash)) return;
        const data = JSON.parse(body);
        const nodes = data?.elements?.nodes || data?.nodes || [];
        const edges = data?.elements?.edges || data?.edges || [];
        jsonSeen.push({
          url,
          schema_version: data.schema_version,
          model_id: data.model_id,
          counts: {nodes: nodes.length, edges: edges.length},
          sha1: hash
        });
      } catch(err){ /* ignore parse errors */ }
    });
    respTasks.push(p);
  });
  await page.goto(url, {waitUntil:'networkidle2', timeout:60000}).catch(()=>{});
  await Promise.all(respTasks);
  const result = await page.evaluate(()=>{
    const scripts = Array.from(document.scripts).map(s=>s.src).filter(Boolean);
    const modelCandidates = ['__MODEL__','__cldModel','rawModel'].filter(k => window[k]!=null);
    const cyOk = !!(window.cy);
    const counts = cyOk ? {nodes: cy.nodes().length, edges: cy.edges().length} : null;
    return { scripts, cyOk, counts, modelCandidates };
  });
  await browser.close();
  return { url, scripts: result.scripts, cy: result.cyOk, counts: result.counts, modelVars: result.modelCandidates, requests };
}

(async ()=>{
  const port = process.env.TEST_PORT || '8080';
  const base = `http://localhost:${port}`;
  const candidates = [
    `${base}/water/`,
    `${base}/water/index.html`,
    `${base}/test/water-cld.html`
  ];

  // کشف HTMLهای مرتبط در docs/water
  const waterDir = path.join(process.cwd(), 'docs','water');
  if (fs.existsSync(waterDir)) {
    const htmls = fs.readdirSync(waterDir).filter(f=>/\.html?$/i.test(f)).slice(0,5);
    htmls.forEach(h => candidates.push(`${base}/water/${h}`));
  }

  const useServe = !!process.env.USE_SERVE_DOCS;
  const cmd = useServe ? 'npm' : 'npx';
  const args = useServe ? ['run','serve-docs'] : ['http-server','docs','-p',port,'-s','-c-1'];

  const server = spawn(cmd, args, {stdio:'inherit', shell:true});
  try{
    await waitFor(`${base}/`);
    const results = [];
    for (const u of [...new Set(candidates)]) {
      try { results.push(await probe(u)); } catch(e){ results.push({url:u, error:String(e)}); }
    }
    fs.writeFileSync(path.join(REPORT_DIR,'cld-runtime-usage.json'), JSON.stringify(results,null,2));
    const md = ['# CLD Runtime Usage\n'];
    for (const r of results) {
      md.push(`## ${r.url}`);
      if (r.error) { md.push(`- ❌ Error: ${r.error}`); continue; }
      md.push(`- Scripts:\n  - ${r.scripts.join('\n  - ') || '(none)'}`);
      md.push(`- Model Vars: ${r.modelVars?.join(', ') || '(none)'}`);
      md.push(`- Cytoscape: ${r.cy ? '✅' : '❌'}`);
      if (r.counts) md.push(`- Elements: nodes=${r.counts.nodes}, edges=${r.counts.edges}`);
      const jsons = r.requests.filter(u => /\.json($|\?)/i.test(u));
      if (jsons.length) md.push(`- JSON fetched:\n  - ${jsons.join('\n  - ')}`);
    }
    fs.writeFileSync(path.join(REPORT_DIR,'cld-runtime-usage.md'), md.join('\n'), 'utf8');
    fs.writeFileSync(path.join(REPORT_DIR,'cld-runtime-models.json'), JSON.stringify(jsonSeen,null,2));
    const mdModels = ['# CLD Runtime Models\n'];
    for (const m of jsonSeen) {
      mdModels.push(`- ${m.url}`);
      mdModels.push(`  - model_id: ${m.model_id || '(none)'}`);
      mdModels.push(`  - schema_version: ${m.schema_version || '(none)'}`);
      mdModels.push(`  - elements: nodes=${m.counts.nodes}, edges=${m.counts.edges}`);
      mdModels.push(`  - sha1: ${m.sha1}`);
    }
    fs.writeFileSync(path.join(REPORT_DIR,'cld-runtime-models.md'), mdModels.join('\n'), 'utf8');
    console.log('Runtime usage written to reports/cld-runtime-usage.{md,json}');
    console.log('Model metadata written to reports/cld-runtime-models.{md,json}');
    server.kill(); process.exit(0);
  } catch(e){
    console.error(e); server.kill(); process.exit(1);
  }
})();
