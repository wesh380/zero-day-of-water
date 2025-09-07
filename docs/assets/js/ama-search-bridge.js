/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  // ---------------- helpers ----------------
  const STEP=150, T_MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-search]', 'color:#0ea5e9', ...a);
  const warn=(...a)=>console.warn('%c[AMA-search]', 'color:#f59e0b', ...a);

  function normalizeFa(s=''){
    return String(s).replace(/\u200c/g,' ')
      .replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[ۀة]/g,'ه')
      .replace(/\s+/g,' ').trim().toLowerCase();
  }
  function getMap(){
    return (window.__AMA_MAP && (window.__AMA_MAP.map || window.__AMA_MAP.leaflet))
        || window.AMA_MAP || window.map || null;
  }
  function getGroups(){ return window.__AMA_MAP?.groups || {}; }

  // --- منابع داده طبق Q&A ---
  function getCountyFeatures(){
    if (window.__AMA_MAP?.countiesGeo?.features?.length)
      return window.__AMA_MAP.countiesGeo.features.slice();
    const grp = getGroups().counties?.[0] || window.__AMA_COUNTIES_LAYER;
    if (!grp) return [];
    if (grp.toGeoJSON) {
      const gj=grp.toGeoJSON(); return Array.isArray(gj?.features)? gj.features: [];
    }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); }); return out;
  }
  function getWindSiteFeatures(){
    if (window.__AMA_MAP?.windSitesGeo?.features?.length)
      return window.__AMA_MAP.windSitesGeo.features.slice();
    const grp = getGroups().wind?.[0] || window.__AMA_WIND_LAYER;
    if (!grp) return [];
    if (grp.toGeoJSON) {
      const gj=grp.toGeoJSON(); return Array.isArray(gj?.features)? gj.features: [];
    }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); }); return out;
  }

  // --- خواندن نام‌ها ---
  const countyName = f => (f?.properties?.county || f?.properties?.NAME || f?.properties?.name || f?.properties?.title || '');
  const windName   = f => (f?.properties?.site_name || f?.properties?.name || f?.properties?.title || f?.properties?.label || '');

  // --- های‌لایت/زوم ---
  let lastHL=null;
  function clearHL(){
    try{
      if (lastHL?.__tempHL && lastHL.remove) lastHL.remove();
      else if (lastHL?.setStyle) lastHL.setStyle({weight:2,color:'#000',fillOpacity:0});
    }catch(e){}
    lastHL=null;
  }
  function ensureCountiesVisible(){
    const map=getMap();
    const grp = getGroups().counties?.[0] || window.__AMA_COUNTIES_LAYER;
    try{ if (grp && map && !map.hasLayer(grp)) map.addLayer(grp); }catch(e){}
    return grp;
  }
  function findLayerForFeature(grp,f){
    if (!grp?.eachLayer) return null;
    let found=null; grp.eachLayer(l=>{ if(!found && l?.feature===f) found=l; });
    return found;
  }
  function focusCountyByName(name){
    const nq=normalizeFa(name);
    const f = getCountyFeatures().find(ff=>normalizeFa(countyName(ff))===nq);
    if(!f){ warn('county not found:', name); return false; }
    const map=getMap(); const grp=ensureCountiesVisible();
    let lyr=findLayerForFeature(grp,f);
    if (!lyr && window.L?.geoJSON){ lyr=L.geoJSON(f,{style:{weight:3,color:'#0ea5e9',fillOpacity:0.15}}); lyr.__tempHL=true; lyr.addTo(map); }
    if (lyr){
      clearHL(); if (!lyr.__tempHL && lyr.setStyle) lyr.setStyle({weight:3,color:'#0ea5e9',fillOpacity:0.15}); lastHL=lyr;
      try{ map.fitBounds(lyr.getBounds(),{padding:[20,20]}); }catch(e){}
    }
    return true;
  }
  function focusWindSiteByName(name){
    const nq=normalizeFa(name);
    const f = getWindSiteFeatures().find(ff=>normalizeFa(windName(ff))===nq);
    if(!f){ warn('wind site not found:', name); return false; }
    const map=getMap();
    let latlng=null;
    try{
      const g=f.geometry;
      if (g?.type==='Point') latlng=[g.coordinates[1], g.coordinates[0]];
      else {
        const gj=window.L?.geoJSON && L.geoJSON(f);
        if (gj){ const b=gj.getBounds(); latlng=b.getCenter(); gj.remove(); }
      }
    }catch(e){}
    if (latlng) { try{ map.setView(latlng, Math.max(map.getZoom(), 11)); }catch(e){} }
    return !!latlng;
  }

  // --- ایندکس ترکیبی (county + wind) ---
  function buildIndex(){
    const idx=[];
    const push=(label,type,feature)=>{
      const raw=String(label||'').trim(); if(!raw) return;
      idx.push({raw, norm:normalizeFa(raw), type, f:feature});
    };
    const counties=getCountyFeatures();  counties.forEach(f=>{ const n=countyName(f); push(n,'county',f); if(window.AMA_ALIASES && Array.isArray(window.AMA_ALIASES[n])){ window.AMA_ALIASES[n].forEach(a=>push(a,'county',f)); }});
    const winds   =getWindSiteFeatures();winds.forEach(f=>push(windName(f),'wind',f));
    return idx;
  }

  function run(){
    const map=getMap();
    const input=document.getElementById('ama-county-search');
    if(!map || !input){ warn('map or input not found'); return; }

    // ایندکس طبق Q&A
    const index=buildIndex();

    // چکِ «انتظار Q&A»
    const expectedCounties=['تایباد','خواف','زاوه','مشهد','نیشابور'].map(normalizeFa);
    const expectedWindSites=[
      'البلاغ','باراکوه','تق‌قز سفلی','حصاریزدان','خرگرد','خواف','رهنه','سراب','سنگال‌آباد','سنگان',
      'طرح توسعه چخماق','طرح توسعه کنگ اولیا','عباسی‌آباد','عبدل‌آباد','فهندر','فیندر','قادری‌آباد',
      'مهرآباد','نشتیفان','نصر‌آباد','نوده','کودکان','کوه‌آباد'
    ].map(normalizeFa);

    const set = new Set(index.map(x=>x.norm));
    const missingCounties = expectedCounties.filter(n=>!set.has(n));
    const missingWind     = expectedWindSites.filter(n=>!set.has(n));

    // اتصال رویدادها
    const hint=document.getElementById('ama-county-search-hint');
    let deb=null;
    function searchNow(q){
      const nq=normalizeFa(q); if(!nq){ clearHL(); if(hint) hint.style.display='none'; return; }
      let hit=index.find(x=>x.type==='county' && x.norm===nq) ||
              index.find(x=>x.type==='county' && x.norm.includes(nq)) ||
              index.find(x=>x.norm===nq) ||
              index.find(x=>x.norm.includes(nq));
      if (!hit){ if(hint){ hint.textContent='یافت نشد'; hint.style.display='block'; } return; }
      if(hint) hint.style.display='none';
      if (hit.type==='county') focusCountyByName(hit.raw);
      else if (hit.type==='wind') focusWindSiteByName(hit.raw);
    }
    input.addEventListener('input', ()=>{ clearTimeout(deb); deb=setTimeout(()=>searchNow(input.value||''),220); });
    input.addEventListener('keydown', e=>{
      if (e.key==='Enter'){ e.preventDefault(); searchNow(input.value||''); }
      if (e.key==='Escape'){ input.value=''; clearHL(); if(hint) hint.style.display='none'; }
    });
    document.getElementById('ama-county-clear')?.addEventListener('click', ()=>{ input.value=''; clearHL(); if(hint) hint.style.display='none'; input.focus(); });

    // حذف/غیرفعال‌سازی کنترل‌های قدیمی که تداخل می‌کنند
    try{
      document.querySelectorAll('.leaflet-control-search,.leaflet-control-geocoder').forEach(n=>n.remove());
    }catch(e){}

    // API دیباگ
    window.__amaSearch = {
      index,
      focusCountyByName, focusWindSiteByName,
      stats: {
        total:index.length,
        counties:index.filter(x=>x.type==='county').length,
        wind:index.filter(x=>x.type==='wind').length,
        missingCounties, missingWind
      }
    };

    log('wired', window.__amaSearch.stats);
    if (missingCounties.length || missingWind.length){
      warn('missing expected items (per Q&A):', {missingCounties, missingWind});
    }
  }

  (function wait(){
    const ready = getMap() && (getCountyFeatures().length>=0) && (getWindSiteFeatures().length>=0);
    if (ready) return run();
    if (performance.now()-t0 > T_MAX){ warn('timeout waiting for map/data'); return; }
    setTimeout(wait, STEP);
  })();
})();
