/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  const STEP=250, MAX=12000, t0=performance.now();
  const log=(...a)=>console.log('%c[AMA-search]', 'color:#0ea5e9', ...a);
  const warn=(...a)=>console.warn('%c[AMA-search]', 'color:#f59e0b', ...a);

  const norm = s => String(s||'')
    .replace(/\u200c/g,' ').replace(/[‌\u200f]/g,' ')
    .replace(/[إأآ]/g,'ا').replace(/[ي]/g,'ی')
    .replace(/[ۀ]/g,'ه').replace(/\s+/g,' ').trim().toLowerCase();

  const NAME_KEYS = ['county','COUNTY','County','shahrestan','شهرستان','نام شهرستان','NAME_2','name_2','ADM2','adm2','name','label','LABEL','name_fa'];

  function getMap(){ return (window.__AMA_MAP && window.__AMA_MAP.map) || window.__AMA_MAP || null; }
  function getCountiesFC(){
    const fc = window.__countiesGeoAll || (window.__AMA_MAP && window.__AMA_MAP.countiesGeo);
    return Array.isArray(fc?.features) ? fc : { type:'FeatureCollection', features:[] };
  }
  function countyName(p){
    for(const k of NAME_KEYS){ const v=p?.[k]; if(v!=null && String(v).trim()) return String(v); }
    return '';
  }

  function fitCountyByName(q){
    const map = getMap(); if(!map) return false;
    const fc = getCountiesFC();
    const nq = norm(q);
    let found = null;
    for(const f of fc.features){
      if(norm(countyName(f.properties)) === nq) { found=f; break; }
    }
    if(!found) return false;
    try {
      const gj = L.geoJSON(found);
      const b = gj.getBounds();
      if (b?.isValid?.() ) map.fitBounds(b, { padding:[20,20] });
      gj.remove();
      return true;
    } catch { return false; }
  }

  function bind(){
    const el = document.querySelector('#ama-county-search') || document.querySelector('#ama-search');
    if(!el) return warn('no search input found (#ama-county-search | #ama-search)');
    let tid=null;
    el.addEventListener('input', ()=>{ clearTimeout(tid); tid=setTimeout(()=>{ /* live suggest قابل افزودن است */ }, 300); });
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); fitCountyByName(el.value); } });
  }

  function ready(){ return getMap() && getCountiesFC().features.length>0; }
  (function wait(){
    if (ready()) { bind(); log('wired'); return; }
    if (performance.now()-t0 > MAX) { warn('timeout waiting for map/data'); return; }
    setTimeout(wait, STEP);
  })();

  // allow external rebuild (after ama:groups-ready)
  document.addEventListener('ama:groups-ready', ()=>{ /* nothing to rebuild now, but here for future */ });
})();

