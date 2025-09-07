// --- AMA admin data boot (safe) ---------------------------------
function ensureMap() {
  const M = (window.__AMA_MAP = window.__AMA_MAP || {});
  if (!M.map) {
    const map = L.map('map', { preferCanvas: true, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.zoomControl?.setPosition?.('bottomleft');
    map.attributionControl?.setPosition?.('bottomleft');
    M.map = map;
  }
  return window.__AMA_MAP.map;
}

async function loadJSON(url) {
  try { const r = await fetch(url); return r.ok ? await r.json() : null; }
  catch (_) { return null; }
}

// از صفحه‌ی /amaayesh/ به ریشه‌ی سایت سرو می‌کنیم، پس مسیر ریشه‌ای مطمئن است:
const ADMIN_DATA_CANDIDATES = [
  '/data/amaayesh/khorasan_razavi_combined.geojson',
  '../data/amaayesh/khorasan_razavi_combined.geojson'
];

function splitAdmin(fc) {
  const feats = Array.isArray(fc?.features) ? fc.features : [];
  const polys = feats.filter(f => (f.geometry?.type || '').includes('Polygon'));
  const hasAny = (o, ks) => ks.some(k => (o?.[k] ?? '').toString().trim().length > 0);
  const isCounty   = f => hasAny(f.properties, ['ADM2','adm2','county','County','شهرستان','COUNTY','NAME_2','name_2','shahrestan','نام شهرستان']);
  const isProvince = f => hasAny(f.properties, ['ADM1','adm1','province','Province','استان','PROVINCE','NAME_1','name_1','ostan','نام استان']);
  const counties = polys.filter(f => isCounty(f) && !isProvince(f));
  const provs    = polys.filter(f => isProvince(f));
  return {
    countiesFC: { type: 'FeatureCollection', features: counties.length ? counties : polys },
    provinceFC: { type: 'FeatureCollection', features: provs }
  };
}

// --- minimal admin-only boot to make the map show up ---
(async () => {
  const map = ensureMap();

  // try a list of safe URLs; stop at first success
  let adminFC = null;
  for (const u of ADMIN_DATA_CANDIDATES) {
    adminFC = await loadJSON(u);
    if (adminFC?.features?.length) break;
  }
  if (!adminFC) {
    console.warn('[AMA] admin geojson not found from candidates:', ADMIN_DATA_CANDIDATES);
    return; // نقشه (پایه) هست؛ فقط مرزها نداریم
  }

  const { countiesFC, provinceFC } = splitAdmin(adminFC);

  // expose globals used by other parts (بدون دست‌زدن به سایر ماژول‌ها)
  window.__countiesGeoAll      = countiesFC || { type:'FeatureCollection', features: [] };
  window.__AMA_COUNTIES_SOURCE = countiesFC || null;
  window.__combinedGeo         = provinceFC || null;

  // draw layers safely
  const baseAdminGroup = L.featureGroup([], { pane: 'polygons' }).addTo(map);

  let provinceLayer = null;
  if (provinceFC?.features?.length) {
    provinceLayer = L.geoJSON(provinceFC, {
      pane: 'polygons',
      style: { fillOpacity: 0.03, color: '#7c3aed', weight: 1 }
    });
    baseAdminGroup.addLayer(provinceLayer);
  }

  let countiesLayer = null;
  if (countiesFC?.features?.length) {
    countiesLayer = L.geoJSON(countiesFC, {
      pane: 'polygons',
      style: { fillOpacity: 0.05, color: '#444', weight: 0.7 }
    });
    baseAdminGroup.addLayer(countiesLayer);
  }

  window.__countiesLayer = countiesLayer;

  // try fitBounds if we have anything visible
  try {
    const gj = L.geoJSON({
      type: 'FeatureCollection',
      features: [
        ...(provinceFC?.features || []),
        ...(countiesFC?.features || [])
      ]
    });
    const b = gj.getBounds();
    if (b && b.isValid && b.isValid()) map.fitBounds(b, { padding: [20, 20] });
    gj.remove();
  } catch (_) { /* ignore */ }

  // (اختیاری) علامتِ آماده‌بودن برای سایر بخش‌ها
  const M = (window.__AMA_MAP = window.__AMA_MAP || {});
  M.groups = Object.assign({}, M.groups, {
    counties: countiesLayer || null,
    province: baseAdminGroup || null
  });
  document.dispatchEvent(new CustomEvent('ama:groups-ready', { detail:{ keys:Object.keys(M.groups) } }));
})();
