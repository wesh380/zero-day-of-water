const http=require('http');const path=require('path');const fs=require('fs');const puppeteer=require('puppeteer');
const PORT=process.env.TEST_PORT?parseInt(process.env.TEST_PORT,10):9099;const ROOT=path.resolve(__dirname,'../../docs');
function serve(){const s=http.createServer((req,res)=>{const u=req.url.split('?')[0];let p=path.join(ROOT,u);if(u==='/'||u.startsWith('/test'))p=path.join(ROOT,'test','water-cld.html');fs.readFile(p,(e,d)=>{if(e){try{console.log('[srv 404]',u,'->',p);}catch(_){ }res.statusCode=404;return res.end('Not Found')}try{if(u!=='/favicon.ico')console.log('[srv 200]',u);}catch(_){ }const ext=path.extname(p).toLowerCase();const ct=ext==='.html'?'text/html':ext==='.js'?'application/javascript':ext==='.css'?'text/css':ext==='.json'?'application/json':'text/plain';res.setHeader('Content-Type',ct+'; charset=utf-8');res.statusCode=200;res.end(d);});});return new Promise((ok,ko)=>{s.on('error',ko);s.listen(PORT,'0.0.0.0',()=>ok(s));});}
(async()=>{let server;try{server=await serve();}catch(e){console.error(e);process.exit(1);}const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36']});const page=await browser.newPage();const logs=[];page.on('console',m=>logs.push(m.text()));page.on('pageerror',e=>logs.push('PAGEERR:'+e.message));
await page.goto(`http://localhost:${PORT}/test/water-cld.html`,{waitUntil:'domcontentloaded'});

// منتظر شو تا cy واقعاً nodes داشته باشه (نه فقط __lastSetModelCounts)
// این جلوی race condition با loadModelFromUrl که cy رو reset میکنه رو میگیره
await page.waitForFunction(()=>{
  const pick=()=> (window.__cy) || (window.CLD_CORE&&typeof window.CLD_CORE.getCy==='function'&&window.CLD_CORE.getCy()) || ((window.cy&&typeof window.cy.nodes==='function')?window.cy:null);
  const C=pick();
  if (!C || typeof C.nodes !== 'function') return false;
  const n = C.nodes().length;
  // منتظر بمون تا حداقل 2 node داشته باشیم (DATA_MODEL دو تا داره)
  return n >= 2;
},{timeout:30000}).catch(()=>{});

// حالا که مطمئنیم cy پر است، counts رو بگیر
const counts = await page.evaluate(()=>{
  try {
    if (window.CLD_CORE && typeof window.CLD_CORE.runLayout==='function') {
      window.CLD_CORE.runLayout('elk', {});
    }
  } catch(_){ }
  const pick=()=> (window.__cy) || (window.CLD_CORE&&typeof window.CLD_CORE.getCy==='function'&&window.CLD_CORE.getCy()) || ((window.cy&&typeof window.cy.nodes==='function')?window.cy:null);
  const C=pick();
  const result = C?{nodes:C.nodes().length,edges:C.edges().length}:{nodes:0,edges:0};
  // ذخیره برای debug
  try { window.__lastCheckedCounts = result; } catch(_){}
  return result;
});
const debugInfo = await page.evaluate(()=>({
  ready: document.readyState,
  hasCLD: !!window.CLD_CORE,
  cldKeys: (window.CLD_CORE && Object.keys(window.CLD_CORE))||[],
  hasCy: !!(window.cy && typeof window.cy.nodes==='function')
}));

if(!counts||!counts.nodes||counts.nodes<=0){
  console.error('E2E FAIL: nodes not rendered',counts,logs.slice(-30),debugInfo);
  await browser.close(); server.close(); process.exit(1);
}else{
  console.log('E2E OK:',counts);
  await browser.close(); server.close();
}
})();
