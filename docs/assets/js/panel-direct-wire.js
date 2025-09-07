/* docs/assets/js/panel-direct-wire.js */
(function AMA_PANEL_WIRE(){
  const STEP=150, T_MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-panel]','color:#22c55e',...a);
  const warn=(...a)=>console.warn('%c[AMA-panel]','color:#f59e0b',...a);

  const getMap=()=> (window.__AMA_MAP && (window.__AMA_MAP.map||window.__AMA_MAP.leaflet)) || null;
  const norm = v => Array.isArray(v)?v.filter(Boolean):(v?[v]:[]);
  const layersOf = k => norm(window.__AMA_MAP?.groups?.[k]);

  const isOn=(map,lyr)=>{ try{ return !!(map && typeof map.hasLayer==='function' && lyr && map.hasLayer(lyr)); }catch(e){ return false; } };
  const setGroup=(k,checked)=>{
    const map=getMap(); if(!map) return;
    layersOf(k).forEach(lyr=>{ try{ if(checked && !isOn(map,lyr)) map.addLayer(lyr); if(!checked && isOn(map,lyr)) map.removeLayer(lyr); }catch(e){} });
  };

  const byId=id=>document.getElementById(id);

  function wire(){
    const map=getMap(), wind=byId('chk-wind-sites'), solar=byId('chk-solar-sites'), dams=byId('chk-dam-sites');
    if(!map||!wind||!solar||!dams) return warn('map or checkboxes not ready');

    // init from current map state
    wind.checked  = layersOf('wind').some(l=>isOn(map,l));
    solar.checked = layersOf('solar').some(l=>isOn(map,l));
    dams.checked  = layersOf('dams').some(l=>isOn(map,l));

    wind.addEventListener('change',()=>setGroup('wind', wind.checked));
    solar.addEventListener('change',()=>setGroup('solar', solar.checked));
    dams.addEventListener('change',()=>setGroup('dams',  dams.checked));

    log('wired checkboxes:',{wind:wind.checked, solar:solar.checked, dams:dams.checked});
  }

  (function wait(){
    const ok = !!getMap() && window.__AMA_MAP?.groups && byId('chk-wind-sites') && byId('chk-solar-sites') && byId('chk-dam-sites');
    if(ok) return wire();
    if(performance.now()-t0 > T_MAX) return warn('timeout waiting for panel/map');
    setTimeout(wait, STEP);
  })();
})();

