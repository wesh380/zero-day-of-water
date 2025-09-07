/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  const STEP = 200, T_MAX = 20000, t0 = performance.now();
  const log  = (...a)=>console.log('%c[AMA-search]','color:#0ea5e9', ...a);
  const warn = (...a)=>console.warn('%c[AMA-search]','color:#f59e0b', ...a);

  // همیشه یک پوسته‌ی جهانی بساز تا تست‌های کنسول خطا ندهند
  if (!window.__amaSearch) window.__amaSearch = {
    index: [],
    get stats(){ return { total:0, counties:0, wind:0, missingCounties:[], missingWind:[] }; },
    focusCountyByName(){ return false; },
    focusWindSiteByName(){ return false; },
    rebuild(){ /* noop until ready */ }
  };

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

  // نام‌خوانی مقاوم
  const countyName = f =>
    f?.properties?.county ?? f?.properties?.COUNTY ?? f?.properties?.name ??
    f?.properties?.NAME ?? f?.properties?.title ?? f?.properties?.نام ?? '';

  const windName = f =>
    f?.properties?.site_name ?? f?.properties?.name ?? f?.properties?.title ??
    f?.properties?.label ?? f?.properties?.نام ?? f?.properties?.site ?? '';

  function getCountyFeatures(){
    if (window.__AMA_MAP?.countiesGeo?.features?.length)
      return window.__AMA_MAP.countiesGeo.features.slice();
    const grp = getGroups().counties?.[0] || window.__AMA_COUNTIES_LAYER;
    if (!grp) return [];
    if (grp.toGeoJSON){
      const gj = grp.toGeoJSON(); return Array.isArray(gj?.features) ? gj.features : [];
    }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); });
    return out;
  }

  function getWindSiteFeatures(){
    if (window.__AMA_MAP?.windSitesGeo?.features?.length)
      return window.__AMA_MAP.windSitesGeo.features.slice();
    const grp = getGroups().wind?.[0] || window.__AMA_WIND_LAYER;
    if (!grp) return [];
    if (grp.toGeoJSON){
      const gj = grp.toGeoJSON(); return Array.isArray(gj?.features) ? gj.features : [];
    }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); });
    return out;
  }

  // های‌لایت و زوم
  let lastHL = null;
  function clearHL(){
    try{
      if (lastHL?.__tempHL && lastHL.remove) lastHL.remove();
      else if (lastHL?.setStyle) lastHL.setStyle({weight:2,color:'#000',fillOpacity:0});
    }catch(e){} lastHL=null;
  }
  function ensureCountiesVisible(){
    const map = getMap();
    const grp = getGroups().counties?.[0] || window.__AMA_COUNTIES_LAYER;
    try{ if (grp && map && typeof map.hasLayer==='function' && !map.hasLayer(grp)) map.addLayer(grp); }catch(e){}
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
      clearHL();
      if (!lyr.__tempHL && lyr.setStyle) lyr.setStyle({weight:3,color:'#0ea5e9',fillOpacity:0.15});
      try{ map.fitBounds(lyr.getBounds(),{padding:[20,20]}); }catch(e){}
      lastHL=lyr;
    }
    return true;
  }
  function focusWindSiteByName(name){
    const nq=normalizeFa(name);
    const f = getWindSiteFeatures().find(ff=>normalizeFa(windName(ff))===nq);
    if(!f){ warn('wind site not found:', name); return false; }
    const map=getMap(); let latlng=null;
    try{
      const g=f.geometry;
      if (g?.type==='Point') latlng=[g.coordinates[1], g.coordinates[0]];
      else if (window.L?.geoJSON){ const gj=L.geoJSON(f); const b=gj.getBounds(); latlng=b.getCenter(); gj.remove(); }
    }catch(e){}
    if (latlng){ try{ map.setView(latlng, Math.max(map.getZoom?.()||10, 11)); }catch(e){} }
    return !!latlng;
  }

  function buildIndex(){
    const idx=[], push=(label,type,f)=>{ const raw=(label??'').toString().trim(); if(!raw) return; idx.push({raw, norm:normalizeFa(raw), type, f}); };
    getCountyFeatures().forEach(f=>push(countyName(f),'county',f));
    getWindSiteFeatures().forEach(f=>push(windName(f),'wind',f));
    return idx;
  }

  function run(){
    const input = document.getElementById('ama-county-search');
    const map = getMap();
    if (!map || !input){ return warn('map or input not found'); }

    let index = buildIndex();

    // Q&A baseline (برای پایش completeness)
    const expectedCounties = ['تایباد','خواف','زاوه','مشهد','نیشابور'].map(normalizeFa);
    const expectedWind = ['البلاغ','باراکوه','تق‌قز سفلی','حصاریزدان','خرگرد','خواف','رهنه','سراب','سنگال‌آباد','سنگان','طرح توسعه چخماق','طرح توسعه کنگ اولیا','عباسی‌آباد','عبدل‌آباد','فهندر','فیندر','قادری‌آباد','مهرآباد','نشتیفان','نصر‌آباد','نوده','کودکان','کوه‌آباد'].map(normalizeFa);
    const have = new Set(index.map(x=>x.norm));
    const missingCounties = expectedCounties.filter(n=>!have.has(n));
    const missingWind     = expectedWind.filter(n=>!have.has(n));
    log('wired:', { total:index.length, counties:index.filter(x=>x.type==='county').length, wind:index.filter(x=>x.type==='wind').length, missingCounties, missingWind });

    // رفتار جستجو
    let deb=null;
    function searchNow(q){
      const nq=normalizeFa(q); if(!nq){ clearHL(); return; }
      const hit = index.find(x=>x.type==='county' && x.norm===nq)
              ||  index.find(x=>x.type==='county' && x.norm.includes(nq))
              ||  index.find(x=>x.norm===nq)
              ||  index.find(x=>x.norm.includes(nq));
      if (!hit) return;
      if (hit.type==='county') focusCountyByName(hit.raw); else focusWindSiteByName(hit.raw);
    }
    input.addEventListener('input', ()=>{ clearTimeout(deb); deb=setTimeout(()=>searchNow(input.value||''), 220); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); searchNow(input.value||''); } if(e.key==='Escape'){ input.value=''; clearHL(); } });

    // API دیباگِ پایدار
    window.__amaSearch = {
      get index(){ return index; },
      focusCountyByName, focusWindSiteByName,
      get stats(){
        return {
          total:index.length,
          counties:index.filter(x=>x.type==='county').length,
          wind:index.filter(x=>x.type==='wind').length,
          missingCounties, missingWind
        };
      },
      rebuild(){ index = buildIndex(); log('reindexed:', { total:index.length }); }
    };

    // اگر داده دیر رسید، خودکار reindex
    const tryReindex = ()=>{
      const c=getCountyFeatures().length, w=getWindSiteFeatures().length;
      if (c+w > index.length) window.__amaSearch.rebuild();
    };
    setTimeout(tryReindex, 800);
    setTimeout(tryReindex, 2000);
  }

  // صبرِ سخت‌گیر تا وقتی واقعا feature داریم
  (function wait(){
    const map = getMap();
    const ready = !!map && (getCountyFeatures().length + getWindSiteFeatures().length) > 0 && document.getElementById('ama-county-search');
    if (ready) return run();
    if (performance.now() - t0 > T_MAX){ return warn('timeout waiting for map/data'); }
    setTimeout(wait, STEP);
  })();
})();

