async function loadJSON(url){
  return fetch(url).then(r => r.ok ? r.json() : null).catch(_ => null);
}
function splitAdmin(fc){
  const feats = Array.isArray(fc?.features) ? fc.features : [];
  const polys = feats.filter(f => (f.geometry?.type||'').includes('Polygon'));
  const hasAny = (obj, keys) => keys.some(k => (obj?.[k]??'').toString().trim().length>0);
  const isCounty   = f => hasAny(f.properties, ['ADM2','adm2','county','County','شهرستان','COUNTY','NAME_2','name_2','shahrestan','نام شهرستان']);
  const isProvince = f => hasAny(f.properties, ['ADM1','adm1','province','Province','استان','PROVINCE','NAME_1','name_1','ostan','نام استان']);
  const counties = polys.filter(f => isCounty(f) && !isProvince(f));
  const provs    = polys.filter(f => isProvince(f));
  return {
    countiesFC: { type:'FeatureCollection', features: counties.length ? counties : polys },
    provinceFC: { type:'FeatureCollection', features: provs }
  };
}

(async function(){
  const adminFC = await loadJSON('docs/data/amaayesh/khorasan_razavi_combined.geojson');
  const { countiesFC, provinceFC } = splitAdmin(adminFC);

  const windFC  = await loadJSON('docs/data/amaayesh/wind_sites.geojson');
  const solarFC = await loadJSON('docs/data/amaayesh/solar_sites.geojson');
  const damsFC  = await loadJSON('docs/data/amaayesh/dams.geojson');

  window.__countiesGeoAll      = countiesFC || { type:'FeatureCollection', features:[] };
  window.__AMA_COUNTIES_SOURCE = countiesFC || null;
  window.__combinedGeo         = provinceFC || null;

  const MAPH = window.__AMA_MAP || {};
  const map  = MAPH.map || L.map('map', { preferCanvas:true, zoomControl:true });
  window.__AMA_MAP = { ...MAPH, map };
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'© OpenStreetMap' }).addTo(map);
  map.zoomControl?.setPosition?.('bottomleft');
  map.attributionControl?.setPosition?.('bottomleft');

  const canvasRenderer = L.canvas({ padding:0.5 });

  const baseAdminGroup = L.featureGroup([], { pane:'polygons' }).addTo(map);
  let provinceLayer = null;
  if (provinceFC?.features?.length) {
    provinceLayer = L.geoJSON(provinceFC, { pane:'polygons', style:{ fillOpacity:0.03, color:'#7c3aed', weight:1 }});
    baseAdminGroup.addLayer(provinceLayer);
  }
  let countiesLayer = null;
  if (countiesFC?.features?.length) {
    countiesLayer = L.geoJSON(countiesFC, { pane:'polygons', renderer:canvasRenderer, style:{ fillOpacity:0.05, color:'#444', weight:0.7 }});
    baseAdminGroup.addLayer(countiesLayer);
  }
  window.__countiesLayer = countiesLayer;

  function rebuildGroupsAndExpose(){
    const A = window.AMA = window.AMA || {};
    const M = window.__AMA_MAP || {};
    const groups = {
      wind     : window.windSitesLayer  || null,
      solar    : window.solarSitesLayer || null,
      dams     : window.damsLayer       || null,
      counties : window.__countiesLayer || null,
      province : baseAdminGroup || null,
    };
    M.groups = Object.fromEntries(Object.entries(groups).filter(([,v]) => !!v));
    A.G = () => (M.groups || {});
    if (Object.keys(M.groups||{}).length){
      document.dispatchEvent(new CustomEvent('ama:groups-ready', { detail:{ keys:Object.keys(M.groups) }}));
    }
  }
  rebuildGroupsAndExpose();

  if (windFC?.features?.length) {
    const windSitesLayer = L.geoJSON(windFC, { pane:'points' });
    window.windSitesLayer = windSitesLayer;
    rebuildGroupsAndExpose();
  }
  if (solarFC?.features?.length) {
    const solarSitesLayer = L.geoJSON(solarFC, { pane:'points' });
    window.solarSitesLayer = solarSitesLayer;
    rebuildGroupsAndExpose();
  }
  if (damsFC?.features?.length) {
    const damsLayer = L.geoJSON(damsFC, { pane:'points' });
    window.damsLayer = damsLayer;
    rebuildGroupsAndExpose();
  }
})();
