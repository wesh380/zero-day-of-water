import { setClass } from '../css-classes.js';

// --- Build id ---
window.__AMA_BUILD_ID = document.querySelector('meta[name="build-id"]')?.content || String(Date.now());

// --- AMA global & layer registry (early)
const AMA = window.AMA = window.AMA || {};
AMA.G = AMA.G || {
  wind: L.layerGroup(),
  solar: L.layerGroup(),
  dams: L.layerGroup(),
  counties: L.layerGroup(),
  province: L.layerGroup(),
};
// expose map placeholder
window.__AMA_MAP = window.__AMA_MAP || null;

// --- Analytics helper ---
function trackAnalyticsEvent(action, params = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, params);
    } else if (typeof window.ga === 'function') {
      window.ga('send', 'event', action, params);
    }
  } catch (e) {
    if (window.AMA_DEBUG) console.warn('[analytics]', e);
  }
}

// Choropleth flag (opt-in) + debug marker control
AMA.flags = AMA.flags || {};
AMA.flags.debugCountyMarker = false;
AMA.flags.disableMarkerIcons = true;
const CHORO_ON = !!AMA.flags.enableChoropleth;

// soft-disable default Marker icons when flag is on
if (AMA.flags.disableMarkerIcons && typeof L !== 'undefined' && L && L.Marker && L.Marker.prototype){
  const _initIcon = L.Marker.prototype._initIcon;
  L.Marker.prototype._initIcon = function(){ /* no-op: hide image icon */ };
}

;(function(){
  window.__AMA_UI_VERSION = 'dock-probe-v1';
  if (window.AMA_DEBUG) console.log('[AMA:UI]', window.__AMA_UI_VERSION, 'build=', window.__AMA_BUILD_ID, 'path=', location.pathname);
  // tiny top-left badge for visual confirmation (removable later)
  try {
    const el = document.createElement('div');
    el.id = 'ama-ui-probe';
    setClass(el, ['debug-chip']);
    el.textContent = 'AMA UI • ' + window.__AMA_UI_VERSION;
    document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(el));
    setTimeout(()=>{ const n=document.getElementById('ama-ui-probe'); n && n.remove(); }, 3000);
  } catch(e){}
})();

// ===== BEGIN WIND DIAG BASICS =====
window.__WIND_DATA_READY      = window.__WIND_DATA_READY      ?? false;
window.__WIND_WEIGHTS_MISSING = window.__WIND_WEIGHTS_MISSING ?? false;
window.__WIND_SELF_CHECK      = window.__WIND_SELF_CHECK      ?? { mapCount:0, hasData:0, noData:0, onlyInMap:[], onlyInIdx:[] };
window.legend = window.legend || null;
window.legendCtl = window.legendCtl || null;
// safe no-ops to avoid ReferenceError before real implementations
window.renderLegend = window.renderLegend || function(){};
window.__AMA_renderTop10 = window.__AMA_renderTop10 || function(){};

function keyOf(s=''){
  return String(s)
    .replace(/\u200c/g,'')
    .replace(/[ي]/g,'ی')
    .replace(/[ك]/g,'ک')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
}
const sameCounty = (a,b)=> keyOf(a) === keyOf(b);

const SWATCH_PALETTE = ['#f0f9ff','#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9','#0284c7','#0369a1','#075985'];
function swClass(color){
  if(!color) return 'sw-gray';
  const hex = color.toLowerCase();
  const parse = h => {
    const n = h.replace('#','');
    return [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)];
  };
  const [r,g,b] = parse(hex);
  let idx=0,min=Infinity;
  SWATCH_PALETTE.forEach((c,i)=>{ const [cr,cg,cb]=parse(c); const d=(r-cr)**2+(g-cg)**2+(b-cb)**2; if(d<min){min=d;idx=i;} });
  return `sw-${idx}`;
}
function bubbleSizeClass(r){ const size=Math.min(64,Math.max(8,Math.round((r*2)/8)*8)); return `bubble-${size}`; }
// === County & Province helpers (tolerant) ===
const ACTIVE_PROVINCE = 'خراسان رضوی';

// alias map for common Persian variations / city-to-county mappings (extendable)
const __AMA_ALIASES = {
  // spacing / ZWNJ / spelling
  'مهولات': 'مه ولات',
  'مه‌ولات': 'مه ولات',
  'تربتجام': 'تربت جام',
  'تربت‌جام': 'تربت جام',
  'طرقبه شاندیز': 'طرقبه و شاندیز',
  'طرقبه‌ شاندیز': 'طرقبه و شاندیز',
  // capitals occasionally used instead of county name
  'فیض آباد': 'مه ولات',
  'طرقبه': 'طرقبه و شاندیز',
  'شاندیز': 'طرقبه و شاندیز',
  // --- fixes for remaining onlyInIdx case(s) ---
  // Normalize Torbat Heydariyeh variants -> "تربت حیدریه"
  'تربتحیدریه': 'تربت حیدریه',
  'تربت‌حیدریه': 'تربت حیدریه',
  'تربت حیدریه': 'تربت حیدریه',
  'تربت-حیدریه': 'تربت حیدریه',
  // Arabic Ye/spacing/ZWNJ variants
  'تربت حيدريه': 'تربت حیدریه',
  'تربت‌حيدريه': 'تربت حیدریه',
  'تربت حیدریه‌': 'تربت حیدریه'
};

// Union aliases: keep existing, add new; never delete old ones
const __COUNTY_ALIASES = Object.assign(
  {},
  (typeof __AMA_ALIASES === 'object' && __AMA_ALIASES) || {},
  {
    // add only if not present in previous aliases
    'تربتحیدریه': 'تربت حیدریه',
    'مهولات': 'مه ولات',
    'زیرنجفام': 'زبرخان',
    'بينالود': 'بینالود'
  }
);
function canonicalCountyName(s=''){
  let t = (s||'').toString()
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[\u200c\u200f]/g,'')      // ZWNJ, RTL marks
    .replace(/[ـ]+/g,'')                // کشیده
    .replace(/[-–—]+/g,' ')             // dash → space
    .replace(/\s+/g,' ')
    .trim();
  // فیکس‌های عمومی بدون نیاز به آلیاس
  if (t === 'تربتحیدریه') t = 'تربت حیدریه';
  if (/^مه.?ولات$/.test(t)) t = 'مه ولات';
  return __COUNTY_ALIASES[t] || t;
}
function getProvinceNameFromProps(p={}){
  const cand = p.ostan || p.province || p['نام استان'] || p['استان'] || p.ADM1_NAME || p.adm1name || '';
  return canonicalCountyName(cand);
}
// Robust county extractor: search many keys; handle "بخش مرکزی شهرستان …"
function deriveCountyFromProps(p={}){
  // 1) direct candidates
  const directKeys = [
    'county','COUNTY','County','shahrestan','Shahrestan',
    'شهرستان','نام شهرستان','نام_شهرستان','NAME','name','adm2name','ADM2_NAME','LABEL','label'
  ];
  for (const k of directKeys){
    if (p[k] != null && String(p[k]).trim()){
      return canonicalCountyName(String(p[k]));
    }
  }
  // 2) scan all props for values including "شهرستان"
  for (const [k,v] of Object.entries(p)){
    const s = String(v||'');
    const m1 = s.match(/بخش\s*مرکزی\s*شهرستان\s+(.+)$/);
    if (m1) return canonicalCountyName(m1[1]);
    const m2 = s.match(/^شهرستان\s+(.+)$/);
    if (m2) return canonicalCountyName(m2[1]);
  }
  // 3) last-resort: look for something that looks like a county-like label
  const guessKey = Object.keys(p).find(k => /name|label|عنوان|نام/i.test(k));
  if (guessKey && p[guessKey]) return canonicalCountyName(String(p[guessKey]));
  return '';
}
function showToast(msg){
  try{
    const host = document.querySelector('#ama-map, .ama-map, .leaflet-container') || document.body;
    let el = document.getElementById('ama-toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'ama-toast';
      setClass(el, ['toast']);
      setClass(host, ['relative']);
      host.appendChild(el);
    }
    el.textContent = msg;
    setTimeout(()=>{ if(el && el.parentNode) el.parentNode.removeChild(el); }, 6000);
  }catch(e){}
}

function normalizeDataPath(p){
  if(!p) return p;
  if(/^https?:\/\//i.test(p)) return p;
  const s = p.startsWith('/') ? p : '/data/' + p.replace(/^(\.\/)?/,'');
  return s.replace(/\/\/+/g,'/');
}

// Join helper
function joinPath(base, file){
  const b = String(base||'').replace(/^\/+|\/+$/g,'');
  const f = String(file||'').replace(/^\/+/, '');
  return b ? `${b}/${f}` : f;
}

// Resolve paths from manifest
function resolvePathsFromManifest(manifest){
  const base = (manifest && manifest.baseData) || '';
  const LAY  = (manifest && manifest.layers) || {};
  const provinceFile = LAY.province || LAY.combined || 'khorasan_razavi_combined.geojson';
  const hasCounties = typeof LAY.counties === 'string' && LAY.counties.trim() !== '';
  return {
    counties: hasCounties ? joinPath(base, LAY.counties) : null,
    province: joinPath(base, provinceFile),
    wind:     joinPath(base, LAY.wind_sites  || 'wind_sites.geojson'),
    solar:    joinPath(base, LAY.solar_sites || 'solar_sites.geojson'),
    dams:     joinPath(base, LAY.dams        || 'dams.geojson'),
  };
}

// Safe fetch with timeout + legacy fallback
async function getJSONwithFallback(relPath, timeoutMs = 30000){
  const urlPrimary = `/data/${String(relPath).replace(/^\/+/, '')}`;
  const urlLegacy  = `/${String(relPath).replace(/^\/+/, '')}`;
  async function fetchJson(url){
    const ctl = new AbortController();
    const t = setTimeout(()=>ctl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = (res.headers.get('content-type')||'').toLowerCase();
      const txt = await res.text();
      if (ct.includes('html') || txt.trim().startsWith('<!DOCTYPE')) throw new Error('not-json');
      return JSON.parse(txt);
    } finally { clearTimeout(t); }
  }
  try {
    return await fetchJson(urlPrimary);
  } catch(e1){
    console.warn('[AHA] primary failed:', urlPrimary, e1.message, '→ trying legacy', urlLegacy);
    try { return await fetchJson(urlLegacy); }
    catch(e2){ console.error('[AHA] fetch fail:', relPath, e2.message); return null; }
  }
}

// Bounds helper
function boundsFromGeoJSON(gj){
  try {
    if (gj && Array.isArray(gj.features) && gj.features.length) {
      return L.geoJSON(gj).getBounds();
    }
  } catch(_){ }
  return null;
}

function enforceDefaultVisibility(map){
  const G = (window.AMA && AMA.G) || {};
  const DEFAULT_ON = new Set(['province']); // فقط مرز استان
  Object.keys(G).forEach(k=>{
    const grp = G[k]; if (!grp) return;
    const shouldOn = DEFAULT_ON.has(k);
    const isOn = map.hasLayer(grp);
    if (shouldOn && !isOn) grp.addTo(map);
    if (!shouldOn && isOn) map.removeLayer(grp);
  });
}

window.__AMA_BOOTING = window.__AMA_BOOTING || false;
window.__AMA_BOOTSTRAPPED = window.__AMA_BOOTSTRAPPED || false;
window.AMA_DEBUG = window.AMA_DEBUG || /(?:^|[?&])ama_debug=1\b/.test(location.search);

let boundary;

function safeRemoveLayer(map, layer) {
  if (!layer) return;
  if (layer.__AMA_PROTECTED && !layer.__AMA_ALLOW_REPLACE) return;
  if (map.hasLayer(layer)) map.removeLayer(layer);
  if (layer.__AMA_ALLOW_REPLACE) layer.__AMA_ALLOW_REPLACE = false;
}

async function __refreshBoundary(map, opts={}) {
  const src = window.__countiesGeoAll || { type:'FeatureCollection', features:[] };
  if (window.boundary && !opts.keepOld) {
    window.boundary.__AMA_ALLOW_REPLACE = true;
    safeRemoveLayer(map, window.boundary);
  }
  window.boundary = L.geoJSON(src, {
    pane:'boundary',
    style:{ color:'#111827', weight:1.5, fill:false }
  }).addTo(map);
  window.boundary.__AMA_PROTECTED = true;
  boundary = window.boundary;
  if (window.boundary.bringToFront) window.boundary.bringToFront();
  if (window.AMA_DEBUG) console.log('[AHA] boundary src features =', src.features?.length||0);
}

function ama_popupContent(f, kind){
  const p = f?.properties||{};
  const name = p.name_fa || p.name || '—';
  const county = p.county || p.shahrestan || p.admin2 || '—';
  const kv = [];
  if(kind==='solar'){
    const cap = (p.capacity_mw ?? p.capacity ?? p.cap_mw);
    const conf = (p.confidence ?? p.conf ?? p.cnf);
    if(cap!=null) kv.push(`ظرفیت: ${cap} MW`);
    if(conf!=null) kv.push(`اطمینان: ${conf}`);
  }else if(kind==='dam'){
    const approx = (p.approx===true || p.approx==='true');
    if(approx) kv.push(`<span class="text-[10px] opacity-75">تقریبی</span>`);
    // اگر بعداً درصد پرشدگی داشت: kv.push(`پرشدگی: ${p.fill_pct}%`);
  }
  return `
    <div class="ama-pop text-[12px] leading-5">
      <div class="font-bold mb-1">${name}</div>
      <div class="opacity-80">شهرستان: ${county}</div>
      ${kv.length?`<div class="mt-1">${kv.join(' · ')}</div>`:''}
    </div>`;
}

function solarStyle(f){
  const p=f.properties||{};
  const cap=Number(p.capacity_mw ?? p.capacity ?? 0);
  const conf=p.confidence;
  const radius = cap>=50?8: cap>=10?6:4;
  const alpha = (typeof conf==='number')? Math.min(Math.max(conf,0),1)
                   : (conf==='high'?0.95: conf==='med'?0.75: 0.55);
  return { pane:'points', radius, fillOpacity:alpha, opacity:1, weight:1 };
}

function damStyle(/*f*/){
  return { pane:'points', radius:6, fillOpacity:0.85, opacity:1, weight:1 };
}

function dataBases(){
  const here = new URL(location.href);
  const preferred = ['/data/'];
  const relatives = [
    new URL('./data/',  here).pathname,
    new URL('../data/', here).pathname
  ];
  const legacy = ['/amaayesh/'];
  const bases = [...new Set([...preferred, ...relatives, ...legacy])] // dedupe, keep order
    .map(p => (p || '/')
      .replace(/\/{2,}/g,'/')
      .replace(/([^/])$/,'$1/'));
  return bases;
}

// --- AMA FIX: robust vendor loader (no double download, ordered) ---
async function tryLoadVendorScript(relPath){
  const here = new URL(location.href);
  const bases = [
    new URL('./assets/vendor/',  here).pathname,
    new URL('../assets/vendor/', here).pathname, // cover nested /amaayesh/
    '/assets/vendor/'
  ].map(p => (p || '/')
      .replace(/\/{2,}/g,'/')
      .replace(/([^/])$/,'$1/'));

  const uniq = [...new Set(bases)];
  const qs   = (typeof window.__AMA_BUILD_ID !== 'undefined') ? `?v=${window.__AMA_BUILD_ID}` : '';

  for (const base of uniq){
    const url = base + relPath + qs;
    try{
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.async = false;            // preserve insertion order
        s.onload = () => resolve(true);
        s.onerror = () => reject(new Error('load-failed'));
        document.head.appendChild(s);
      });
      if (window.AMA_DEBUG) console.log('[vendor]', 'loaded', url);
      return true;
    } catch (e) {
      if (window.AMA_DEBUG) console.log('[vendor]', 'miss', url, e?.message || 'error');
      // try next base
    }
  }
  if (window.AMA_DEBUG) console.log('[vendor]', 'not-found', relPath);
  return false;
}

// Load multiple vendors sequentially
async function loadVendorsInOrder(list){
  for (const rel of list){
    const ok = await tryLoadVendorScript(rel);
    if(!ok) throw new Error('vendor-not-found: ' + rel);
  }
}


function isPolyFeature(f){ if(!f||!f.geometry) return false; const t=f.geometry.type; return t==='Polygon'||t==='MultiPolygon'; }
function featureHasCountyProp(f){ const p=f.properties||{}; return !!(p.county||p.name_fa||p.name); }
function collectGeoJsonLayersDeep(root){
  const out=[]; function dfs(l){ if(!l) return;
    if(l instanceof L.GeoJSON) out.push(l);
    if(typeof l.getLayers==='function') l.getLayers().forEach(dfs);
  }
  if(root && root._layers) Object.values(root._layers).forEach(dfs);
  dfs(root); return out;
}
function pickBestCountiesLayer(map){
  const cands = collectGeoJsonLayersDeep(map).map(l=>{
    let total=0, named=0;
    if(typeof l.eachLayer==='function') l.eachLayer(sl=>{
      if(sl.feature && isPolyFeature(sl.feature)){ total++; if(featureHasCountyProp(sl.feature)) named++; }
    });
    return {layer:l,total,named};
  }).filter(x=>x.total>0);
  cands.sort((a,b)=>(b.named-a.named)||(b.total-a.total));
  return cands[0]?.layer||null;
}
function ensureCountiesLayer(map){
  return window.__countiesLayer || null;
}
function eachPolyFeatureLayer(root, fn){
  function walk(l){
    if(!l) return;
    if(typeof l.getLayers==='function'){ l.getLayers().forEach(walk); return; }
    const f = l.feature;
    const t = f?.geometry?.type;
    if (t==='Polygon' || t==='MultiPolygon') fn(l);
  }
  walk(root);
}

// expose active KPI (default)
window.__activeWindKPI = localStorage.getItem('ama-wind-metric') || 'wind_wDensity';
window.setActiveWindKPI = function(k){
  window.__activeWindKPI = k; localStorage.setItem('ama-wind-metric', k);
  if (window.__countiesLayer) {
    const dyn = computeQuantileBreaksFromLayer(window.__countiesLayer, k);
    if (dyn) window.__WIND_BREAKS = dyn;
    if (CHORO_ON) {
      eachPolyFeatureLayer(window.__countiesLayer, l=>{
        if (l.feature) l.setStyle(styleForCounty(l.feature));
      });
    }
  }
  if (typeof renderLegend==='function') renderLegend();
  if (typeof __AMA_renderTop10==='function') __AMA_renderTop10();
  updateStatusLine();
};
// ===== END WIND DIAG BASICS =====

function parseCSV(text){
  if(!text) return [];
  const SEP = /,|;/;
  const lines = text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(SEP).map(h=>h.trim());
  const rows = [];
  for(const line of lines){
    if(!line || !line.trim()) continue;
    const cols = line.split(SEP);
    const row = {};
    headers.forEach((h,i)=> row[h] = (cols[i]||'').trim());
    rows.push(row);
  }
  return rows;
}

function styleForCounty(feature){
  const p = feature.properties||{};
  const k = window.__activeWindKPI || 'wind_wDensity';
  const v = Number(p[k] ?? 0);
  const has = !!p.__hasWindData;
  if(!has) return {fillOpacity:.15, color:'#7a7a7a', weight:.8, dashArray:'3', fillColor:'#e5e7eb'};
  if(v===0) return {fillOpacity:.88, color:'#6b7280', weight:.9, fillColor:'#f3f4f6'};
  const ramp = ['#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9'];
  const br = window.__WIND_BREAKS || [0.2,0.4,0.6,0.8];
  let i=0; if(v>br[0]) i=1; if(v>br[1]) i=2; if(v>br[2]) i=3; if(v>br[3]) i=4;
  return {fillOpacity:.9, color:'#475569', weight:.9, fillColor:ramp[i]};
}

function computeQuantileBreaksFromLayer(layer, key, cuts=[0.2,0.4,0.6,0.8]){
  const vals=[]; if(!layer) return null;
  eachPolyFeatureLayer(layer, l=>{
    const v=+((l.feature?.properties||{})[key]??0);
    if(Number.isFinite(v) && v>0) vals.push(v);
  });
  if(vals.length<5) return null;
  vals.sort((a,b)=>a-b);
  const q=p=>vals[Math.floor(p*(vals.length-1))];
  return cuts.map(q);
}

function updateStatusLine(){
  const el = document.getElementById('info');
  if(!el || !window.__weightsIdx) return;
  let has=0;
  eachPolyFeatureLayer(window.__countiesLayer, l=>{
    const p=l.feature?.properties||{};
    if(p.__hasWindData) has++;
  });
  el.textContent = `دادهٔ باد آماده — ${Object.keys(window.__weightsIdx||{}).length} ردیف، ${has} شهرستان دارای داده`;
  el.classList.remove('text-slate-300');
  el.classList.add('text-slate-400');
}

window.runWindSelfCheck = function(opts){
  const log = opts?.log !== false;
  if (log && window.AMA_DEBUG) console.log('[AMA] self-check started');
  try{
    const rows=[]; let has=0, nod=0; const uniq = new Set();
    const namesMap = new Set();             // normalized names present on map (union)
    const seen = new Set();                 // to dedupe rows by normalized name
    const addRow = (p, src)=>{
      const rawName = (p?.county || p?.name_fa || p?.name || p?.NAME_2 || p?.NAME_1 || p?.shahrestan || p?.['نام'] || p?.['نام_شهرستان'] || '');
      const name = canonicalCountyName(rawName);
      const k = keyOf(name);
      if(!k || seen.has(k)) return;
      seen.add(k);
      namesMap.add(k);
      const hd = !!p.__hasWindData;
      rows.push({ county:name, hasData:hd, N:+(p.wind_N||0), sumW:+(p.wind_sumW||0), avgW:+(p.wind_avgW||0), _src:src });
      uniq.add(k);
      if(hd) has++; else nod++;
    };

    // source counters
    const srcCount = { countiesLayer:0, choropleth:0, boundary:0, polysFC:0, countiesGeo:0 };

    // 1) Leaflet layers (if present)
    const layers=[];
    if (window.__countiesLayer && typeof window.__countiesLayer.eachLayer==='function') layers.push(['countiesLayer', window.__countiesLayer]);
    if (window.windChoroplethLayer && typeof window.windChoroplethLayer.eachLayer==='function') layers.push(['choropleth', window.windChoroplethLayer]);
    if (window.boundary && typeof window.boundary.eachLayer==='function') layers.push(['boundary', window.boundary]);
    layers.forEach(([name,L])=>{
      eachPolyFeatureLayer(L, l=>{ addRow((l.feature||{}).properties||{}, name); srcCount[name]++; });
    });

    // 2) polysFC union (not fallback-only)
    if (window.polysFC?.features?.length){
      window.polysFC.features.forEach(f=>{
        const p = f?.properties || {};
        if (typeof p.__hasWindData === 'undefined'){
          const n=+(p.wind_N||0), s=+(p.wind_sumW||0), avg=+(p.wind_avgW||0);
          p.__hasWindData = (n>0)||(s>0)||(avg>0);
        }
        addRow(p, 'polysFC'); srcCount.polysFC++;
      });
    }

    // 3) countiesGeo union (not fallback-only)
    if (window.countiesGeo?.features?.length){
      window.countiesGeo.features.forEach(f=>{
        const p = f?.properties || {};
        if (typeof p.__hasWindData === 'undefined'){
          const n=+(p.wind_N||0), s=+(p.wind_sumW||0), avg=+(p.wind_avgW||0);
          p.__hasWindData = (n>0)||(s>0)||(avg>0);
        }
        addRow(p, 'countiesGeo'); srcCount.countiesGeo++;
      });
    }

    // Build namesIdx from weights CSV index (if available)
    const namesIdx = new Set();
    if (window.__AMA_windIdx && typeof window.__AMA_windIdx === 'object'){
      Object.keys(window.__AMA_windIdx).forEach(k => namesIdx.add(keyOf(canonicalCountyName(k))));
    }
    // Mismatch diagnostics
    const onlyInMap = [];
    const onlyInIdx = [];
    if (namesMap.size){
      namesMap.forEach(k => { if(!namesIdx.has(k)) onlyInMap.push(k); });
    }
    if (namesIdx.size){
      namesIdx.forEach(k => { if(!namesMap.has(k)) onlyInIdx.push(k); });
    }

    const summary = {
      mapCount: rows.length, uniqueCountyCount: uniq.size, hasData:has, noData:nod,
      onlyInMap, onlyInIdx,
      sourcesCount: srcCount
    };
    window.__WIND_SELF_CHECK = summary;
    window.__WIND_SELF_CHECK_ROWS = rows;
    if (log && window.AMA_DEBUG){
      console.group('WIND SELF-CHECK');
      console.table(rows.slice(0,12));
      console.log('[AMA] summary', summary);
      if (onlyInMap.length) console.warn('[AMA] onlyInMap', onlyInMap.slice(0,20), '… total:', onlyInMap.length);
      if (onlyInIdx.length) console.warn('[AMA] onlyInIdx', onlyInIdx.slice(0,20), '… total:', onlyInIdx.length);
      console.groupEnd();
    }
  }catch(e){ if(window.AMA_DEBUG) console.error('runWindSelfCheck', e); }
  if (log && window.AMA_DEBUG) console.log('[AMA] self-check done');
  return window.__WIND_SELF_CHECK;
};

window.__AMA_QA = function(){
  let has=0, rows=[];
  if(!window.__countiesLayer){ console.warn('no counties layer'); return; }
  eachPolyFeatureLayer(window.__countiesLayer, l=>{
    const p=l.feature?.properties||{};
    if(p.__hasWindData){
      has++;
      rows.push({county:p.NAME||p.name||p.county, N:p.wind_N, MW:p.wind_sumW, d:p.wind_wDensity});
    }
  });
  if(window.AMA_DEBUG){
    console.table(rows.slice(0,10));
    console.log('counties with wind data =', has);
  }
};

// Debug flag and fetch logger
if (window.AMA_DEBUG && typeof window.fetch === 'function') {
  const _origFetch = window.fetch;
  window.fetch = async function(...args){
    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
    const t0 = performance.now();
    try {
      const res = await _origFetch.apply(this, args);
      const dt = Math.round(performance.now() - t0);
      console.log('[ama:fetch]', res.status, url, `${dt}ms`);
      return res;
    } catch (e) {
      const dt = Math.round(performance.now() - t0);
      console.warn('[ama:fetch-err]', url, e?.message, `${dt}ms`);
      throw e;
    }
  };
}

window.addEventListener('unhandledrejection', e => {
  const msg = e?.reason?.message || e?.reason || '';
  if (/message channel closed/i.test(String(msg))) {
    if (window.AMA_DEBUG) console.warn('[ama-ignore-ext]', msg);
    e.preventDefault();
  }
});
window.addEventListener('error', e => {
  const msg = e?.message || e?.error?.message || '';
  if (/message channel closed/i.test(String(msg))) {
    if (window.AMA_DEBUG) console.warn('[ama-ignore-ext]', msg);
    e.preventDefault();
  }
});

// (IIFE wrapper) — now converted to callable function
async function buildOverlaysAfterBoundary(paths){
// === AMA HELPERS (top-level, safe scope) ===
const map = window.__AMA_MAP;
const canvasRenderer = window.__AMA_canvasRenderer;
const AMA_DEBUG = window.AMA_DEBUG;
let __LAYER_MANIFEST_BASE = '/data/';
const __jsonCache = new Map();

function setManifestBase(fromUrl){
  try {
    __LAYER_MANIFEST_BASE = new URL('.', fromUrl).pathname.replace(/\/{2,}/g,'/'); // e.g. '/data/'
    if (AMA_DEBUG) console.log('[ama:manifest] base', __LAYER_MANIFEST_BASE);
  } catch {}
}

function absFromManifest(rel){
  const base = __LAYER_MANIFEST_BASE || '/data/';
  const qs = (typeof window.__AMA_BUILD_ID !== 'undefined') ? `?v=${window.__AMA_BUILD_ID}` : '';
  const cleanRel = String(rel || '').replace(/^\.\?\//,'');
  const abs = new URL(cleanRel, location.origin + base).pathname;
  return abs + qs;
}

async function fetchJSONFromManifest(rel){
  let url = absFromManifest(rel);
  url = normalizeDataPath(url);
  if (__jsonCache.has(url)) return __jsonCache.get(url);
  const res = await fetch(url);
  if (AMA_DEBUG) console.log('[ama:data]', 'GET', url, '->', res.status);
  if (!res.ok) throw new Error('data-not-found: ' + url);
  const j = await res.json();
  __jsonCache.set(url, j);
  return j;
}

window.AMA_DEBUG = AMA_DEBUG;
const AMA_HAS_CLUSTER = typeof window.supercluster !== 'undefined';

async function fetchTextFromManifest(rel){
  const qs  = (typeof window.__AMA_BUILD_ID !== 'undefined') ? `?v=${window.__AMA_BUILD_ID}` : '';
  const base = __LAYER_MANIFEST_BASE || '/data/';
  const cleanRel = String(rel || '').replace(/^\.?\//,'');
  const url = new URL(cleanRel, location.origin + base).pathname + qs;
  const res = await fetch(url);
  if (AMA_DEBUG) console.log('[ama:data:text] GET', url, '->', res.status);
  if (!res.ok) throw new Error('data-not-found: ' + url);
  return await res.text();
}

async function joinWindWeightsOnAll(){
  let text='';
  try {
    text = await fetchTextFromManifest('amaayesh/wind_weights_by_county.csv');
  } catch (e) {
    window.__WIND_WEIGHTS_MISSING = true;
    if(AMA_DEBUG) console.warn('[join] CSV missing');
    return;
  }

  const rows = parseCSV(text);
  const idx = {};
  for (const r of rows) {
    const c = canonicalCountyName(r.county);
    if (!c) continue;
    idx[c] = {
      n_sites:+r.n_sites||0,
      sum_w:+r.sum_w||0,
      area_km2:+r.area_km2||0,
      sites:r.sites||'',
      wind_class:r.wind_class||''
    };
  }
  window.__weightsIdx = idx;
  try { window.__AMA_windIdx = idx; } catch(_) {}
  if(!window.__countiesLayer){ if(AMA_DEBUG) console.warn('[join] no counties layer'); return; }

  if (window.AMA_DEBUG){
    (function windJoinReport(){
      const csvKeys = Object.keys(window.__weightsIdx||{});
      const mapKeys = new Set();
      let mapCount = 0;
      eachPolyFeatureLayer(window.__countiesLayer, l=>{
        mapCount++;
        const k = deriveCountyFromProps(l.feature?.properties||{});
        if (k) mapKeys.add(k);
      });
      const onlyInCSV = csvKeys.filter(k=>!mapKeys.has(k));
      const onlyInMap = [...mapKeys].filter(k=>!(window.__weightsIdx||{})[k]);
      console.group('[wind join]');
      console.log('CSV count:', csvKeys.length, 'Map count (processed):', mapCount, 'Unique county names:', mapKeys.size);
      if (onlyInCSV.length){
        console.error('Only in CSV (no polygon match):', onlyInCSV);
        console.error('❌ join QA (subset) failed.');
      } else {
        if (onlyInMap.length) console.info('Only in Map (no CSV row):', onlyInMap);
        console.log('✅ join QA (subset) passed.');
      }
      console.groupEnd();
    })();
  }

  eachPolyFeatureLayer(window.__countiesLayer, leaf=>{
    const p = leaf.feature?.properties || {};
    const key = deriveCountyFromProps(p); // خودش canonical می‌کند
    const w = window.__weightsIdx[key] || {};
    let areaKm2 = +p.area_km2 || 0;
    if (!areaKm2 && +w.area_km2) areaKm2 = +w.area_km2;

    p.wind_N       = +w.n_sites||0;
    p.wind_sumW    = +w.sum_w||0;
    p.wind_avgW    = p.wind_N ? (p.wind_sumW/p.wind_N) : 0;
    p.wind_density = areaKm2 ? (p.wind_N/areaKm2) : 0;
    p.wind_wDensity= areaKm2 ? (p.wind_sumW/areaKm2) : 0;
    p.wind_sites   = w.sites||'';
    p.wind_class   = w.wind_class||'';
    p.__hasWindData= (p.wind_N>0 || p.wind_sumW>0);

    if (CHORO_ON) leaf.setStyle(styleForCounty(leaf.feature));
  });

  window.__WIND_DATA_READY = true;

  // dynamic breaks + restyle
  const k = window.__activeWindKPI || 'wind_wDensity';
  const dyn = (function computeQuantileBreaksFromLayer(layer, key, cuts=[0.2,0.4,0.6,0.8]){
    const vals=[]; eachPolyFeatureLayer(layer, l=>{
      const v=+((l.feature?.properties||{})[key]??0);
      if (Number.isFinite(v)&&v>0) vals.push(v);
    });
    if (vals.length<5) return null;
    vals.sort((a,b)=>a-b);
    const q=p=>vals[Math.floor(p*(vals.length-1))];
    return cuts.map(q);
  })(window.__countiesLayer, k);
  if (dyn) window.__WIND_BREAKS = dyn;
  if (typeof renderLegend==='function') renderLegend();
  if (typeof __AMA_renderTop10==='function') __AMA_renderTop10();
  updateStatusLine();
}

  const labelFa = p => (p?.['name:fa'] || p?.['alt_name:fa'] || p?.name || '—');

    let baseAdminGroup = null,
        countiesFill    = null;

    function safeClearGroup(group) {
      if (!group || group.__AMA_PROTECTED) return;
      group.clearLayers();
    }

    async function __getAllCountiesFC() {
      return window.__countiesGeoAll || { type:'FeatureCollection', features:[] };
    }


    async function ensureAdminBase(){
      if (baseAdminGroup) return;
      const countiesGJ = window.__countiesGeoAll;
      baseAdminGroup = L.featureGroup([], { pane:'polygons' });
      baseAdminGroup.__AMA_PROTECTED = true;
      baseAdminGroup.addTo(map);
      countiesFill = L.geoJSON(countiesGJ, { pane:'polygons', renderer:canvasRenderer, style:{ fillOpacity:0.05, color:'#444', weight:0.7 } });
      countiesFill.__AMA_PROTECTED = true;
      baseAdminGroup.addLayer(countiesFill);
      window.__AMA_COUNTIES_SOURCE = countiesGJ;
      window.__countiesLayer = countiesFill;
      window.__AMA_countySource = 'preloaded all-counties';
      window.__countiesGeoAll = countiesGJ;
      if (window.AMA_DEBUG) console.log('[AHA] county source=preloaded');
      if (window.AMA_DEBUG) console.log('[AMA] base groups protected:', !!baseAdminGroup, !!countiesFill?.__AMA_PROTECTED, !!boundary?.__AMA_PROTECTED);
    }

    const debounce = (fn,ms=300)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

    let AMA_INIT_DONE = false;
    let AMA_USER_TOGGLE = false;
    let overlays = null;

    const ToolDock = L.Control.extend({
      options:{ position:'topleft' },
      onAdd: function(){
        const c = L.DomUtil.create('div','ama-dock');
        c.innerHTML = `
        <button class="btn" aria-label="لایه‌ها"    data-act="layers">🗂</button>
        <button class="btn" aria-label="ابزارها"    data-act="tools">🛠</button>
        <button class="btn" aria-label="دانلود"    data-act="download">⬇️</button>
        <button class="btn" aria-label="بازنشانی"  data-act="reset">↺</button>
        `;
        // stop map drag
        L.DomEvent.disableClickPropagation(c); L.DomEvent.disableScrollPropagation(c);
        // temp handlers
        c.addEventListener('click',(e)=>{
          const b = e.target.closest('button'); if(!b) return;
          const act = b.dataset.act;
          if(act==='reset' && window.__countiesLayer && window.__mapBounds){ map.fitBounds(window.__mapBounds); }
          if(window.AMA_DEBUG) console.log('[dock]', act);
        });
        return c;
      }
    });
    // remember map bounds once (to use with reset)
    if(!window.__mapBounds) setTimeout(()=>{ try{ window.__mapBounds = map.getBounds(); }catch{} }, 500);
    map.addControl(new ToolDock());

    if (window.AMA_DEBUG && map) {
      map.on('zoomend', () => console.log('[ama:event] zoomend =>', map.getZoom()));
      map.on('moveend', () => console.log('[ama:event] moveend =>', map.getCenter()));
    }

  let searchLayer = L.layerGroup().addTo(map);
  let countiesGeo = null;
  let windSitesGeo = null;
  let __focused = null;
  let sidepanelEl = null;
  let currentPanelName = null;
  const currentSort = { key:'P0', dir:'desc' };
  let p0RankMap = {};
  let infoCtl = null;

  function showInfo(html){
    if (!infoCtl || !infoCtl._div) return;
    infoCtl._div.innerHTML = html;
    setClass(infoCtl._div, [], ['hidden']);
  }
  function hideInfo(){
    if (!infoCtl || !infoCtl._div) return;
    setClass(infoCtl._div, ['hidden']);
    infoCtl._div.innerHTML = '';
  }

  infoCtl = L.control({ position: 'topleft' });
  infoCtl.onAdd = function(map){
    const div = L.DomUtil.create('div','ama-infox info-popup hidden');
    div.setAttribute('dir','rtl');
    return (infoCtl._div = div);
  };
  infoCtl.addTo(map);

  // wind weights / KPI state
  let windKpiKey = window.__activeWindKPI || 'wind_wDensity';
  const windKpiLabels = {
    wind_N: 'N',
    wind_sumW: 'Σw',
    wind_density: 'N/km²',
    wind_wDensity: 'Σw/km²',
    wind_avgW: 'avgW'
  };
  let windSitesRaw = [];

  // === AMAAYESH DATA LOADER (path-robust) ===
  function normalizeName(name){
    // 1) حذف ./ و / اضافی در ابتدا
    let s = String(name).replace(/^\.\//,'').replace(/^\/+/,'');
    // 2) حذف پیشوندهای قدیمی که ممکن است از مانیفست آمده باشد
    s = s.replace(/^amaayesh\/data\//, '')
         .replace(/^data\/amaayesh\//, '')
         .replace(/^data\//, '')
         .replace(/^amaayesh\//, '');
    return s; // فقط filename.geojson
  }

  // --- manifest ---
  function inManifest(name){
    const S = window.__LAYER_MANIFEST;
    if (!(S instanceof Set)) return true; // no manifest -> allow
    const norm = normalizeName(name);
    return S.has(norm);
  }

let __MANIFEST_P = null;
async function loadLayerManifestOnce(){
  if (window.__LAYER_MANIFEST_JSON && window.__LAYER_MANIFEST_URL) {
    return { json: window.__LAYER_MANIFEST_JSON, url: window.__LAYER_MANIFEST_URL };
  }
  if (__MANIFEST_P) return __MANIFEST_P;
  __MANIFEST_P = actuallyLoadManifest();
  return __MANIFEST_P;
}

async function actuallyLoadManifest(){
  const bases = dataBases();
  const qs = (typeof window.__AMA_BUILD_ID !== 'undefined') ? `?v=${window.__AMA_BUILD_ID}` : '';
  for (const b of bases){
    const url = b + 'layers.config.json' + qs;
    try{
      const res = await fetch(url);
      if (AMA_DEBUG) console.log('[ama:fetch]', 'GET', url, '->', res.status);
      if (res.ok){
        const json = await res.json();
        if (AMA_DEBUG) console.log('[ama:manifest] loaded from', url);
        return { json, url };
      }
    }catch(e){
      if (AMA_DEBUG) console.log('[ama:fetch]', 'ERR', url, e?.message);
    }
  }
  throw new Error('manifest-not-found');
}

  try {
    const { json, url } = await loadLayerManifestOnce();
    setManifestBase(url);
    window.__LAYER_MANIFEST = new Set((json.files || []).map(normalizeName));
    window.__LAYER_MANIFEST_URL = url;
    window.__LAYER_MANIFEST_JSON = json;
    if (window.AMA_DEBUG) console.log('[AHA] manifest path used=', url);
    if (AMA_DEBUG) console.log('[ama:manifest] using', url);
  } catch (e) {
    if (window.showToast) window.showToast('عدم دسترسی به داده‌ها (layers.config.json).');
    if (AMA_DEBUG) console.warn(e);
  }

  window.__dumpAmaState = function(){
    const arr = Array.isArray(window.__LAYER_MANIFEST) ? window.__LAYER_MANIFEST : Array.from(window.__LAYER_MANIFEST||[]);
    const inManifest = (k)=> arr.includes(normalizeName(k));
    const info = {
      manifestUrl: window.__LAYER_MANIFEST_URL,
      manifestSize: arr.length,
      manifestSample: arr.slice(0,5),
      inManifest: {
        'amaayesh/wind_sites.geojson': inManifest('amaayesh/wind_sites.geojson')
      },
      dataBase: '/data/amaayesh/',
      activeKPI: window.__activeWindKPI,
      hasCountyLayer: !!(window.__countiesLayer || window.windChoroplethLayer || window.boundary),
      polysFC_features: window.polysFC?.features?.length || 0,
      countiesGeo_features: window.countiesGeo?.features?.length || 0,
      countySource: window.__AMA_countySource || 'unknown'
    };
    if(window.AMA_DEBUG) console.log('[AMA] dump', info);
    return info;
  };

  // --- helpers for robust county name matching ---
  function __AMA_candidateNames(p){
    if(!p) return [];
    const keys = ['county','name_fa','name','NAME_2','NAME_1','shahrestan','نام','نام_شهرستان'];
    const vals = [];
    for(const k of keys){ if(p[k]!=null) vals.push(String(p[k])); }
    return vals;
  }
  function __AMA_matchPropsByName(p, normTarget){
    return __AMA_candidateNames(p).some(v => keyOf(v) === normTarget);
  }

  // helper: find a county by (normalized) Persian name in the live datasets
  window.__AMA_whereCounty = function(name){
    const target = keyOf(name||'');
    let found = null, source = null;
    // 1) live Leaflet layers first
    if (!found && window.__countiesLayer && typeof window.__countiesLayer.eachLayer==='function'){
      eachPolyFeatureLayer(window.__countiesLayer, l=>{
        const p=(l.feature||{}).properties||{};
        if(!found && __AMA_matchPropsByName(p, target)){ found=p; source='__countiesLayer'; }
      });
    }
    if (!found && window.windChoroplethLayer && typeof window.windChoroplethLayer.eachLayer==='function'){
      eachPolyFeatureLayer(window.windChoroplethLayer, l=>{
        const p=(l.feature||{}).properties||{};
        if(!found && __AMA_matchPropsByName(p, target)){ found=p; source='windChoroplethLayer'; }
      });
    }
    // 2) FC used to build the choropleth
    if (!found && window.polysFC?.features?.length){
      const f = window.polysFC.features.find(f=> __AMA_matchPropsByName((f||{}).properties||{}, target));
      if (f){ found=f.properties||null; source='polysFC'; }
    }
    // 3) raw GeoJSON fallback
    if (!found && window.countiesGeo?.features?.length){
      const f = window.countiesGeo.features.find(f=> __AMA_matchPropsByName((f||{}).properties||{}, target));
      if (f){ found=f.properties||null; source='countiesGeo'; }
    }
    if(window.AMA_DEBUG) console.log('[AMA] whereCounty', name, '-> source:', source, 'props:', found);
    return found;
  };

  // helper: list all available county names (for debugging)
  window.__AMA_listCountyNames = function(){
    const seen = new Set(); const out = [];
    const push = (nm, src) => { const k=keyOf(nm||''); if(!k || seen.has(k)) return; seen.add(k); out.push({name:nm, source:src}); };
    const collectFromLayer = (L, src)=>{
      if(!L || typeof L.eachLayer!=='function') return;
      eachPolyFeatureLayer(L, l=>{
        const p=(l.feature||{}).properties||{};
        for(const nm of __AMA_candidateNames(p)) push(nm, src);
      });
    };
    collectFromLayer(window.__countiesLayer, 'countiesLayer');
    collectFromLayer(window.windChoroplethLayer, 'choropleth');
    if (window.polysFC?.features?.length){
      window.polysFC.features.forEach(f=> __AMA_candidateNames(f.properties||{}).forEach(nm=> push(nm, 'polysFC')));
    }
    if (window.countiesGeo?.features?.length){
      window.countiesGeo.features.forEach(f=> __AMA_candidateNames(f.properties||{}).forEach(nm=> push(nm, 'countiesGeo')));
    }
    if(window.AMA_DEBUG) console.log('[AMA] county names', out.slice(0,20), '… total:', out.length);
    return out;
  };

  if (window.AMA_DEBUG) {
    window.__dumpAmaState();
  }

  // load a GeoJSON file only if manifest allows it
  async function optionalGeoJSONFile(file, opts = {}) {
    if (!inManifest(file)) {
      if (window.AMA_DEBUG) console.log('[ama-layer] skip (not in manifest):', file);
      return null;
    }
    let geo = null;
    try {
      geo = await fetchJSONFromManifest(file);
    } catch (e) {
      if (window.AMA_DEBUG) console.warn('[ama-layer] missing or empty:', file);
      if (window.showToast) showToast('عدم دسترسی به داده‌ها: ' + file);
      return null;
    }
    if (!geo?.features?.length) {
      if (window.AMA_DEBUG) console.warn('[ama-layer] missing or empty:', file);
      return null;
    }
    return L.geoJSON(geo, opts);
  }

  // لودر ساده با fallback روی نام‌های جایگزین
  async function loadJSON(relOrList, { layerKey, fallbacks = [] } = {}) {
    const rels = Array.isArray(relOrList) ? relOrList : [relOrList];
    for (const rel of [...rels, ...fallbacks]) {
      try {
        const j = await fetchJSONFromManifest(rel);
        if (j) return j;
      } catch(e) {}
    }
    if (layerKey) disableLayerToggle(layerKey);
    if (window.showToast) showToast('عدم دسترسی به داده‌ها: ' + rels[0]);
    if (window.AMA_DEBUG) console.log('⛔️ Dataset not found:', rels[0], '→ tried:', rels.concat(fallbacks));
    return null;
  }

  function disableLayerToggle(layerKey) {
    const el = document.querySelector(`[data-layer-key="${layerKey}"]`);
    if (el) {
      el.disabled = true;
      el.checked = false;
      el.title = 'فایل داده در این دیپلوی موجود نیست';
      el.closest('label')?.classList.add('is-disabled');
    }
  }

  // === Sidepanel helpers ===
  let sidepanelOverlay = null;
  function createSidepanel(){
    if(sidepanelEl) return;
    sidepanelOverlay = document.createElement('div');
    sidepanelOverlay.id = 'ama-sp-overlay';
    sidepanelOverlay.className = 'overlay hidden';
    document.body.appendChild(sidepanelOverlay);
    sidepanelOverlay.addEventListener('click', closeSidepanel);

    const div = document.createElement('div');
    div.id = 'ama-sidepanel';
    div.className = 'ama-sidepanel map-panel';
    div.innerHTML = `<header><h3 id="ama-sp-name"></h3><button class="close-btn" aria-label="بستن">×</button></header><div id="ama-sp-body"></div>`;
    document.body.appendChild(div);
    sidepanelEl = div;
    div.querySelector('.close-btn').addEventListener('click', closeSidepanel);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeSidepanel(); });
  }

  function closeSidepanel(){
    if(sidepanelOverlay) setClass(sidepanelOverlay, ['hidden']);
    sidepanelEl?.classList.remove('open');
    if (currentPanelName) {
      trackAnalyticsEvent('panel_close', { panel: currentPanelName });
      currentPanelName = null;
    }
  }

  function openSidepanel(p){
    if(!sidepanelEl) createSidepanel();
    if(!sidepanelEl) return;
    const name = p.county || p.name || '—';
    currentPanelName = name;
    const body = sidepanelEl.querySelector('#ama-sp-body');
    const kpiHtml = `<div class="kpi-grid">
        <div>N</div><div>${p.wind_N!=null?__AMA_fmtNumberFa(p.wind_N,{digits:0}):'—'}</div>
        <div>Σw</div><div>${p.wind_sumW!=null?__AMA_fmtNumberFa(p.wind_sumW,{digits:3}):'—'}</div>
        <div>N/km²</div><div>${p.wind_density!=null?__AMA_fmtNumberFa(p.wind_density,{digits:3}):'—'}</div>
        <div>Σw/km²</div><div>${p.wind_wDensity!=null?__AMA_fmtNumberFa(p.wind_wDensity,{digits:3}):'—'}</div>
        <div>avgW</div><div>${p.wind_avgW!=null?__AMA_fmtNumberFa(p.wind_avgW,{digits:3}):'—'}</div>
      </div>`;
    const sites = (windSitesRaw||[]).filter(r=> sameCounty(r.county, name)).slice(0,8);
    const list = sites.map(s=>`<li>${s.name_fa||'—'} <small>(${(+s.lon).toFixed(2)},${(+s.lat).toFixed(2)})</small> <span>${s.source||''}</span> <button data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.name_fa}">نمایش روی نقشه</button></li>`).join('');
    body.innerHTML = `${kpiHtml}${sites.length?`<div><b>سایت‌های این شهرستان:</b><ul class="sp-sites">${list}</ul></div>`:''}<div style="margin-top:8px"><button id="ama-sp-dl">دانلود CSV شهرستان</button></div>`;
    sidepanelEl.querySelector('#ama-sp-name').textContent = name;
    sidepanelEl.classList.add('open');
    trackAnalyticsEvent('panel_open', { panel: name });
    if(sidepanelOverlay) setClass(sidepanelOverlay, [], ['hidden']);
    const btn = sidepanelEl.querySelector('.close-btn');
    btn.focus();
    sidepanelEl.onkeydown = e=>{
      if(e.key==='Tab'){
        const focusable = sidepanelEl.querySelectorAll('button,a');
        if(!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    body.querySelectorAll('button[data-lat]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const lat=+b.dataset.lat, lon=+b.dataset.lon; const nm=b.dataset.name||'';
        safeClearGroup(searchLayer);
        const m=L.marker([lat,lon]).addTo(searchLayer); m.bindPopup(nm).openPopup();
        map.setView([lat,lon],11);
      });
    });
    const dlBtn = body.querySelector('#ama-sp-dl');
    if(dlBtn){ dlBtn.addEventListener('click', ()=>{
      const csv = 'name_fa,lon,lat,source\n'+sites.map(s=>`${s.name_fa},${s.lon},${s.lat},${s.source}`).join('\n');
      downloadBlob(`${name}.csv`, csv);
    }); }
  }

  function focusCountyByName(name){
    let targetLayer=null;
    (windChoroplethLayer||boundary)?.eachLayer?.(l=>{ if(sameCounty(l.feature?.properties?.county||'', name)) targetLayer=l; });
    if(targetLayer){
      map.fitBounds(targetLayer.getBounds(), {maxZoom:11});
      targetLayer.fire('click');
      targetLayer.setStyle({weight:2});
      setTimeout(()=>{ if(__focused===targetLayer) targetLayer.setStyle({weight:1.2}); },800);
    }
  }
  window.__AMA_focusCountyByName = focusCountyByName;

  function makeTopCSV(rows){
    const header = 'rank,county,capacity_mw,MW_per_ha,P0';
    const lines = rows.map((p,i)=>[i+1,p.county||'',p.capacity_mw||'',p.MW_per_ha||'',p.P0||''].join(','));
    return [header,...lines].join('\n');
  }
  function downloadBlob(name, text){
    const blob = new Blob([text],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function openTopModal(rows){
    const modal = document.createElement('div');
    modal.className = 'ama-modal';
    modal.innerHTML = `<div class="ama-modal-content" dir="rtl"><div id="ama-modal-body"></div><div style="text-align:center;margin-top:10px"><button class="close-btn">بستن</button></div></div>`;
    document.body.appendChild(modal);
    const body = modal.querySelector('#ama-modal-body');
    body.innerHTML = rows.map((p,i)=>`<div class="ama-row" data-county="${p.county||''}"><div class="c">${__AMA_fmtNumberFa(i+1)}</div><div class="n">${p.county||'—'}</div><div class="m">${__AMA_fmtNumberFa(p.capacity_mw||0,{digits:0})}</div><div class="h">${__AMA_fmtNumberFa(p.MW_per_ha||0,{digits:2})}</div><div class="s">${__AMA_fmtNumberFa(p.P0||0,{digits:2})}</div></div>`).join('');
    body.querySelectorAll('.ama-row').forEach(r=>r.onclick=()=>{focusCountyByName(r.dataset.county); close();});
    function close(){ modal.remove(); }
    modal.addEventListener('click', e=>{ if(e.target===modal || e.target.classList.contains('close-btn')) close(); });
  }

    (async () => {
      await ensureAdminBase();

      let combined = window.__combinedGeo;
      if(!combined?.features?.length){ return; }

      const windPath  = paths.wind;
      const solarPath = paths.solar;
      const damsPath  = paths.dams;

      const windGeojson  = windPath  ? await loadJSON(windPath,  { layerKey:'wind_sites' }) : null;
      const solarGeojson = solarPath ? await loadJSON(solarPath, { layerKey:'solar', fallbacks:[ normalizeName(solarPath) ] }) : null;
      const damsGeojson  = damsPath  ? await loadJSON(damsPath,  { layerKey:'dams',  fallbacks:[ normalizeName(damsPath) ] }) : null;

      if (windGeojson) windSitesGeo = windGeojson;
      if (damsPath && !damsGeojson) showToast('عدم دسترسی به داده‌ها: ' + damsPath);
      if (solarPath && !solarGeojson) showToast('عدم دسترسی به داده‌ها: ' + solarPath);

    const polys = { type:'FeatureCollection', features:[] }, points = { type:'FeatureCollection', features:[] };
    for(const f of combined.features){
      const t = f.geometry?.type;
      if(t==='Polygon' || t==='MultiPolygon') polys.features.push(f);
      else if(t==='Point') points.features.push(f);
    }

    const solarLegendCfg = {
      key:'solar', icon:'☀️', title:'ظرفیت تجمیعی خورشیدی', unit:'MW', type:'choropleth',
      period:'۱۴۰۳', method:'Jenks',
      classes:[
        {min:10, max:38,  color:'#f3f4f6', label:'۱۰–۳۸'},
        {min:38, max:74,  color:'#e9d5ff', label:'۳۸–۷۴'},
        {min:74, max:233, color:'#c4b5fd', label:'۷۴–۲۳۳'},
        {min:233,max:774, color:'#8b5cf6', label:'۲۳۳–۷۷۴'},
        {min:774,max:1200,color:'#5b21b6', label:'۷۷۴–۱۲۰۰'},
      ],
      source:'ساتبا (برآورد استانی)', confidence:'متوسط',
      sub:'ظرفیت (MW) · شفافیت=اطمینان'
    };
    const windLegendCfg = {
      key:'wind', icon:'🌬️', title:'کلاس بادی', unit:'کلاس', type:'choropleth',
      classes:[
        {min:1,max:1,color:'#bdbdbd',label:'کلاس ۱'},
        {min:2,max:2,color:'#f6c945',label:'کلاس ۲'},
        {min:3,max:3,color:'#29cc7a',label:'کلاس ۳'},
      ],
      source:'جدول ۸', confidence:'متوسط',
      sub:'متریک: تراکم باد'
    };
    const damsLegendCfg = {
      key:'dams', icon:'🟦', title:'سدها', type:'dams',
      classes:[
        {min:0,  max:20,  color:'#ef4444', label:'۰–۲۰٪'},
        {min:20, max:40,  color:'#fb923c', label:'۲۰–۴۰٪'},
        {min:40, max:60,  color:'#f59e0b', label:'۴۰–۶۰٪'},
        {min:60, max:80,  color:'#84cc16', label:'۶۰–۸۰٪'},
        {min:80, max:100, color:'#22c55e', label:'۸۰–۱۰۰٪'},
      ],
      samples:[{v:50,r:8},{v:200,r:14},{v:800,r:20}],
      source:'پایش لحظه‌ای آب', confidence:'پایین',
      sub:'وضعیت: ثابت/یونیفرم (در نبود دادهٔ پرشدگی)'
    };
    const tabs = [];
    const scaleSolar = v => {
      const cls = solarLegendCfg.classes.find(c=>v>=c.min && v<=c.max);
      return cls?cls.color:'#f3f4f6';
    };
    const solarLayer = L.geoJSON(polys, {
      pane:'polygons',
      style: f => ({ color:'#374151', weight:1, fillColor:scaleSolar(f.properties.solar_mw), fillOpacity:0.35, opacity:0.7 }),
      onEachFeature: (f,l)=> l.bindTooltip(labelFa(f.properties), {sticky:true, direction:'auto', className:'label'})
      });
    solarLayer.eachLayer(l=>l.feature.properties.__legend_value = l.feature.properties.solar_mw);

    const windLayer = L.geoJSON(polys, {
      pane:'polygons',
      style: f => ({ fillColor: ({1:'#bdbdbd',2:'#f6c945',3:'#29cc7a'})[f.properties.wind_class_num] || '#9e9e9e',
                      fillOpacity:0.35, color:'rgba(39,48,63,.4)', weight:.8 }),
      onEachFeature: (f,l)=> l.bindTooltip(labelFa(f.properties), {sticky:true, direction:'auto', className:'label'})
      });
    windLayer.eachLayer(l=>l.feature.properties.__legend_value = l.feature.properties.wind_class_num);

    let windSitesLayer = null, solarSitesLayer = null, damsLayer = null, windChoroplethLayer = null;

    if (windGeojson) {
      windSitesLayer = L.geoJSON(windGeojson, {
        pane: 'points',
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius:6, weight:1 })
      });
      window.windSitesLayer = windSitesLayer;
    }

    if (solarGeojson) {
      solarSitesLayer = L.geoJSON(solarGeojson, {
        pane:'points',
        pointToLayer: (f,latlng)=> L.circleMarker(latlng, solarStyle(f)),
        onEachFeature: (f,l)=> l.bindPopup(ama_popupContent(f,'solar'))
      });
      window.solarSitesLayer = solarSitesLayer;
    }

    if (damsGeojson) {
      damsLayer = L.geoJSON(damsGeojson, {
        pane:'points',
        pointToLayer: (f,latlng)=> L.circleMarker(latlng, damStyle(f)),
        onEachFeature: (f,l)=> l.bindPopup(ama_popupContent(f,'dam'))
      });
      window.damsLayer = damsLayer;
    }

    tabs.push(windLegendCfg);
    tabs.push(solarLegendCfg);
    if (damsLayer) tabs.push(damsLegendCfg);

    /* Province focus & toggle control removed
    (function(){
      const ctl = L.control({position:"topleft"});
      ctl.onAdd = function() {
        const div = L.DomUtil.create("div","ama-modes");
        div.innerHTML = `
          <button class="chip active" id="btn-prov">استان</button>
          <button class="chip" id="btn-nat">کشور</button>`;
        L.DomEvent.disableClickPropagation(div);
        const toProv = ()=>{
          map.fitBounds(boundary.getBounds(), { padding:[12,12] });
          map.setMaxBounds(boundary.getBounds().pad(0.25));
          div.querySelector("#btn-prov").classList.add("active");
          div.querySelector("#btn-nat").classList.remove("active");
        };
        const toNat = ()=>{
          map.setMaxBounds(null);
          div.querySelector("#btn-nat").classList.add("active");
          div.querySelector("#btn-prov").classList.remove("active");
        };
        div.querySelector("#btn-prov").addEventListener("click", toProv);
        div.querySelector("#btn-nat").addEventListener("click", toNat);
        return div;
      };
      ctl.addTo(map);
    })();
    */

    // === WIND: load computed dataset (amaayesh/wind_sites.geojson) ===
    if (CHORO_ON) {
      const classColors = {1:'#bdbdbd', 2:'#f6c945', 3:'#29cc7a'};
      const fmt = (x, d=1) => (x==null || isNaN(x)) ? '—' : Number(x).toFixed(d);
      const radiusFromMW = mw => Math.max(5, 1.6*Math.sqrt(Math.max(0, mw||0)));

        const countiesLayer = window.__countiesLayer;
        const polysFC = window.__AMA_COUNTIES_SOURCE;
        window.__AMA_countySource = 'none';
        countiesGeo = polysFC; window.countiesGeo = countiesGeo; window.polysFC = polysFC;
        if (polysFC?.features?.length && countiesLayer) {
          createSidepanel();

          function restyle(){
            if(!window.__countiesLayer) return;
            eachPolyFeatureLayer(window.__countiesLayer, l=>{
              l.feature.properties.__legend_value = l.feature.properties[windKpiKey];
              l.setStyle(styleForCounty(l.feature));
            });
            if(__focused){ __focused.setStyle({...styleForCounty(__focused.feature), color:'#22d3ee', weight:1.2, fillOpacity:0.75}); }
          }

          windChoroplethLayer = L.geoJSON(polysFC, {
            filter: (f)=>{
              if (!ACTIVE_PROVINCE) return true;
              const ostan = getProvinceNameFromProps(f?.properties||{});
              return ostan ? (ostan === ACTIVE_PROVINCE) : true; // tolerant
            },
            pane:'polygons',
            style: f => styleForCounty(f),
            onEachFeature:(f,l)=>{
              l.bindTooltip('', {sticky:true, direction:'auto', className:'label'});
              l.on('tooltipopen', e=>{
                const p=e.target.feature?.properties||{};
                const k=window.__activeWindKPI||'wind_wDensity';
                const nf = new Intl.NumberFormat('fa-IR',{ maximumFractionDigits:2 });
                const unit = k==='wind_wDensity' ? 'MW/km²' : (k==='wind_density' ? 'سایت/km²' : '');
                const val = nf.format(p[k]||0);
                const html = `${p.county||'—'}<br>${val} ${unit}<br>تعداد سایت: ${nf.format(p.wind_N||0)}<br>ظرفیت: ${nf.format(p.wind_sumW||0)} MW`;
                e.tooltip.setContent(html);
              });
            }
          });
          window.windChoroplethLayer = windChoroplethLayer;

          if (boundary?.bringToFront) boundary.bringToFront();
          if (window.AMA_DEBUG) console.log('[AHA] overlays list=', Object.keys(overlays||{}));

          map.getPane('polygons')?.classList.add('ama-polygons');
          windChoroplethLayer.eachLayer(l=>{
            const el=l.getElement();
            if(el){ el.setAttribute('tabindex','0'); el.addEventListener('keydown',ev=>{ if(ev.key==='Enter'||ev.key===' ') l.fire('click'); }); }
            l.on('mouseover', ()=>{
              const p=l.feature.properties||{};
              if(__focused!==l) l.setStyle({...styleForCounty(l.feature), color:'#22d3ee', weight:1.2, fillOpacity:0.65});
              const name=p.county||p.name_fa||p.name||'—';
              if(!p.__hasWindData){ showInfo(`<b>${name}</b><div>بدون داده</div>`); }
              else {
                showInfo(`<b>${name}</b><div>N: ${__AMA_fmtNumberFa(p.wind_N,{digits:0})}</div><div>Σw: ${__AMA_fmtNumberFa(p.wind_sumW,{digits:3})}</div><div>N/km²: ${__AMA_fmtNumberFa(p.wind_density,{digits:3})}</div><div>Σw/km²: ${__AMA_fmtNumberFa(p.wind_wDensity,{digits:3})}</div><div>avgW: ${__AMA_fmtNumberFa(p.wind_avgW,{digits:3})}</div>`);
              }
            });
            l.on('mouseout', ()=>{ if(__focused!==l) l.setStyle(styleForCounty(l.feature)); hideInfo(); });
            l.on('click', ()=>{
              __focused=l;
              windChoroplethLayer.eachLayer(x=>x.setStyle(styleForCounty(x.feature)));
              l.setStyle({...styleForCounty(l.feature), color:'#22d3ee', weight:1.2, fillOpacity:0.75});
              openSidepanel(l.feature.properties||{});
            });
          });
          function clearFocus(){
            if(__focused){ windChoroplethLayer.eachLayer(x=>x.setStyle(styleForCounty(x.feature))); __focused=null; }
            hideInfo();
            closeSidepanel();
          }
          map.on('click', (e)=>{ if(!e.layer) clearFocus(); });
          document.addEventListener('keydown', e=>{ if(e.key==='Escape') clearFocus(); });

          // KPI switcher
          const kpiCtl = L.control({position:'topright'});
          kpiCtl.onAdd = function(){
            const div=L.DomUtil.create('div','ama-kpi-switch map-panel');
            div.innerHTML = Object.entries(windKpiLabels).map(([k,v])=>`<label><input type="radio" name="ama-kpi" value="${k}" ${k===windKpiKey?'checked':''}/><span class="chip">${v}</span></label>`).join('');
            if(!window.__WIND_DATA_READY) { div.classList.add('is-disabled'); div.title='داده باد آماده نیست'; }
            L.DomEvent.disableClickPropagation(div);
            div.addEventListener('change', e=>{
              if(e.target && e.target.value){
                windKpiKey=e.target.value;
                window.setActiveWindKPI(windKpiKey);
                map.fire('kpi:change', {kpi: window.__activeWindKPI});
              }
            });
            return div;
          };
          kpiCtl.addTo(map);

          // load raw site CSV for sidepanel
          try {
            const rawTxt = await fetchTextFromManifest('amaayesh/wind_sites_raw.csv');
            windSitesRaw = parseCSV(rawTxt);
          } catch(_) {
            windSitesRaw = [];
          }

          // Top-10 panel
          window.__AMA_topPanel = L.control({position:"topright"});
          window.__AMA_topPanel.onAdd = function(){ const wrap=L.DomUtil.create("div","ama-panel map-panel"); wrap.innerHTML = `<div class="ama-panel-hd">Top-10 باد</div><div class="ama-panel-bd"><div id="ama-top10"></div></div>`; return wrap; };
          window.__AMA_renderTop10 = debounce(function(){
            const el=document.getElementById('ama-top10');
            const panel=el?el.closest('.ama-panel'):null;
            if(!panel||!el) return;
            if(window.__WIND_WEIGHTS_MISSING){ setClass(panel, ['hidden']); return; }
            setClass(panel, [], ['hidden']);
            if(!window.__WIND_DATA_READY){ el.innerHTML = '<div class="ama-loading">در حال بارگذاری…</div>'; return; }
            const rows=polysFC.features.map(f=>f.properties).filter(p=>p.__hasWindData);
            rows.sort((a,b)=>(b[windKpiKey]||0)-(a[windKpiKey]||0));
            const top=rows.slice(0,10);
            el.innerHTML = top.map((p,i)=>`<div class="ama-row" data-county="${p.county||''}"><div class="c">${__AMA_fmtNumberFa(i+1)}</div><div class="n">${p.county||'—'}</div><div class="m">${__AMA_fmtNumberFa(p[windKpiKey]||0,{digits:3})}</div></div>`).join('');
            el.querySelectorAll('.ama-row').forEach(r=>{
              r.addEventListener('click',()=>{ const n=r.getAttribute('data-county'); focusCountyByName(n); openSidepanel(polysFC.features.find(f=>sameCounty(f.properties.county, n))?.properties||{}); });
            });
          },300);
          window.__AMA_topPanel.addTo(map);
          window.__AMA_renderTop10();

          // KPI legend panel
          window.__AMA_kpiLegend = L.control({position:"topright"});
          window.__AMA_kpiLegend.onAdd = function(){
            const wrap = L.DomUtil.create("div","ama-panel map-panel");
            const body = L.DomUtil.create("div","ama-kpi-legend",wrap);
            body.id = "ama-kpi-legend";
            return wrap;
          };
          window.__AMA_kpiLegend.addTo(map);

          window.renderLegend = debounce(function(){
            const el = document.getElementById('ama-kpi-legend');
            if(!el) return;
            if(!window.__WIND_DATA_READY){
              el.innerHTML = '<div class="ama-loading">در حال بارگذاری…</div>';
              return;
            }
            const nf = new Intl.NumberFormat('fa-IR',{ maximumFractionDigits:2 });
            const ramp=['#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9'];
            const br=window.__WIND_BREAKS || [0.2,0.4,0.6,0.8];
            const labels=[
              `≤${nf.format(br[0])}`,
              `${nf.format(br[0])}–${nf.format(br[1])}`,
              `${nf.format(br[1])}–${nf.format(br[2])}`,
              `${nf.format(br[2])}–${nf.format(br[3])}`,
              `>${nf.format(br[3])}`
            ];
            let html='<div class="lg"><span class="sw sw-gray"></span>بدون داده</div>';
            for(let i=0;i<labels.length;i++){
              html += `<div class="lg"><span class="sw ${swClass(ramp[i])}"></span>${labels[i]}</div>`;
            }
            el.innerHTML = html;
          },300);

          window.renderLegend();

          map.on('kpi:change', ()=>{
            restyle();
            window.__AMA_renderTop10?.();
            window.renderLegend?.();
          });

          joinWindWeightsOnAll().then(()=>{
            const kc = kpiCtl.getContainer ? kpiCtl.getContainer() : null;
            if(kc){ kc.classList.remove('is-disabled'); kc.removeAttribute('title'); }
            setActiveWindKPI(window.__activeWindKPI||'wind_wDensity');
            map.fire('kpi:change', {kpi: window.__activeWindKPI||'wind_wDensity'});
          });
        } else {
          const infoEl = document.getElementById('info');
          if(infoEl) infoEl.textContent = 'داده شهرستان‌ها در دسترس نیست.';
        }
      }
    // جایی که datasetهای دیگر را می‌خواندی (مثلاً برق/آب/گاز/نفت):
    let electricityLinesLayer = null;
    if (window.__LAYER_MANIFEST?.has('electricity_lines.geojson')) {
      electricityLinesLayer = await optionalGeoJSONFile('electricity_lines.geojson', { style: f => ({ color:'#22c55e', weight: 2 }) });
    }
    let waterMainsLayer = null;
    if (window.__LAYER_MANIFEST?.has('water_mains.geojson')) {
      waterMainsLayer      = await optionalGeoJSONFile('water_mains.geojson',        { style: f => ({ color:'#3b82f6', weight: 2 }) });
    }
    let gasTransmissionLayer = null;
    if (window.__LAYER_MANIFEST?.has('gas_transmission.geojson')) {
      gasTransmissionLayer = await optionalGeoJSONFile('gas_transmission.geojson',   { style: f => ({ color:'#f59e0b', weight: 2 }) });
    }
    let oilPipelinesLayer = null;
    if (window.__LAYER_MANIFEST?.has('oil_pipelines.geojson')) {
      oilPipelinesLayer    = await optionalGeoJSONFile('oil_pipelines.geojson',      { style: f => ({ color:'#ef4444', weight: 2 }) });
    }

    /* Infrastructure drawer control removed
    const infraCtl = L.control({position:'topleft'});
    infraCtl.onAdd = function(){
      const d = L.DomUtil.create('div','ama-infra');
      d.innerHTML = `
        <button class="chip" id="btn-infra">زیرساخت ▾</button>
        <div id="infra-box" class="box hidden">
          <label><input type="checkbox" data-layer="electricity"> خطوط انتقال برق</label>
          <label><input type="checkbox" data-layer="water"> شبکه آب‌رسانی</label>
          <label><input type="checkbox" data-layer="gas"> خطوط انتقال گاز</label>
          <label><input type="checkbox" data-layer="oil"> خطوط لوله نفت</label>
        </div>`;
      L.DomEvent.disableClickPropagation(d);
      d.querySelector('#btn-infra').onclick = ()=> {
        const el = d.querySelector('#infra-box');
        el.classList.toggle('hidden');
      };
      d.querySelectorAll('input[type=checkbox]').forEach(ch=>{
        ch.addEventListener('change', ()=>{
          const LAY = { electricity:electricityLinesLayer, water:waterMainsLayer, gas:gasTransmissionLayer, oil:oilPipelinesLayer }[ch.dataset.layer];
          if (!LAY) return;
          if (ch.checked) map.addLayer(LAY); else safeRemoveLayer(map, LAY);
        });
      });
      return d;
    };
    infraCtl.addTo(map);
    */

      // ===== LegendDock =====
      function LegendDock(){
        const div = L.DomUtil.create('div','legend-dock map-panel'); div.dir='rtl';
        div.innerHTML = `<div class="legend-tabs"></div><div class="legend-body"></div>`;
        if(localStorage.getItem('ama-legend-collapsed')==='1') div.classList.add('collapsed');
        let groups = [], onFilter = null;
        function renderTabs(){
          const tabs = div.querySelector('.legend-tabs');
          tabs.innerHTML = groups.map((g,i)=>`<button class="chip" data-k="${g.key}">${g.icon||''} ${g.title}</button>`).join('');
          tabs.querySelectorAll('.chip').forEach(t=>t.onclick=()=>activate(t.dataset.k));

          // add collapse/expand toggle
          const toggle = document.createElement('button');
          toggle.className = 'chip';
          toggle.type = 'button';
          toggle.setAttribute('aria-expanded', String(!div.classList.contains('collapsed')));
          toggle.textContent = div.classList.contains('collapsed') ? 'باز کردن' : 'جمع کردن';
          toggle.onclick = () => {
            div.classList.toggle('collapsed');
            const isCol = div.classList.contains('collapsed');
            toggle.textContent = isCol ? 'باز کردن' : 'جمع کردن';
            toggle.setAttribute('aria-expanded', String(!isCol));
            localStorage.setItem('ama-legend-collapsed', isCol ? '1' : '0');
          };
          tabs.appendChild(toggle);
        }
        function activate(key){
          const tabs = div.querySelectorAll('.legend-tabs .chip[data-k]');
          tabs.forEach(t=>t.classList.toggle('active', t.dataset.k===key));
          const g = groups.find(x=>x.key===key), body = div.querySelector('.legend-body');
          if(!g){ body.innerHTML=''; return; }
          if(g.type==='choropleth'){
            const fmt = n => window.__AMA_fmtNumberFa ? __AMA_fmtNumberFa(n,{digits:0}) : n;
            const k = Array.isArray(g.classes) ? g.classes.length : 0;
            const periodChip = g.period?`<span class="chip muted">${g.period}</span>`:'';
            const methodChip = g.method?`<span class="chip muted">${g.method}<span class="info" title="روش طبقه‌بندی: ${g.method} (k=${k})">ⓘ</span></span>`:'';
            const classChip = `<span class="chip">کلاس‌ها: ${fmt(k)}</span>`;
            body.innerHTML = `
        <div class="legend-head"><b>${g.title}</b>${g.unit?`<span class="unit">${g.unit}</span>`:''}${periodChip}${methodChip}${classChip}</div>
        ${g.sub?`<div class="subhead text-[10px] opacity-70">${g.sub}</div>`:''}
        <ul class="swatches">${g.classes.map(c=>`
          <li data-min="${c.min}" data-max="${c.max}" aria-label="از ${fmt(c.min)} تا ${fmt(c.max)}">
            <span class="sw ${swClass(c.color)}"></span>
            <span class="lbl">${c.label || (`${fmt(c.min)}–${fmt(c.max)}`)}</span>
          </li>`).join('')}
        </ul>`;
          }
          if(g.type==='dams'){
            body.innerHTML = `
        <div class="legend-head"><b>${g.title}</b></div>
        ${g.sub?`<div class="subhead text-[10px] opacity-70">${g.sub}</div>`:''}
        <div class="subhead">رنگ = درصد پرشدگی</div>
        <ul class="swatches">${g.classes.map(c=>`
          <li data-min="${c.min}" data-max="${c.max}">
            <span class="sw ${swClass(c.color)}"></span><span class="lbl">${c.label}</span>
          </li>`).join('')}
        </ul>
        <div class="subhead" style="margin-top:8px">اندازه = ظرفیت مخزن (میلیون m³)</div>
        <div class="bubbles">${g.samples.map(s=>`<span class="bubble ${bubbleSizeClass(s.r)}"></span><span class="lbl">${s.v}</span>`).join('')}</div>`;
          }
          const meta = `<div class="legend-meta"><span>منبع: ${g.source||'—'}</span><span>اعتماد داده: ${g.confidence||'—'}</span></div>`;
          body.insertAdjacentHTML('beforeend', meta);
          div.querySelectorAll('.swatches li').forEach(li=>{
            li.onclick = ()=>{
              div.querySelectorAll('.swatches li').forEach(x=>x.classList.remove('active'));
              li.classList.add('active');
              onFilter?.(g.key, {min:+li.dataset.min, max:+li.dataset.max});
            };
            li.ondblclick = ()=>{
              div.querySelectorAll('.swatches li').forEach(x=>x.classList.remove('active'));
              li.classList.add('active');
              onFilter?.(g.key, {min:+li.dataset.min, max:+li.dataset.max, isolate:true});
            };
          });
        }
        return {
          el: div,
          set(newGroups, filterCb){
            groups = newGroups; onFilter = filterCb; renderTabs(); activate(groups[0]?.key);
          },
          reset(){
            div.querySelectorAll('.swatches li').forEach(li=>li.classList.remove('active'));
            groups.forEach(g=> onFilter?.(g.key, null));
          }
        };
      }
      window.legend = new LegendDock();
      window.legendCtl = L.control({position:'bottomright'});
      window.legendCtl.onAdd = ()=> window.legend.el;
      window.legendCtl.addTo(map);

      function setLegendPosition(pos){
        window.legendCtl.setPosition(pos);
        try { localStorage.setItem('ama-legend-pos', pos); } catch(_){ }
      }
      function reevaluateLegendPosition(){
        const topVisible = !!(window.__AMA_topPanel && window.__AMA_topPanel._map);
        const desired = (window.innerWidth < 768 || topVisible) ? 'bottomleft' : 'bottomright';
        const current = window.legendCtl.getPosition ? window.legendCtl.getPosition() : null;
        if(current !== desired) setLegendPosition(desired);
      }
      window.reevaluateLegendPosition = window.reevaluateLegendPosition || reevaluateLegendPosition;
      window.reEvaluateLegendPosition = window.reEvaluateLegendPosition || window.reevaluateLegendPosition || (() => {});
      const storedPos = localStorage.getItem('ama-legend-pos');
      if(storedPos) window.legendCtl.setPosition(storedPos);
      {
        const _re = window.reevaluateLegendPosition || window.reEvaluateLegendPosition;
        if (typeof _re === 'function') { try { _re(); } catch(_){} }
      }
      window.addEventListener('resize', reevaluateLegendPosition);
      map.on('overlayadd overlayremove', reevaluateLegendPosition);

      // === InfoChip: کارت اطلاعات سریع هنگام Hover ===

    if(tabs.length){
        function filterLayer(layer, get, range) {
          layer?.eachLayer?.(l=>{
            if(!range){ layer.resetStyle?.(l); return; }
            const v = get(l); const inRange = (v>=range.min && v<=range.max);
            l.setStyle?.({ fillOpacity: range.isolate ? (inRange?0.75:0.05) : (inRange?0.6:0.25), opacity:1 });
          });
        }
        function applyLegend(){
          window.legend.set(tabs, (key,range)=>{
            if(key==='solar') filterLayer(solarLayer, l=>l.feature.properties.__legend_value, range);
            if(key==='wind')  filterLayer(windChoroplethLayer || windLayer,  l=>l.feature.properties.__legend_value, range);
            if(key==='dams')  filterLayer(damsLayer,  l=>l.feature.properties.__legend_value, range);
          });
        }
        applyLegend();
        map.on('kpi:change', ()=>{ applyLegend(); });
        if(window.__WIND_WEIGHTS_MISSING){
          const warn = document.createElement('div');
          warn.className = 'ama-legend-warning';
          warn.setAttribute('aria-live','polite');
          warn.textContent = 'داده وزن‌ها در دسترس نیست';
          window.legend.el.querySelector('.legend-body')?.appendChild(warn);
        }
      }

      function onZoom(){
        const show = map.getZoom() >= 8;
        [windSitesLayer, solarSitesLayer, damsLayer].forEach(Lyr=>{
          if(!Lyr) return;
          if(!show && map.hasLayer(Lyr)) safeRemoveLayer(map, Lyr);
        });
      }
      map.on('zoomend', onZoom);

      overlays = {};
      if (windSitesLayer)  overlays['سایت‌های بادی (برآوردی)'] = windSitesLayer;
      if (solarSitesLayer) overlays['سایت‌های خورشیدی']       = solarSitesLayer;
      if (damsLayer)       overlays['سدها']                    = damsLayer;

      const overlayEntries = Object.entries(overlays);

      function selectOnly(layerToShow){
        [windSitesLayer, solarSitesLayer, damsLayer].forEach(Lyr=>{
          if(!Lyr) return;
          if(Lyr===layerToShow){
            if(map.getZoom()>=8 && !map.hasLayer(Lyr)) map.addLayer(Lyr);
          } else if(map.hasLayer(Lyr)){
            safeRemoveLayer(map, Lyr);
          }
        });
      }
      const LayersDock = L.Control.extend({
        options: { position:'topleft', dir:'rtl' },
        onAdd: function(m){
          const container = L.DomUtil.create('div', 'layers-dock map-panel leaflet-control');
          container.setAttribute('dir', this.options.dir);

          const tabsEl = L.DomUtil.create('div', 'ld-tabs', container);
          tabsEl.setAttribute('role','tablist');

          const tabDataBtn = L.DomUtil.create('button', 'ld-tab active', tabsEl);
          tabDataBtn.type = 'button';
          tabDataBtn.setAttribute('role','tab');
          tabDataBtn.textContent = 'لایه‌ها';
          tabDataBtn.setAttribute('aria-selected','true');

          const tabDispBtn = L.DomUtil.create('button', 'ld-tab', tabsEl);
          tabDispBtn.type = 'button';
          tabDispBtn.setAttribute('role','tab');
          tabDispBtn.textContent = 'نمایش';
          tabDispBtn.setAttribute('aria-selected','false');
          tabDispBtn.tabIndex = -1;

          const body = L.DomUtil.create('div', 'ld-body', container);
          const dataPane = L.DomUtil.create('div', 'ld-pane', body);
          const displayPane = L.DomUtil.create('div', 'ld-pane hidden', body);

          const overlaySwitches = [];
          function makeSwitch(parent, label, layer, disabled, {track=false}={}){
            const lbl = L.DomUtil.create('label', '', parent);
            if(disabled){ lbl.classList.add('is-disabled'); lbl.title='غیرفعال'; }
            const inp = L.DomUtil.create('input', '', lbl);
            inp.type='checkbox';
            inp.setAttribute('role','switch');
            if(disabled){ inp.disabled=true; }
            else {
              const init = m.hasLayer(layer);
              inp.checked = init; inp.setAttribute('aria-checked', init);
              if(track) overlaySwitches.push({inp, layer});
              inp.addEventListener('change', ()=>{
                const ch = inp.checked; inp.setAttribute('aria-checked', ch);
                if(track){
                  if(ch){
                    overlaySwitches.forEach(sw=>{
                      if(sw.inp!==inp){
                        sw.inp.checked = false;
                        sw.inp.setAttribute('aria-checked','false');
                      }
                    });
                    AMA_USER_TOGGLE=true; selectOnly(layer); AMA_USER_TOGGLE=false;
                  } else {
                    AMA_USER_TOGGLE=true; selectOnly(null); AMA_USER_TOGGLE=false;
                  }
                } else {
                  ch ? m.addLayer(layer) : safeRemoveLayer(map, layer);
                }
              });
              if(!track){
                const sync = e => { if(e.layer===layer){ const p=m.hasLayer(layer); inp.checked=p; inp.setAttribute('aria-checked',p); } };
                m.on('layeradd', sync); m.on('layerremove', sync);
                m.on('overlayadd', sync); m.on('overlayremove', sync);
              }
            }
            const span = L.DomUtil.create('span', '', lbl); span.textContent = label;
          }

          // data overlays
          overlayEntries.forEach(([t,l])=>{
            makeSwitch(dataPane, t, l, !l, {track:true});
          });

          // display/basemap tab
          makeSwitch(displayPane, 'مرز شهرستان‌ها', boundary, !boundary);
          makeSwitch(displayPane, 'شبکه راهنما', window.gridLayer, !window.gridLayer);
          makeSwitch(displayPane, 'برچسب‌ها', window.labelsLayer, !window.labelsLayer);

          function activate(which){
            const isData = which==='data';
            tabDataBtn.classList.toggle('active', isData);
            tabDispBtn.classList.toggle('active', !isData);
            tabDataBtn.setAttribute('aria-selected', isData?'true':'false');
            tabDispBtn.setAttribute('aria-selected', !isData?'true':'false');
            tabDataBtn.tabIndex = isData?0:-1;
            tabDispBtn.tabIndex = !isData?0:-1;
            dataPane.classList.toggle('hidden', !isData);
            displayPane.classList.toggle('hidden', isData);
          }
          tabDataBtn.addEventListener('click', ()=>activate('data'));
          tabDispBtn.addEventListener('click', ()=>activate('disp'));

          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);
          return container;
        }
      });

      new LayersDock().addTo(map);
      onZoom();
      AMA_INIT_DONE = true;
      if (window.AMA_DEBUG) console.log('[AHA] overlays list =', Object.keys(overlays));
      if (window.AMA_DEBUG) console.log('[AMA] base groups:', !!baseAdminGroup);
      if (window.AMA_DEBUG) console.log('[AHA] baseData:', windPath, solarPath, damsPath);
      // --- end custom layers dock ---

      L.control.scale({ metric:true, imperial:false }).addTo(map);

      if (L.Control && L.Control.geocoder) {
        const geocoder = L.Control.geocoder({ defaultMarkGeocode:false }).addTo(map);
        geocoder.on('markgeocode', e => {
          const center = e.geocode.center;
          const name = e.geocode.name;
          safeClearGroup(searchLayer);
          searchLayer.addLayer(L.circleMarker(center, {
            radius: 7, color: '#22d3ee', weight: 2, fillColor: '#22d3ee', fillOpacity: 1
          }).bindTooltip(name, {direction:'top', offset:[0,-10]}));
          if (e.geocode.bbox) {
            map.fitBounds(e.geocode.bbox);
          } else {
            map.setView(center, 14);
          }
        });
      }

      // اگر لایه گاز موجود است، جلوه‌های اضافه اعمال شود
      const gasLayer = gasTransmissionLayer;
      const gasEffects = L.layerGroup();
      if (gasLayer) {
        const halo = L.geoJSON(gasLayer.toGeoJSON(), { style:{ color:'#ffe0d6', weight:8, opacity:1 } });
        gasEffects.addLayer(halo);
      gasLayer.bringToFront();

      if (L && L.polylineDecorator && L.Symbol && L.Symbol.arrowHead) {
        gasEffects.addLayer(L.polylineDecorator(gasLayer, {
          patterns: [{ offset: 0, repeat: '80px',
            symbol: L.Symbol.arrowHead({ pixelSize: 8, pathOptions: { color: '#ef476f', weight: 1 }})
          }]
        }));
      }

      if (typeof turf !== 'undefined') {
        try{
          const unioned = gasLayer.toGeoJSON().features.reduce((acc,f)=> acc? turf.union(acc,f) : f, null);
          const distancesKm = [10,30,50];
          let prev = null;
          distancesKm.forEach((km,i)=>{
            const b = turf.buffer(unioned, km, {units:'kilometers'});
            const ring = prev ? turf.difference(b, prev) : b;
            prev = b;
            if(ring) gasEffects.addLayer(L.geoJSON(ring, { style:{ fillColor:'#ffd0cc', fillOpacity:0.25, color:'#e06b5f', weight:1 } }));
          });
        }catch(e){ /* اگر Turf در دسترس نبود یا داده نبود، سکوت */ }
      }

      if (map.hasLayer(gasLayer)) gasEffects.addTo(map);
      map.on('layeradd', e => { if (e.layer === gasLayer) gasEffects.addTo(map); });
      map.on('layerremove', e => { if (e.layer === gasLayer) safeRemoveLayer(map, gasEffects); });
    }

    window.__AMA__combined = combined;
    window.__AMA__windSitesFC = windSitesGeo || {};
    window.__AMA__boundary = boundary || null;
    __amaHealthReport(map);
    map.on('layeradd', e => {
      if (e.layer === boundary || e.layer === window.windSitesLayer || e.layer === window.windChoroplethLayer) {
        __amaHealthReport(map);
      }
    });

    document.getElementById('info').innerHTML = 'همه‌ی لایه‌ها بارگذاری شدند.';
  })().catch(()=>{ /* بدون خطا روی UI */ });

  function __amaHealthReport(mapCtx){
    if (!window.AMA_DEBUG) return;
    const h = {};
    try { h.manifest_loaded = !!(window.__LAYER_MANIFEST && window.__LAYER_MANIFEST.size); } catch(_) { h.manifest_loaded = false; }
    try { h.manifest_files = window.__LAYER_MANIFEST ? Array.from(window.__LAYER_MANIFEST) : []; } catch(_) { h.manifest_files = []; }
    try { h.counties_features = (window.__AMA__combined?.features?.length) || 0; } catch(_) { h.counties_features = 0; }
    try { h.wind_sites_features = (window.__AMA__windSitesFC?.features?.length) || 0; } catch(_) { h.wind_sites_features = 0; }
    try { h.boundary_layer = !!window.__AMA__boundary; } catch(_) { h.boundary_layer = false; }
    try { h.points_layer_present = !!window.windSitesLayer; } catch(_) { h.points_layer_present = false; }
    try { h.points_layer_on_map = h.points_layer_present && mapCtx && mapCtx.hasLayer(window.windSitesLayer); } catch(_) { h.points_layer_on_map = false; }
    try { h.panes = mapCtx ? Object.keys(mapCtx._panes||{}) : []; } catch(_) { h.panes = []; }
    try { h.zoom = mapCtx ? mapCtx.getZoom() : null; } catch(_) { h.zoom = null; }
    console.group('%cAMA · Health','color:#0bf'); console.table(h); console.groupEnd();
  }
  window.__amaHealthReport = __amaHealthReport;

  // === Persona mode chips (owner/edu/invest/ind) ===
  (function(){
    // ابزار فرمت عدد: 12345.6 -> "۱۲٬۳۴۶"
    function toFaDigits(str){ return String(str).replace(/[0-9]/g, d=>'۰۱۲۳۴۵۶۷۸۹'[+d]); }
    function fmtNumberFa(n, {digits=0}={}) {
      const x = isFinite(+n) ? (+n).toFixed(digits) : '0';
      const parts = x.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'٬');
      return toFaDigits(parts.join(parts[1] ? '٫' : ''));
    }
    window.__AMA_fmtNumberFa = fmtNumberFa;

    const modes = [
      {id:'owner',  icon:'👤', label:'شهروند'},
      {id:'edu',    icon:'🎓', label:'یادگیری'},
      {id:'invest', icon:'💼', label:'سرمایه‌گذار'},
      {id:'ind',    icon:'🏭', label:'صنعت'},
    ];
    let currentMode = localStorage.getItem('ama-mode') || 'owner';

    const ctl = L.control({position:'topleft'});
    ctl.onAdd = function() {
      const div = L.DomUtil.create('div','ama-modes');
      div.innerHTML = modes.map(m=>
        `\n      <button class="chip ${m.id===currentMode?'active':''}" data-mode="${m.id}" title="${m.label}">\n        <span class="i">${m.icon}</span><span class="l">${m.label}</span>\n      </button>`).join('');
      L.DomEvent.disableClickPropagation(div);
      div.querySelectorAll('.chip').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          currentMode = btn.getAttribute('data-mode');
          if (window.AMA_DEBUG) console.log('[ama:mode]', currentMode);
          localStorage.setItem('ama-mode', currentMode);
          div.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active', b===btn));
          applyMode();
        });
      });
      return div;
    };
    ctl.addTo(map);

      function applyMode(){
        const wantTop = (currentMode==='invest' || currentMode==='ind');
        // Top-10 control
        if (wantTop) {
          if (window.__AMA_topPanel && !window.__AMA_topPanel._map) window.__AMA_topPanel.addTo(map);
          window.__AMA_renderTop10?.();
        } else {
          if (window.__AMA_topPanel && window.__AMA_topPanel._map) map.removeControl(window.__AMA_topPanel);
        }
        const _re = window.reevaluateLegendPosition || window.reEvaluateLegendPosition;
        if (typeof _re === 'function') { try { _re(); } catch(_){} }

      }

      function resetAll(){
        if(boundary?.getBounds) map.fitBounds(boundary.getBounds(), {padding:[12,12]});
        else map.setView([36.3,59.6],7);

        currentMode = 'owner';
        localStorage.setItem('ama-mode', currentMode);
        const modeDiv = ctl.getContainer ? ctl.getContainer() : null;
        modeDiv?.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active', b.dataset.mode==='owner'));
        applyMode();

        window.legend?.reset?.();
        safeClearGroup(searchLayer);
        currentSort.key='P0'; currentSort.dir='desc';
        window.__AMA_renderTop10?.();
      }

      applyMode();

      // === Tool Dock ===
      function makePanel(title, bodyHtml){
        const ctl = L.control({position:'topleft'});
        ctl.onAdd = function(){
          const wrap=L.DomUtil.create('div','ama-panel map-panel');
          wrap.innerHTML=`<div class="ama-panel-hd">${title}<button class="close-btn" aria-label="بستن">×</button></div><div class="ama-panel-bd">${bodyHtml}</div>`;
          const close=wrap.querySelector('.close-btn');
          close.onclick=()=>{ map.removeControl(ctl); };
          wrap.addEventListener('keydown',e=>{ if(e.key==='Escape'){ map.removeControl(ctl); }});
          L.DomEvent.disableClickPropagation(wrap);
          return wrap;
        };
        return ctl;
      }

      const panels={
        layers: makePanel('لایه‌ها','<div id="ama-layer-panel"></div>'),
        tools: makePanel('ابزارها','<div id="ama-tools-panel"></div>'),
        download: makePanel('دانلود','<button id="ama-dl-csv">دانلود CSV</button>')
      };

      const dockCtl=L.control({position:'topleft'});
      dockCtl.onAdd=function(){
        const div=L.DomUtil.create('div','tool-dock map-panel');
        div.innerHTML=`<button class="dock-btn" data-panel="layers" aria-label="لایه‌ها">🗂</button>
        <button class="dock-btn" data-panel="tools" aria-label="ابزارها">🛠</button>
        <button class="dock-btn" data-panel="download" aria-label="دانلود">⬇</button>
        <button class="dock-btn dock-reset" data-action="reset" aria-label="بازنشانی">↺</button>`;
        return div;
      };
      dockCtl.addTo(map);
      const dockEl=dockCtl.getContainer();
      dockEl.querySelectorAll('button[data-panel]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const key=btn.dataset.panel; const p=panels[key];
          if(!p._map) p.addTo(map); else map.removeControl(p);
        });
      });
      dockEl.querySelector('button[data-action="reset"]').addEventListener('click',e=>{e.preventDefault(); resetAll();});

      panels.layers.onAdd = (function(orig){ return function(){ const wrap=orig.call(this); const body=wrap.querySelector('.ama-panel-bd'); body.innerHTML='<label><input type="checkbox" data-layer="wind" checked/> لایه باد</label><label><input type="checkbox" data-layer="sites" checked/> سایت‌ها</label>'; body.querySelectorAll('input[data-layer]').forEach(ch=>{ ch.addEventListener('change',()=>{ const lay=ch.dataset.layer; const LAY = lay==='wind'?window.windChoroplethLayer:window.windSitesLayer; if(LAY){ if(ch.checked) map.addLayer(LAY); else safeRemoveLayer(map, LAY);} });}); return wrap; }; })(panels.layers.onAdd);
      panels.download.onAdd = (function(orig){ return function(){ const wrap=orig.call(this); const btn=wrap.querySelector('#ama-dl-csv'); btn?.addEventListener('click',()=>{ const rows=polysFC.features.map(f=>f.properties); const csv=makeTopCSV(rows); downloadBlob('kpi.csv',csv); }); return wrap; }; })(panels.download.onAdd);
    })();
}

async function ama_bootstrap(){
  if (window.__AMA_BOOTSTRAPPED || window.__AMA_BOOTING) return;
  window.__AMA_BOOTING = true;
  const t0 = performance.now?performance.now():Date.now();

  await new Promise(r=>{
    if (document.readyState!=='loading') r(); else
      document.addEventListener('DOMContentLoaded', r, {once:true});
  });

  const manifestUrl1 = normalizeDataPath('layers.config.json') + '?v=' + (window.__BUILD_ID || Date.now());
  const manifestUrl2 = '/amaayesh/layers.config.json?v=' + (window.__BUILD_ID || Date.now());
  let manifestUrl = manifestUrl1;
  if (window.AMA_DEBUG) console.log('[AMA] manifest path', manifestUrl);
  let manifest = await fetch(manifestUrl1).then(r=>r.ok ? r.json() : null).catch(_=>null);
  if(!manifest){
    manifestUrl = manifestUrl2;
    manifest = await fetch(manifestUrl2).then(r=>r.ok ? r.json() : null).catch(_=>null);
  }
  const pathsResolved = resolvePathsFromManifest(manifest);
  if (window.AMA_DEBUG) console.log('[AMA] paths', pathsResolved);

  window.__LAYER_MANIFEST_JSON = manifest;
  window.__LAYER_MANIFEST_URL = manifestUrl;
  window.__AMA_BASE_PATHS = pathsResolved;

  async function safeLoad(p){ return p ? await getJSONwithFallback(p) : null; }
  const [countiesFC, provinceFC, windFC, solarFC, damsFC] = await Promise.all([
    safeLoad(pathsResolved.counties),
    safeLoad(pathsResolved.province),
    safeLoad(pathsResolved.wind),
    safeLoad(pathsResolved.solar),
    safeLoad(pathsResolved.dams),
  ]);

  // سبک پایه برای نقاط
  function pointStyle(kind){
    return { radius: 4, weight: 1, opacity: 1, fillOpacity: 0.7 };
  }

  // ساخت لایه GeoJSON با circleMarker
  function asCircleLayer(gj, kind){
    if (!gj) return null;
    return L.geoJSON(gj, {
      pointToLayer: (_f, latlng)=> L.circleMarker(latlng, pointStyle(kind))
    });
  }

  // افزودن ایمن به رجیستری بدون مارکر آیکنی
  function setPointGroup(key, gj){
    const grp = AMA.G[key]; if (!grp) return;
    grp.clearLayers();
    const lyr = asCircleLayer(gj, key); if (lyr) grp.addLayer(lyr);
  }

  function addPolyGroup(key, gj){
    if(!gj) return;
    const style = key==='province'
      ? { color:'#6b7280', weight:2, opacity:0.8, fillOpacity:0 }
      : { color:'#111',    weight:2, opacity:1,   fillOpacity:0 };
    const layer = L.geoJSON(gj, { style: () => style });
    AMA.G[key].clearLayers();
    AMA.G[key].addLayer(layer);
  }

  addPolyGroup('counties', countiesFC);
  addPolyGroup('province', provinceFC);
  setPointGroup('wind', windFC);
  setPointGroup('solar', solarFC);
  setPointGroup('dams', damsFC);

  function coerceMarkersToCircles(groupKey){
    const grp = AMA.G[groupKey]; if (!grp) return;
    const toAdd = [], toRemove = [];
    grp.eachLayer(l=>{
      if (l instanceof L.GeoJSON){
        l.eachLayer(inn=>{
          if (inn instanceof L.Marker && typeof inn.getLatLng==='function'){
            const ll = inn.getLatLng();
            toRemove.push(inn);
            toAdd.push(L.circleMarker(ll, pointStyle(groupKey)));
          }
        });
      } else if (l instanceof L.Marker && typeof l.getLatLng==='function'){
        const ll = l.getLatLng();
        toRemove.push(l);
        toAdd.push(L.circleMarker(ll, pointStyle(groupKey)));
      }
    });
    toRemove.forEach(x=> grp.removeLayer(x));
    toAdd.forEach(x=> grp.addLayer(x));
  }

  ['wind','solar','dams'].forEach(k=>{ coerceMarkersToCircles(k); });
  setTimeout(()=> ['wind','solar','dams'].forEach(k=> coerceMarkersToCircles(k)), 0);

  window.__countiesGeoAll = countiesFC || { type:'FeatureCollection', features:[] };
  window.__combinedGeo = provinceFC;
  if (window.AMA_DEBUG) console.log('[AHA] all-counties.features =', (countiesFC?.features||[]).length);

  const map = window.__AMA_MAP || AMA.map || L.map('map', {
    preferCanvas: true,
    zoomControl: false,
    touchZoom: true,
    dragging: true
  });
  window.__AMA_MAP = map;
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  if (map.attributionControl && typeof map.attributionControl.setPosition === 'function') {
    map.attributionControl.setPosition('bottomleft');
  }
  map.setView([36.3,59.6],7);

  map.on('click', e => {
    trackAnalyticsEvent('map_click', { lat: e.latlng.lat, lng: e.latlng.lng });
  });

map.createPane('polygons');  setClass(map.getPane('polygons'), ['z-400']);
map.createPane('points');    setClass(map.getPane('points'), ['z-500']);
map.createPane('boundary');  setClass(map.getPane('boundary'), ['z-650']);
  if (window.AMA_DEBUG) console.log('[AHA] panes zIndex=', {
    polygons: getComputedStyle(map.getPane('polygons')).zIndex,
    points:   getComputedStyle(map.getPane('points')).zIndex,
    boundary: getComputedStyle(map.getPane('boundary')).zIndex
  });

  const canvasRenderer = L.canvas({padding:0.5});
  window.__AMA_canvasRenderer = canvasRenderer;

  const _rm = map.removeLayer.bind(map);
  map.removeLayer = (lyr) => {
    if (lyr?.__AMA_PROTECTED && !lyr.__AMA_ALLOW_REPLACE) {
      if (window.AMA_DEBUG) console.warn('[AMA] blocked remove on protected layer');
      return map;
    }
    return _rm(lyr);
  };

  enforceDefaultVisibility(map);
  setTimeout(()=>enforceDefaultVisibility(map), 0);
  if (window.AMA && AMA.initPanelDirectWire) AMA.initPanelDirectWire();

  await __refreshBoundary(map, { keepOld:false });

  const b1 = (countiesFC && L.geoJSON(countiesFC).getBounds()) || null;
  const b2 = (provinceFC && L.geoJSON(provinceFC).getBounds()) || null;
  let bounds = b1 || b2;
  if (b1 && b2) { try { bounds = b1.extend(b2); } catch(_){} }
  if (bounds && bounds.isValid && bounds.isValid()) map.fitBounds(bounds);
  else console.warn('[AMA] no valid bounds; skip fitBounds');
  boundary.setStyle({ className: 'neon-edge' });
  map.on('layeradd overlayadd overlayremove', () => {
    if (boundary?.bringToFront) boundary.bringToFront();
  });

  window.__AMA_COUNTS = {
    counties: (countiesFC?.features||[]).length,
    province: (provinceFC?.features||[]).length,
    wind: (windFC?.features||[]).length,
    solar: (solarFC?.features||[]).length,
    dams: (damsFC?.features||[]).length,
  };

  window.__dumpAmaState = function(){
    const info = {
      manifestUrl,
      baseData: manifest?.baseData || null,
      paths: window.__AMA_BASE_PATHS,
      counts: window.__AMA_COUNTS,
    };
    if (window.AMA_DEBUG) console.log('[AMA] dump', info);
    return info;
  };

  await buildOverlaysAfterBoundary(pathsResolved);

  window.__AMA_BOOTSTRAPPED = true;
  window.__AMA_BOOTING = false;
  if (window.AMA_DEBUG) {
    const t1 = performance.now?performance.now():Date.now();
    console.log('[AMA] bootstrap done in', Math.round(t1-t0),'ms');
  }
}

ama_bootstrap();

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('ama-top-dock');
  const btn = document.getElementById('infoToggle');
  if (panel && btn) {
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
});
