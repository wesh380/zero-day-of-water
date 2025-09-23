const args = process.argv.slice(2);
const paths = args.length ? args : [
  '/data/layers.config.json',
  '/data/amaayesh/khorasan_razavi_combined.geojson',
  '/data/amaayesh/wind_sites.geojson',
  '/data/amaayesh/solar_sites.geojson',
  '/data/amaayesh/dams.geojson',
  '/data/amaayesh/wind_sites_raw.csv',
  '/data/amaayesh/wind_weights_by_county.csv',
  '/config/api.json',
  '/amaayesh/layers.config.json'
];

const base = process.env.VERIFY_BASE || 'http://localhost:8888';

async function check(p){
  const full = /^https?:/i.test(p) ? p : base.replace(/\/$/, '') + p;
  try{
    const res = await fetch(full, { method:'HEAD' });
    return { url: full, status: res.status, ok: res.ok };
  }catch(e){
    return { url: full, status: 'ERR', ok: false };
  }
}

(async () => {
  const rows = [];
  for(const p of paths){ rows.push(await check(p)); }
  console.table(rows);
})();

