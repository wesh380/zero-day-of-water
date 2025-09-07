/* docs/assets/js/panel-direct-wire.js */
(function AMA_PANEL_WIRE(){
  const STEP=150, T_MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-panel]','color:#22c55e',...a);
  const warn=(...a)=>console.warn('%c[AMA-panel]','color:#f59e0b',...a);

  function getMap(){
    return (window.__AMA_MAP && (window.__AMA_MAP.map || window.__AMA_MAP.leaflet))
        || window.AMA_MAP || window.map || null;
  }
  function normLayers(g){
    if (!g) return [];
    if (Array.isArray(g)) return g.filter(Boolean);
    return [g];
  }
  function getGroupLayers(key){
    const G = window.__AMA_MAP?.groups || {};
    return normLayers(G[key]);
  }
  function isLayerOn(map, lyr){
    try{ return !!(map && typeof map.hasLayer==='function' && lyr && map.hasLayer(lyr)); }catch(e){ return false; }
  }
  function setGroupVisible(key, checked){
    const map=getMap(); if (!map) return;
    getGroupLayers(key).forEach(lyr=>{
      try{
        if (checked && !isLayerOn(map,lyr)) map.addLayer(lyr);
        if (!checked && isLayerOn(map,lyr)) map.removeLayer(lyr);
      }catch(e){}
    });
  }
  function computeDefaultChecked(key){
    const map=getMap(); if (!map) return false;
    const arr=getGroupLayers(key);
    return arr.some(lyr=>isLayerOn(map,lyr));
  }

  function byId(id){ return document.getElementById(id); }

  function wire(){
    const map=getMap();
    const wind = byId('chk-wind-sites');
    const solar= byId('chk-solar-sites');
    const dams = byId('chk-dam-sites');
    if (!map || !wind || !solar || !dams) return warn('map or checkboxes not ready');

    // وضعیت اولیه از روی لایه‌ها
    wind.checked  = computeDefaultChecked('wind');
    solar.checked = computeDefaultChecked('solar');
    dams.checked  = computeDefaultChecked('dams');

    // رخدادها
    wind.addEventListener('change', ()=>setGroupVisible('wind',  wind.checked));
    solar.addEventListener('change',()=>setGroupVisible('solar', solar.checked));
    dams.addEventListener('change', ()=>setGroupVisible('dams',  dams.checked));

    log('wired checkboxes:', {wind:wind.checked, solar:solar.checked, dams:dams.checked});
  }

  (function wait(){
    const ok = !!getMap() && byId('chk-wind-sites') && byId('chk-solar-sites') && byId('chk-dam-sites') && window.__AMA_MAP?.groups;
    if (ok) return wire();
    if (performance.now()-t0 > T_MAX) return warn('timeout waiting for panel/map');
    setTimeout(wait, STEP);
  })();
})();

