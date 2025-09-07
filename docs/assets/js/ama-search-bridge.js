(function setupAmaSearchBridge(){
  const TRY_MS = 5000, STEP = 150;
  const t0 = performance.now();

  function normalizeFa(s=''){
    return s
      .replace(/\u200c/g, ' ')
      .replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک')
      .replace(/[ۀة]/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function ready(){
    return (window.__AMA_MAP && (__amaDiag?.().mapReady || true)) &&
      (Array.isArray(window.countiesGeo?.features) || window.AMA?.G?.counties);
  }

  function buildAliasIndex(){
    const aliasMap = window.__COUNTY_ALIASES || {};
    const rev = {};
    for(const [alias, canon] of Object.entries(aliasMap)){
      (rev[canon] = rev[canon] || []).push(alias);
    }
    return rev;
  }

  function run(){
    const input = document.getElementById('ama-county-search');
    if(!input) return console.warn('[AMA-search] input not found');

    const map = window.__AMA_MAP || window.map;
    const countyLayer = window.AMA?.G?.counties;
    const features = window.countiesGeo?.features || countyLayer?.toGeoJSON?.().features || [];
    const aliasRev = buildAliasIndex();

    const index = [];
    const pushIndex = (name, feat)=>{
      if(!name) return;
      index.push({ raw:name, norm:normalizeFa(name), f:feat });
    };

    for(const f of features){
      const p = f.properties || {};
      const name = p.county || p.NAME || p.name || p.title || '';
      pushIndex(name, f);
      const canon = typeof canonicalCountyName === 'function' ? canonicalCountyName(name) : name;
      if(aliasRev[canon]) aliasRev[canon].forEach(a=> pushIndex(a, f));
    }

    let lastHl = null;
    function clearHL(){
      if(lastHl && lastHl.setStyle){
        lastHl.setStyle({ weight:2, color:'#000', fillOpacity:0.0 });
      }
      lastHl = null;
    }
    function showFeature(feat){
      try{
        const grp = window.AMA?.G?.counties;
        if(grp && map && !map.hasLayer(grp)) grp.addTo(map);
      }catch(e){}
      let foundLayer = null;
      (countyLayer?.eachLayer ? countyLayer : { eachLayer:()=>{} }).eachLayer(l=>{
        if(l.feature === feat) foundLayer = l;
      });
      if(foundLayer && map){
        clearHL();
        foundLayer.setStyle({ weight:3, color:'#0ea5e9', fillOpacity:0.15 });
        lastHl = foundLayer;
        try{ map.fitBounds(foundLayer.getBounds(), { padding:[20,20] }); }catch(e){}
      }
    }

    let timer = null;
    function searchNow(q){
      const hint = document.getElementById('ama-county-search-hint');
      const nq = normalizeFa(q||'');
      if(!nq){ clearHL(); if(hint) hint.style.display='none'; return; }
      let cand = index.find(x=> x.norm===nq) || index.find(x=> x.norm.includes(nq));
      if(cand){
        showFeature(cand.f);
        if(hint) hint.style.display='none';
      } else {
        if(hint){ hint.textContent='یافت نشد'; hint.style.display='block'; }
      }
    }
    function onInput(){
      clearTimeout(timer);
      timer = setTimeout(()=> searchNow(input.value), 200);
    }
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', e=>{
      if(e.key==='Enter'){ e.preventDefault(); searchNow(input.value); }
      if(e.key==='Escape'){ input.value=''; clearHL(); const h=document.getElementById('ama-county-search-hint'); if(h) h.style.display='none'; }
    });

    const clearBtn = document.getElementById('ama-county-clear');
    if(clearBtn) clearBtn.addEventListener('click', ()=>{ input.value=''; clearHL(); const h=document.getElementById('ama-county-search-hint'); if(h) h.style.display='none'; input.focus(); });

    window.__amaSearch = { index, searchNow, clearHL };
    console.info('[AMA-search] wired, counties:', features.length);
  }

  (function wait(){
    if(ready()) return run();
    if(performance.now()-t0 > TRY_MS) return console.warn('[AMA-search] timeout');
    setTimeout(wait, STEP);
  })();
})();
