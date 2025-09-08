const paths = [
  '/data/layers.config.json',
  '/data/amaayesh/wind_sites.geojson',
  '/amaayesh/layers.config.json',
  '/amaayesh/data/wind_sites.geojson'
];

let baseRaw;
for(let i = 0; i < process.argv.length; i++){
  const arg = process.argv[i];
  if(arg.startsWith('--base')){
    baseRaw = arg.includes('=') ? arg.split('=')[1] : process.argv[i + 1];
    break;
  }
}
baseRaw = baseRaw || process.env.SITE_URL;
if(!baseRaw){
  console.error('Base URL not provided');
  process.exit(1);
}
const base = baseRaw.replace(/\/$/, '');

async function check(path){
  let method = 'HEAD';
  try{
    let res = await fetch(base + path, { method, cache: 'no-store' });
    if(res.status === 405){
      method = 'GET';
      res = await fetch(base + path, { method, cache: 'no-store' });
    }
    return { path, method, status: res.status, ok: res.ok, redirected: res.redirected };
  }catch(e){
    return { path, method, status: 'ERR', ok: false, redirected: false };
  }
}

(async () => {
  const rows = [];
  for(const p of paths){
    rows.push(await check(p));
  }
  console.table(rows);

  const std = rows.slice(0,3).map(r => r.status);
  const legacy = rows.slice(3).map(r => r.status);
  if(std.every(s => s === 200)){
    console.log('PASS');
  }else if(std.every(s => s === 404) && legacy.every(s => s === 200)){
    console.log('PASS (legacy)');
    console.log('Move files to docs/data/amaayesh');
  }else if(std.every(s => s === 404) && legacy.every(s => s === 404)){
    console.log('FAIL: assets not published under docs/data/amaayesh nor docs/amaayesh/data');
  }
})();
