;(function(){
  const STEP=250, MAX=8000;
  const normalizeFa = s => String(s||'').replace(/\u200c/g,' ').replace(/[^\w\u0600-\u06FF\s]/g,' ').replace(/[آأإ]/g,'ا').replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/\s+/g,' ').trim().toLowerCase();
  const NAME_KEYS = ['county','COUNTY','County','shahrestan','شهرستان','نام شهرستان','NAME_2','NAME','name','label','LABEL','name_fa'];

  const getCountyName = p => { for (const k of NAME_KEYS){ const v=p?.[k]; if(v) return v; } return ''; };
  const countiesSrc = () => window.__countiesGeoAll?.features?.length ? window.__countiesGeoAll
                       : (window.__countiesLayer?.toGeoJSON ? window.__countiesLayer.toGeoJSON() : {type:'FeatureCollection',features:[]});

  function buildIndex(){
    const c=countiesSrc();
    const idx=(c.features||[]).map(f=>({ type:'county', raw:getCountyName(f.properties), norm:normalizeFa(getCountyName(f.properties)), f }))
                               .filter(x=>x.raw);
    return { idx };
  }

  function focusCountyByName(name){
    try{
      const norm=normalizeFa(name);
      const { idx }=buildIndex();
      const hit=idx.find(x=>x.type==='county' && x.norm===norm);
      if(!hit) return false;
      const map=window.__AMA_MAP?.map; const gj=L.geoJSON(hit.f);
      if(map&&gj){ map.fitBounds(gj.getBounds(),{padding:[20,20]}); gj.remove(); }
      return true;
    }catch(e){ return false; }
  }

  function wireInput(){
    const el=document.getElementById('ama-search') || document.querySelector('.ama-search input');
    if(!el) return;
    el.addEventListener('keydown', e=>{ if(e.key==='Enter'){ const ok=focusCountyByName(el.value); if(!ok) console.warn('[AMA-search] county not found:', el.value); }});
  }

  function init(){
    const t0=performance.now();
    (function wait(){
      const ok=(countiesSrc().features||[]).length>0 && window.__AMA_MAP?.map;
      if(ok){ wireInput(); return; }
      if(performance.now()-t0>MAX){ console.warn('[AMA-search] timeout waiting for map/data'); return; }
      setTimeout(wait, STEP);
    })();
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('ama:groups-ready', init);

  window.__amaSearch={ stats(){ return { total:(countiesSrc().features||[]).length }; }, focusCountyByName };
})();
