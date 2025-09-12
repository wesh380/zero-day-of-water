const http=require('http');const path=require('path');const fs=require('fs');const puppeteer=require('puppeteer');
const PORT=process.env.TEST_PORT?parseInt(process.env.TEST_PORT,10):9099;const ROOT=path.resolve(__dirname,'../../docs');
function serve(){const s=http.createServer((req,res)=>{let p=path.join(ROOT,req.url.split('?')[0]);if(req.url==='/'||req.url.startsWith('/test'))p=path.join(ROOT,'test','water-cld.html');fs.readFile(p,(e,d)=>{if(e){res.statusCode=404;return res.end('Not found')}res.statusCode=200;res.end(d);});});return new Promise((ok,ko)=>{s.on('error',ko);s.listen(PORT,'0.0.0.0',()=>ok(s));});}
(async()=>{let server;try{server=await serve();}catch(e){console.error(e);process.exit(1);}const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox']});const page=await browser.newPage();const logs=[];page.on('console',m=>logs.push(m.text()));
await page.goto(`http://localhost:${PORT}/test/water-cld.html`,{waitUntil:'domcontentloaded'});

// اول منتظر شو Bridge شمارش را ثبت کند
await page.waitForFunction(()=>!!(window.__lastSetModelCounts && window.__lastSetModelCounts.nodes>0),{timeout:30000}).catch(()=>{});

// اگر به هر دلیل متغیر نبود، fallback: از cy بخوان
const counts = await page.evaluate(()=>{
  if (window.__lastSetModelCounts && window.__lastSetModelCounts.nodes>0) return window.__lastSetModelCounts;
  const pick=()=> (window.__cy) || (window.CLD_CORE&&typeof window.CLD_CORE.getCy==='function'&&window.CLD_CORE.getCy()) || ((window.cy&&typeof window.cy.nodes==='function')?window.cy:null);
  const C=pick(); return C?{nodes:C.nodes().length,edges:C.edges().length}:{nodes:0,edges:0};
});

await browser.close();server.close();
if(!counts||!counts.nodes||counts.nodes<=0){console.error('E2E FAIL: nodes not rendered',counts,logs.slice(-30));process.exit(1);}else{console.log('E2E OK:',counts);}
})();
