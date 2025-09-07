/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  const STEP=200, T_MAX=20000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-search]','color:#0ea5e9',...a);
  const warn=(...a)=>console.warn('%c[AMA-search]','color:#f59e0b',...a);

  if(!window.__amaSearch) window.__amaSearch = {
    index:[], get stats(){return {total:0,counties:0,wind:0,missingCounties:[],missingWind:[]}},
    focusCountyByName(){return false;}, focusWindSiteByName(){return false;}, rebuild(){/*noop*/}
  };

  const NFA=s=>String(s||'')
    .replace(/\u200c/g,' ')
    .replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[ۀة]/g,'ه')
    .replace(/\s+/g,' ').trim().toLowerCase();

  const getMap = ()=> (window.__AMA_MAP && (window.__AMA_MAP.map||window.__AMA_MAP.leaflet)) || null;
  const groups = ()=> window.__AMA_MAP?.groups || {};

  const countyName=f=> f?.properties?.county ?? f?.properties?.COUNTY ?? f?.properties?.name ?? f?.properties?.NAME ?? f?.properties?.title ?? f?.properties?.نام ?? '';
  const windName  =f=> f?.properties?.site_name ?? f?.properties?.name ?? f?.properties?.title ?? f?.properties?.label ?? f?.properties?.نام ?? f?.properties?.site ?? '';

  function featuresFromGroup(key, rawFC){
    if (rawFC?.features?.length) return rawFC.features.slice();
    const grp = groups()[key]?.[0] || (key==='counties'?window.__AMA_COUNTIES_LAYER:window.__AMA_WIND_LAYER);
    if (!grp) return [];
    if (grp.toGeoJSON){ const gj=grp.toGeoJSON(); return Array.isArray(gj?.features)?gj.features:[]; }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); });
    return out;
  }

  const countyFeatures = ()=> featuresFromGroup('counties', window.__AMA_MAP?.countiesGeo);
  const windFeatures   = ()=> featuresFromGroup('wind',     window.__AMA_MAP?.windSitesGeo);

  let lastHL=null;
  function clearHL(){ try{ if(lastHL?.__tempHL&&lastHL.remove) lastHL.remove(); else if(lastHL?.setStyle) lastHL.setStyle({weight:2,color:'#000',fillOpacity:0}); }catch(e){} lastHL=null; }
  function ensureCountiesVisible(){ const map=getMap(), grp=groups().counties?.[0]||window.__AMA_COUNTIES_LAYER; try{ if(map&&grp&&typeof map.hasLayer==='function'&&!map.hasLayer(grp)) map.addLayer(grp); }catch(e){} return grp; }
  function findLayerForFeature(grp,f){ if(!grp?.eachLayer) return null; let found=null; grp.eachLayer(l=>{ if(!found && l?.feature===f) found=l; }); return found; }

  function focusCountyByName(name){
    const nq=NFA(name); const f=countyFeatures().find(ff=>NFA(countyName(ff))===nq);
    if(!f){ warn('county not found:',name); return false; }
    const map=getMap(), grp=ensureCountiesVisible(); let lyr=findLayerForFeature(grp,f);
    if(!lyr && window.L?.geoJSON){ lyr=L.geoJSON(f,{style:{weight:3,color:'#0ea5e9',fillOpacity:0.15}}); lyr.__tempHL=true; lyr.addTo(map); }
    if(lyr){ clearHL(); if(!lyr.__tempHL && lyr.setStyle) lyr.setStyle({weight:3,color:'#0ea5e9',fillOpacity:0.15}); try{ map.fitBounds(lyr.getBounds(),{padding:[20,20]}); }catch(e){} lastHL=lyr; }
    return true;
  }

  function focusWindSiteByName(name){
    const nq=NFA(name); const f=windFeatures().find(ff=>NFA(windName(ff))===nq);
    if(!f){ warn('wind site not found:',name); return false; }
    const map=getMap(); let latlng=null; try{
      const g=f.geometry; if(g?.type==='Point') latlng=[g.coordinates[1],g.coordinates[0]];
      else if(window.L?.geoJSON){ const gj=L.geoJSON(f); const b=gj.getBounds(); latlng=b.getCenter(); gj.remove(); }
    }catch(e){}
    if(latlng){ try{ map.setView(latlng, Math.max(map.getZoom?.()||10, 11)); }catch(e){} }
    return !!latlng;
  }

  function buildIndex(){
    const idx=[], push=(label,type,f)=>{ const raw=(label??'').toString().trim(); if(!raw) return; idx.push({raw, norm:NFA(raw), type, f}); };
    countyFeatures().forEach(f=>push(countyName(f),'county',f));
    windFeatures().forEach(f=>push(windName(f),'wind',f));
    return idx;
  }

  function run(){
    const input=document.getElementById('ama-county-search'), map=getMap();
    if(!map||!input) return warn('map or input not found');

    let index=buildIndex();

    // baseline Q&A (۵ شهرستان + نام سایت‌های بادی)
    const expectedCounties=['تایباد','خواف','زاوه','مشهد','نیشابور'].map(NFA);
    const expectedWind=['البلاغ','باراکوه','تق‌قز سفلی','حصاریزدان','خرگرد','خواف','رهنه','سراب','سنگال‌آباد','سنگان','طرح توسعه چخماق','طرح توسعه کنگ اولیا','عباسی‌آباد','عبدل‌آباد','فهندر','فیندر','قادری‌آباد','مهرآباد','نشتیفان','نصر‌آباد','نوده','کودکان','کوه‌آباد'].map(NFA);
    const have=new Set(index.map(x=>x.norm));
    const missingCounties=expectedCounties.filter(n=>!have.has(n));
    const missingWind=expectedWind.filter(n=>!have.has(n));
    log('wired:',{ total:index.length, counties:index.filter(x=>x.type==='county').length, wind:index.filter(x=>x.type==='wind').length, missingCounties, missingWind });

    let deb=null;
    function searchNow(q){
      const nq=NFA(q); if(!nq){ clearHL(); return; }
      const hit=index.find(x=>x.type==='county'&&x.norm===nq)
             || index.find(x=>x.type==='county'&&x.norm.includes(nq))
             || index.find(x=>x.norm===nq)
             || index.find(x=>x.norm.includes(nq));
      if(!hit) return;
      if(hit.type==='county') focusCountyByName(hit.raw); else focusWindSiteByName(hit.raw);
    }
    input.addEventListener('input',()=>{ clearTimeout(deb); deb=setTimeout(()=>searchNow(input.value||''),220); });
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); searchNow(input.value||''); } if(e.key==='Escape'){ input.value=''; clearHL(); } });

    window.__amaSearch={
      get index(){return index;},
      focusCountyByName, focusWindSiteByName,
      get stats(){ return { total:index.length, counties:index.filter(x=>x.type==='county').length, wind:index.filter(x=>x.type==='wind').length, missingCounties, missingWind }; },
      rebuild(){ index=buildIndex(); log('reindexed:',{total:index.length}); }
    };

    // late re-index if data arrives after
    const tryReindex=()=>{ const c=countyFeatures().length, w=windFeatures().length; if(c+w>index.length) window.__amaSearch.rebuild(); };
    setTimeout(tryReindex,800); setTimeout(tryReindex,2000);
  }

  (function wait(){
    const ready = !!getMap() && (countyFeatures().length + windFeatures().length) > 0 && document.getElementById('ama-county-search');
    if(ready) return run();
    if(performance.now()-t0 > T_MAX) return warn('timeout waiting for map/data');
    setTimeout(wait, STEP);
  })();
})();

