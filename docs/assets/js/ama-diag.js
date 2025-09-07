;(function(){
  const MAX_MS = 10000, STEP = 300;
  function collect() {
    const map = window.__AMA_MAP || (window.AMA && window.AMA.map) || null;
    const G = (window.AMA && window.AMA.G) || {};
    const keys = Object.keys(G||{});
    const toggles = Array.from(document.querySelectorAll('[data-layer-toggle]'));
    const groups = keys.map(k=>{
      const grp = G[k]; let size = 0;
      if (grp && typeof grp.getLayers==='function') { try{ size = grp.getLayers().length } catch(e){ size = -1 } }
      const on = map && grp ? map.hasLayer(grp) : false;
      return { key:k, layers:size, visible:on };
    });
    const ui = toggles.map(el=>{
      const key = (el.getAttribute('data-layer-toggle')||'').trim();
      return { el: el.tagName.toLowerCase()+'#'+(el.id||''), key, bridged: !!el.__bridged, checked: !!el.checked };
    });
    return { mapReady: !!map, gKeys: keys, groups, ui };
  }
  function logReport(tag, data){
    console.log(`[AMA-DIAG] ${tag}`);
    console.log('mapReady:', data.mapReady);
    console.log('G keys:', data.gKeys);
    console.table(data.groups);
    console.table(data.ui);
    console.table(window.__amaBridgePairs && window.__amaBridgePairs());
  }
  function runDiag(){ const d = collect(); logReport('panel wiring status', d); return d; }
  window.__amaDiag = runDiag;
  const t0 = Date.now();
  (function loop(){
    const d = collect();
    if (d.mapReady && d.gKeys.length) { logReport('ready', d); return; }
    if (d.mapReady && !d.gKeys.length) { logReport('ready(no-registry)', d); return; }
    if (Date.now()-t0 > MAX_MS) { logReport('timeout', d); return; }
    setTimeout(loop, STEP);
  })();
  document.addEventListener('keydown', (e)=>{ if ((e.ctrlKey||e.metaKey)&&e.altKey && e.key.toLowerCase()==='d') window.__amaDiag(); });
})();
