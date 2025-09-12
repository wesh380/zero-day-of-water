const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function wait(url, t=45000){
  const s=Date.now();
  return new Promise((ok,ko)=>{
    (function ping(){
      const req = http.get(url, r=>{ r.resume(); ok(); });
      req.on('error', ()=> Date.now()-s>t ? ko(new Error('timeout')) : setTimeout(ping,500));
      req.end();
    })();
  });
}

(async()=>{
  const port = process.env.TEST_PORT || '8082';
  const rel = process.env.REL || '/water/cld/index.html'; // مسیر نهایی
  const url = `http://localhost:${port}${rel}`;
  const server = spawn('npx',['http-server','docs','-p',port,'-s','-c-1'],{stdio:'inherit',shell:true});
  try {
    await wait(url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const logs=[];
    page.on('console', m=> logs.push(`${m.type()}: ${m.text()}`));
    await page.goto(url, {waitUntil:'networkidle2', timeout:60000});
    const diag = await page.evaluate(()=>{
      const root = document.querySelector('#cy, .cy, .cy-root, [data-cy-root]');
      const cs = root ? getComputedStyle(root) : null;
      const bb = root ? root.getBoundingClientRect() : {width:0,height:0};
      const core = window.CLD_CORE;
      const cy = (window.cy && window.cy.nodes) ? window.cy : (core && core.getCy ? core.getCy() : null);
      const counts = cy ? { n: cy.nodes().length, e: cy.edges().length } : { n:null, e:null };
      return {
        hasRoot: !!root,
        visible: !!root && cs.display!=='none' && cs.visibility!=='hidden' && bb.width>0 && bb.height>0,
        bb: {w:bb.width,h:bb.height},
        hasCy: !!cy,
        counts
      };
    });
    // اسکرین‌شات برای عیب‌یابی
    fs.mkdirSync(path.join('tests','artifacts'), { recursive:true });
    await page.screenshot({path: path.join('tests','artifacts','cld-render.png'), fullPage:true});
    await browser.close();
    server.kill();

    const fails=[];
    if (!diag.hasRoot) fails.push('no cy-root element');
    if (!diag.visible) fails.push('cy-root not visible/sized');
    if (!diag.hasCy) fails.push('no cy instance (window.cy/CLD_CORE)');
    if (!(diag.counts.n>0 && diag.counts.e>0)) fails.push('elements not injected (nodes/edges zero?)');

    if (fails.length){
      console.error('E2E FAIL:', fails, diag);
      process.exit(1);
    } else {
      console.log('E2E OK:', diag);
      process.exit(0);
    }
  } catch (e) {
    console.error('E2E EXC:', e);
    server.kill();
    process.exit(1);
  }
})();

