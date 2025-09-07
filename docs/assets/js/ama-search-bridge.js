/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  const STEP=150, MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-search]','color:#0ea5e9',...a);
  const warn=(...a)=>console.warn('%c[AMA-search]','color:#f59e0b',...a);

  const norm=s=>String(s||'').replace(/\u200c/g,' ').replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[ۀة]/g,'ه').replace(/\s+/g,' ').trim().toLowerCase();

  const countyName=p=> p?.county||p?.NAME||p?.name||p?.title||p?.['نام']||p?.['name:fa']||'';
  const windName  =p=> p?.site_name||p?.name||p?.title||p?.label||p?.['نام']||'';

  function getCountyFeatures(){
    if (window.__countiesGeoAll?.features?.length) return window.__countiesGeoAll.features.slice();
    const grp=window.__AMA_MAP?.groups?.counties?.[0]||window.__countiesLayer;
    if (!grp) return [];
    if (grp.toGeoJSON){ const gj=grp.toGeoJSON(); return Array.isArray(gj?.features)?gj.features:[]; }
    const out=[]; grp.eachLayer?.(l=>{ if(l?.feature) out.push(l.feature); });
    return out;
  }
  function getWindFeatures(){
    const fc=window.__AMA_MAP?.windSitesGeo || window.windSitesLayer?.toGeoJSON?.();
    return Array.isArray(fc?.features)?fc.features.slice():[];
  }

  let index=[];
  function buildIndex(){
    index=[];
    const push=(label,type,f)=>{ const raw=String(label||'').trim(); if(!raw) return; index.push({raw, norm:norm(raw), type, f}); };
    getCountyFeatures().forEach(f=>{
      const name=countyName(f.properties)||''; push(name,'county',f);
      if(window.AMA_ALIASES && window.AMA_ALIASES[name]){
        window.AMA_ALIASES[name].forEach(a=>push(a,'county',f));
      }
    });
    getWindFeatures().forEach(f=>{ const name=windName(f.properties)||''; push(name,'wind',f); });
  }

  function stats(){
    return {
      total:index.length,
      counties:index.filter(x=>x.type==='county').length,
      wind:index.filter(x=>x.type==='wind').length
    };
  }

  let lastHL=null;
  function clearHL(){
    try{
      if(lastHL?.__tempHL && lastHL.remove) lastHL.remove();
      else if(lastHL?.setStyle) lastHL.setStyle({weight:2,color:'#000',fillOpacity:0});
    }catch(e){}
    lastHL=null;
  }
  function ensureCountiesVisible(){
    const map=getMap();
    const grp=window.__AMA_MAP?.groups?.counties?.[0]||window.__countiesLayer;
    try{ if(grp && map && !map.hasLayer(grp)) map.addLayer(grp); }catch(e){}
    return grp;
  }
  function findLayerForFeature(grp,f){ if(!grp?.eachLayer) return null; let found=null; grp.eachLayer(l=>{ if(!found && l?.feature===f) found=l; }); return found; }

  function focusCountyByName(name){
    const nq=norm(name); const f=index.find(x=>x.type==='county'&&x.norm===nq)?.f; if(!f){ warn('county not found:',name); return false; }
    const map=getMap(); const grp=ensureCountiesVisible();
    let lyr=findLayerForFeature(grp,f);
    if(!lyr && window.L?.geoJSON){ lyr=L.geoJSON(f,{style:{weight:3,color:'#0ea5e9',fillOpacity:0.15}}); lyr.__tempHL=true; lyr.addTo(map); }
    if(lyr){ clearHL(); if(!lyr.__tempHL&&lyr.setStyle) lyr.setStyle({weight:3,color:'#0ea5e9',fillOpacity:0.15}); try{ map.fitBounds(lyr.getBounds(),{padding:[20,20]}); }catch(e){} lastHL=lyr; }
    return true;
  }
  function focusWindSiteByName(name){
    const nq=norm(name); const f=index.find(x=>x.type==='wind'&&x.norm===nq)?.f; if(!f){ warn('wind site not found:',name); return false; }
    const map=getMap(); let ll=null;
    try{
      const g=f.geometry; if(g?.type==='Point') ll=[g.coordinates[1],g.coordinates[0]]; else if(window.L?.geoJSON){ const gj=L.geoJSON(f); const b=gj.getBounds(); ll=b.getCenter(); gj.remove(); }
    }catch(e){}
    if(ll){ try{ map.setView(ll, Math.max(map.getZoom?.()||10,11)); }catch(e){} }
    return !!ll;
  }

  function bind(){
    const el=document.getElementById('ama-county-search')||document.getElementById('ama-search');
    if(!el) return warn('search input not found');
    let deb=null;
    function searchNow(q){
      const nq=norm(q); if(!nq){ clearHL(); return; }
      const hit=index.find(x=>x.type==='county'&&x.norm===nq) || index.find(x=>x.type==='county'&&x.norm.includes(nq)) || index.find(x=>x.norm===nq) || index.find(x=>x.norm.includes(nq));
      if(!hit) return;
      if(hit.type==='county') focusCountyByName(hit.raw); else focusWindSiteByName(hit.raw);
    }
    el.addEventListener('input',()=>{ clearTimeout(deb); deb=setTimeout(()=>searchNow(el.value||''),220); });
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); searchNow(el.value||''); } if(e.key==='Escape'){ el.value=''; clearHL(); } });
    document.getElementById('ama-county-clear')?.addEventListener('click',()=>{ el.value=''; clearHL(); el.focus(); });
    log('wired:', stats());
  }

  function ready(){ return getMap() && getCountyFeatures().length>0; }
  function getMap(){ return (window.__AMA_MAP && (window.__AMA_MAP.map||window.__AMA_MAP.leaflet)) || null; }

  function init(){ buildIndex(); bind(); }

  (function wait(){
    if(ready()){ init(); return; }
    if(performance.now()-t0 > MAX){ warn('timeout waiting for map/data'); return; }
    setTimeout(wait, STEP);
  })();

  window.__amaSearch={ stats:()=>stats(), rebuild:()=>{ buildIndex(); }, focusCountyByName, focusWindSiteByName, clearHL };
})();

document.addEventListener('ama:groups-ready', ()=>{
  try{ window.__amaSearch?.rebuild?.(); }catch(e){}
  try{ if(window.__amaSearch?.stats) console.log('[AMA-search] reindexed:', window.__amaSearch.stats()); }catch(_){ }
});
