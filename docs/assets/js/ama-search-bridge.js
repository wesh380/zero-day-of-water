/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  const STEP=150, MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-search]','color:#0ea5e9',...a);
  const warn=(...a)=>console.warn('%c[AMA-search]','color:#f59e0b',...a);

  function norm(s){ return String(s||'').replace(/\u200c/g,'').replace(/[^\w\u0600-\u06FF\s]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase(); }
  function countyName(p){
    const cands = [p?.name, p?.NAME, p?.name_fa, p?.county_fa, p?.county_name_fa, p?.['نام'], p?.['نام شهرستان'], p?.['نام_شهرستان']];
    return cands.find(Boolean)||'';
  }
  function windName(p){
    const cands = [p?.name, p?.site_name, p?.name_fa, p?.title, p?.['نام'], p?.['نام سایت']];
    return cands.find(Boolean)||'';
  }

  function ready(){
    const M = window.__AMA_MAP, map = M && M.map;
    const countiesFC = window.__countiesGeoAll;
    const cl = window.__countiesLayer;
    return !!(map && typeof map.fitBounds==='function' && countiesFC?.features?.length && cl);
  }

  function getCountyFeatures(){
    return (window.__countiesGeoAll?.features || []).slice();
  }
  function getWindFeatures(){
    const fc = (window.__AMA_MAP?.windSitesGeo) || (window.windSitesLayer?.toGeoJSON?.());
    return (fc?.features || []).slice();
  }

  function findCountyByName(name){
    const nq=norm(name); if(!nq) return null;
    return getCountyFeatures().find(f => norm(countyName(f.properties))===nq) || null;
  }
  function focusCountyByName(name){
    try{
      const f = findCountyByName(name); if(!f) return (warn('county not found:', name), false);
      const gj = L.geoJSON(f); const b = gj.getBounds(); gj.remove();
      window.__AMA_MAP.map.fitBounds(b, { padding:[20,20] });
      return true;
    }catch(e){ warn('focusCountyByName error', e); return false; }
  }

  function findWindSiteByName(name){
    const nq=norm(name); if(!nq) return null;
    return getWindFeatures().find(f => norm(windName(f.properties))===nq) || null;
  }
  function focusWindSiteByName(name){
    try{
      const f = findWindSiteByName(name); if(!f) return (warn('wind site not found:', name), false);
      const g = f.geometry, ll = (g?.type==='Point' && g.coordinates) ? [g.coordinates[1], g.coordinates[0]] : null;
      if (ll){ window.__AMA_MAP.map.setView(ll, 11); return true; }
      return false;
    }catch(e){ warn('focusWindSiteByName error', e); return false; }
  }

  function bind(){
    const el = document.getElementById('ama-county-search') || document.getElementById('ama-search');
    if (!el) return warn('search input not found');
    el.addEventListener('keydown', (e)=>{
      if (e.key !== 'Enter') return;
      const q = el.value||'';
      if (focusCountyByName(q)) return;
      focusWindSiteByName(q);
    });
    log('wired:', { total: getCountyFeatures().length, wind: getWindFeatures().length });
  }

  (function wait(){
    if (ready()){ bind(); return; }
    if (performance.now()-t0 > MAX){ warn('timeout waiting for map/data'); return; }
    setTimeout(wait, STEP);
  })();

  // exposed for debugging
  window.__amaSearch = { focusCountyByName, focusWindSiteByName, stats: ()=>({ total: getCountyFeatures().length, wind: getWindFeatures().length }) };
})();

