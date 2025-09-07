/* docs/assets/js/ama-search-bridge.js */
(function AMA_SEARCH_BRIDGE(){
  // --- Helpers ---
  function normalizeFa(s=''){
    return s
      .replace(/\u200c/g, ' ') // ZWNJ -> space
      .replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک')
      .replace(/[ۀة]/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Wait until map + counties are ready
  const T_MAX = 8000, STEP = 150;
  const t0 = performance.now();

  function getMap(){
    return (window.__AMA_MAP && (window.__AMA_MAP.map || window.__AMA_MAP.leaflet)) ||
           window.AMA_MAP || window.map || null;
  }

  function countiesReady(){
    // 1) ترجیح: GeoJSON لودشده توسط بوت‌استرپ
    if (window.__AMA_MAP?.countiesGeo?.features?.length) return true;
    // 2) فallback: گروه لِفلتی شهرستان‌ها
    const grp = window.__AMA_MAP?.groups?.counties?.[0] || window.__AMA_COUNTIES_LAYER;
    if (grp && (grp.getLayers?.() || grp.eachLayer)) return true;
    return false;
  }

  function collectCountyFeatures(){
    // ترجیح: GeoJSON خام
    if (window.__AMA_MAP?.countiesGeo?.features?.length) {
      return window.__AMA_MAP.countiesGeo.features;
    }
    // فallback: از گروه لفلتی استخراج کن
    const grp = window.__AMA_MAP?.groups?.counties?.[0] || window.__AMA_COUNTIES_LAYER;
    const feats = [];
    if (grp?.eachLayer){
      grp.eachLayer(l => { if (l?.feature) feats.push(l.feature); });
    } else if (grp?.toGeoJSON){
      const gj = grp.toGeoJSON();
      if (gj?.features?.length) return gj.features;
    }
    return feats;
  }

  function run(){
    const map = getMap();
    const input = document.getElementById('ama-county-search');
    if (!map || !input) {
      console.warn('[AMA-search] map or input not found');
      return;
    }

    // Build index from ALL county features (should be ~73)
    const feats = collectCountyFeatures();
    const index = [];
    const pushIdx = (name, f) => {
      if (!name) return;
      index.push({ raw:name, norm:normalizeFa(name), f });
    };

    for (const f of feats){
      const p = f.properties || {};
      const name = p.county || p.NAME || p.name || p.title || '';
      pushIdx(name, f);
      // پوشش نام‌های مستعار اگر شیء AMA_ALIASES موجود است
      if (window.AMA_ALIASES && Array.isArray(window.AMA_ALIASES[name])){
        for (const a of window.AMA_ALIASES[name]) pushIdx(a, f);
      }
    }

    // Make sure counties layer is visible on search
    function ensureCountiesVisible(){
      const grp = window.__AMA_MAP?.groups?.counties?.[0];
      try { if (grp && !map.hasLayer(grp)) map.addLayer(grp); } catch(e){}
    }

    // Highlight + fit
    let lastHL = null;
    function clearHL(){
      try {
        if (lastHL?.setStyle) lastHL.setStyle({ weight:2, color:'#000', fillOpacity:0.0 });
        if (lastHL?.remove && lastHL.__tempHL) lastHL.remove(); // اگر لایه‌ی موقت بود
      } catch(e){}
      lastHL = null;
    }

    function findLeafletLayerForFeature(f){
      const grp = window.__AMA_MAP?.groups?.counties?.[0] || window.__AMA_COUNTIES_LAYER;
      let found = null;
      if (grp?.eachLayer){
        grp.eachLayer(l => { if (!found && l?.feature === f) found = l; });
      }
      return found;
    }

    function showFeature(f){
      ensureCountiesVisible();
      let lyr = findLeafletLayerForFeature(f);
      // اگر لایهٔ اصلی پیدا نشد، یک geoJSON موقت برای های‌لایت بساز
      if (!lyr && window.L && L.geoJSON){
        lyr = L.geoJSON(f, { style:{ weight:3, color:'#0ea5e9', fillOpacity:0.15 } });
        lyr.__tempHL = true;
        lyr.addTo(map);
      }
      if (lyr){
        clearHL();
        if (!lyr.__tempHL && lyr.setStyle) lyr.setStyle({ weight:3, color:'#0ea5e9', fillOpacity:0.15 });
        lastHL = lyr;
        try { map.fitBounds(lyr.getBounds(), { padding:[20,20] }); } catch(e){}
      }
    }

    function searchNow(q){
      const nq = normalizeFa(q);
      if (!nq){ clearHL(); return; }
      // exact first, then contains
      let hit = index.find(x => x.norm === nq) || index.find(x => x.norm.includes(nq));
      if (hit) showFeature(hit.f);
    }

    // Wire UI
    let deb=null;
    input.addEventListener('input', ()=>{
      clearTimeout(deb);
      deb = setTimeout(()=>searchNow(input.value||''), 220);
    });
    input.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter'){ e.preventDefault(); searchNow(input.value||''); }
      if (e.key === 'Escape'){ input.value=''; clearHL(); }
    });
    const clearBtn = document.getElementById('ama-county-clear');
    if (clearBtn) clearBtn.addEventListener('click', ()=>{ input.value=''; clearHL(); input.focus(); });

    // قطع اتصال پل/شنونده‌های قدیمی (اگر باقی‌مانده‌اند)
    try {
      const legacy = document.querySelector('.leaflet-control-search, .leaflet-control-geocoder');
      if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    } catch(e){}

    window.__amaSearch = { index, searchNow, clearHL };
    console.info('[AMA-search] wired. counties:', feats.length, 'index:', index.length);
  }

  (function wait(){
    const map = getMap();
    if (map && countiesReady()){
      run();
      return;
    }
    if (performance.now() - t0 > T_MAX){
      console.warn('[AMA-search] timeout waiting for map/counties');
      return;
    }
    setTimeout(wait, STEP);
  })();
})();

