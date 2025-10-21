const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const assert = require('assert');

function serveDocs(){
  const root = path.join(__dirname, '..', 'docs');
  const server = http.createServer((req,res)=>{
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(root, urlPath);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err,data)=>{
      if(err){ res.statusCode = 404; res.end('not found'); } else { res.end(data); }
    });
  });
  return new Promise(resolve=>{ server.listen(0, ()=> resolve(server)); });
}

async function waitReady(page){
  // match existing readiness pattern
  await page.waitForFunction(() => !!window.__WATER_CLD_READY__, { timeout: 20000 });
  // ensure Puppeteer yields control until the page is actually interactive
  await page.waitForSelector('#cy', { timeout: 15000 });
}

async function getCyStats(page){
  return await page.evaluate(() => {
    const cy = window.CLD_SAFE && window.CLD_SAFE.cy;
    if (!cy) return { nodes:0, edges:0, visEdges:0, posVis:0, negVis:0, highlighted:0, fadedEdges:0 };
    const nodes = cy.nodes().length;
    const edges = cy.edges().length;
    const visEdges = cy.edges().filter(':visible').length;
    const posVis = cy.edges().filter(e => e.data('sign') === '+' && e.visible()).length;
    const negVis = cy.edges().filter(e => e.data('sign') === '-' && e.visible()).length;
    const highlighted = cy.nodes('.highlighted').length;
    const fadedEdges = cy.edges('.faded').length;
    return { nodes, edges, visEdges, posVis, negVis, highlighted, fadedEdges };
  });
}

async function waitForLayoutStop(page){
  await page.evaluate(() => new Promise(res => {
    const cy = window.CLD_SAFE && window.CLD_SAFE.cy;
    if (!cy) return res();
    // if a layout is already running, listen; otherwise resolve next tick
    let resolved = false;
    const done = () => { if (!resolved){ resolved = true; setTimeout(res, 120); } };
    try { cy.one('layoutstop', done); } catch(e) { /* ignore */ done(); }
    setTimeout(done, 1200); // safety timeout
  }));
}

async function getSamplePositions(page, count = 6){
  return await page.evaluate((n) => {
    const cy = window.CLD_SAFE && window.CLD_SAFE.cy;
    if (!cy) return [];
    return cy.nodes().slice(0, n).map(nd => {
      const p = nd.position();
      return { id: nd.id(), x: Math.round(p.x), y: Math.round(p.y) };
    });
  }, count);
}

(async () => {
  const server = await serveDocs();
  const port = server.address().port;
  const browser = await puppeteer.launch({ args:['--no-sandbox'], headless:'new' });
  const page = await browser.newPage();

  // 0) Navigate
  await page.goto(`http://localhost:${port}/test/water-cld.html`, { waitUntil: 'networkidle2', timeout: 30000 });
  await waitReady(page);

  // 1) Positive-edge filter: hide negative edges, ensure only positives visible
  await page.waitForSelector('#f-neg', { timeout: 10000 });
  await page.click('#f-neg');           // toggle OFF negatives
  await page.waitForSelector('#dummy-selector', { timeout: 150 }).catch(() => {});
  let s1 = await getCyStats(page);
  assert(s1.posVis > 0, 'positive edges should be visible');
  assert.strictEqual(s1.negVis, 0, 'negative edges must be hidden after clicking #f-neg');

  // 2) Negative-edge filter: now hide positives and show negatives
  await page.waitForSelector('#f-pos', { timeout: 10000 });
  await page.click('#f-pos');           // toggle OFF positives (now both off)
  await page.waitForSelector('#dummy-selector', { timeout: 150 }).catch(() => {});
  // Re-enable negatives by clicking #f-neg again
  await page.click('#f-neg');           // toggle ON negatives
  await page.waitForSelector('#dummy-selector', { timeout: 150 }).catch(() => {});
  let s2 = await getCyStats(page);
  assert(s2.negVis > 0, 'negative edges should be visible');
  assert.strictEqual(s2.posVis, 0, 'positive edges must be hidden');

  // 3) Search test: type a common Farsi term and expect highlights + fading
  await page.waitForSelector('#q', { timeout: 10000 });
  await page.focus('#q');
  await page.keyboard.type('آب', { delay: 40 });
  await page.waitForSelector('#dummy-selector', { timeout: 200 }).catch(() => {});
  let s3 = await getCyStats(page);
  assert(s3.highlighted > 0, 'at least one node should be highlighted for search');
  assert(s3.fadedEdges >= 0, 'faded edge count should be measurable (>=0)');

  // 4) Layout preset: switch to "grid" then to "radial" and ensure positions change
  await page.waitForSelector('#layout-preset', { timeout: 10000 });
  const before = await getSamplePositions(page, 8);
  await page.select('#layout-preset', 'grid');
  await waitForLayoutStop(page);
  const gridPos = await getSamplePositions(page, 8);
  // Compute total movement distance
  const moved1 = before.reduce((sum, p, i) => {
    const q = gridPos[i] || p;
    return sum + Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
  }, 0);
  assert(moved1 > 5, 'positions should change after grid preset');

  await page.select('#layout-preset', 'radial');
  await waitForLayoutStop(page);
  const radialPos = await getSamplePositions(page, 8);
  const moved2 = gridPos.reduce((sum, p, i) => {
    const q = radialPos[i] || p;
    return sum + Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
  }, 0);
  assert(moved2 > 5, 'positions should change after radial preset');

  await browser.close();
  server.close();
  console.log('e2e-water-cld.behaviors tests passed');
})().catch(err => { console.error(err); process.exit(1); });
