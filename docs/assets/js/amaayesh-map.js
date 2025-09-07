// ------- admin boot (province + counties) ---------
async function loadJSON(url){ try{const r = await fetch(url); return r.ok?await r.json():null;}catch{return null;} }
function ensureBaseMap(){
  const AMA = (window.__AMA_MAP = window.__AMA_MAP || {});
  if(!AMA.map){
    const m = L.map('map', { preferCanvas:true, zoomControl:true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'© OpenStreetMap' }).addTo(m);
    m.zoomControl?.setPosition?.('bottomleft');
    m.attributionControl?.setPosition?.('bottomleft');
    AMA.map = m;
  }
  return window.__AMA_MAP.map;
}
const ADMIN_JSON = '/data/amaayesh/khorasan_razavi_combined.geojson';

(async ()=>{
  const map = ensureBaseMap();
  const fc = await loadJSON(ADMIN_JSON);
  if(!fc?.features?.length){ console.warn('[AMA] admin geojson not found:', ADMIN_JSON); return; }

  // جداکردن استان و شهرستان (هر دو Polygon)
  const polys = fc.features.filter(f=>(f.geometry?.type||'').includes('Polygon'));
  const isProvince=f=>/استان|province|PROVINCE|NAME_1|ADM1/i.test(JSON.stringify(f.properties||{}));
  const provinces = polys.filter(isProvince);
  const counties  = polys.filter(f=>!isProvince(f));

  // لایه‌ها
  const grp = L.featureGroup([], { pane:'polygons' }).addTo(map);
  const provinceLyr = provinces.length && L.geoJSON({type:'FeatureCollection',features:provinces},
                        {pane:'polygons',style:{fillOpacity:.02,color:'#7c3aed',weight:1}});
  const countiesLyr = counties.length && L.geoJSON({type:'FeatureCollection',features:counties},
                        {pane:'polygons',style:{fillOpacity:.05,color:'#444',weight:.7}});
  provinceLyr && grp.addLayer(provinceLyr);
  countiesLyr && grp.addLayer(countiesLyr);

  window.__AMA_COUNTIES_SOURCE = {type:'FeatureCollection',features:counties};
  window.__countiesGeoAll      = window.__AMA_COUNTIES_SOURCE;
  window.__countiesLayer       = countiesLyr;

  // fitBounds یک‌بار
  try{ const b=grp.getBounds(); b.isValid() && map.fitBounds(b,{padding:[20,20]}); }catch{}

  // رجیستر در groups
  const G = (window.__AMA_MAP.groups = window.__AMA_MAP.groups || {});
  Object.assign(G,{ province:grp, counties:countiesLyr });
  // سیگنال آماده بودن
  document.dispatchEvent(new CustomEvent('ama:groups-ready', {detail:{keys:Object.keys(G)}}));
})();
