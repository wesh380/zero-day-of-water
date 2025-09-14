importScripts('/assets/vendor/expr-eval.min.js');

const AMA_DEBUG = self.AMA_DEBUG;
function dataBases(){
  const here = new URL(self.location.href);
  const cand = [
    new URL('./data/', here).pathname,  // ./data/
    new URL('data/',  here).pathname,   // data/
    '/amaayesh/data/',                  // abs
    '/data/amaayesh/'                   // abs legacy
  ];
  return [...new Set(cand)];
}
async function resolveDataUrl(file){
  const qs = `?v=${self.__AMA_BUILD_ID}`;
  for(const b of dataBases()){
    const url = b + file + qs;
    try { const r = await fetch(url, {method:'GET', cache:'no-store'});
      if (r.ok) { (self.__AMA_RESOLVED ||= {})[file]=url; if(AMA_DEBUG) console.info('[resolve]',file,'→',url); return url; }
    } catch {}
  }
  if (AMA_DEBUG) console.warn('[resolve] NOT FOUND:', file);
  return null;
}
async function fetchJSONResolved(f){ const u=await resolveDataUrl(f); if(!u) return null; const r=await fetch(u,{cache:'no-store'}); return r.ok? r.json(): null; }

let model;
let simParams = {};
const Parser = self.exprEval.Parser;

function parseModel(json) {
  const parser = new Parser();
  model = { nodes: {}, edges: [], order: [], initials: {} };
  (json.nodes || []).forEach(n => {
    const node = { ...n, deps: [] };
    if (n.expr) {
      try { node.fn = parser.parse(n.expr); } catch (e) {}
    }
    if (n.type === 'init') {
      node.value = node.fn ? node.fn.evaluate({}) : parseFloat(n.expr) || 0;
      model.initials[n.id] = node.value;
    }
    if (typeof n.init !== 'undefined') model.initials[n.id] = n.init;
    model.nodes[n.id] = node;
  });
  (json.edges || []).forEach(e => {
    const edge = { ...e };
    if (e.expr) {
      try { edge.fn = parser.parse(e.expr); } catch (err) {}
    }
    model.edges.push(edge);
  });
  Object.values(model.nodes).forEach(n => {
    if (n.type === 'expr' && n.fn) {
      n.deps = n.fn.variables().filter(v => model.nodes[v]);
    }
  });
  const inDeg = {};
  Object.keys(model.nodes).forEach(id => inDeg[id] = 0);
  Object.values(model.nodes).forEach(n => n.deps.forEach(d => inDeg[n.id]++));
  const q = [];
  Object.keys(inDeg).forEach(id => { if (inDeg[id] === 0) q.push(id); });
  const order = [];
  while (q.length) {
    const id = q.shift();
    order.push(id);
    Object.values(model.nodes).forEach(n => {
      if (n.deps.includes(id)) {
        inDeg[n.id]--;
        if (inDeg[n.id] === 0) q.push(n.id);
      }
    });
  }
  Object.keys(model.nodes).forEach(id => { if (!order.includes(id)) order.push(id); });
  model.order = order;
  return model;
}

function simulateStep(state, t) {
  const prev = state[t - 1] || {};
  const cur = {};
  const tol = 1e-6, maxIter = 8;
  let iter = 0, changed = true;
  while (changed && iter < maxIter) {
    changed = false;
    for (const id of model.order) {
      const n = model.nodes[id];
      if (n.type === 'init') {
        cur[id] = model.initials[id];
        continue;
      }
      const ctx = Object.assign({}, simParams, prev, cur, {
        delay: (name, d = 1) => {
          const tt = t - d;
          if (tt < 0) return model.initials[name] || 0;
          const st = state[tt];
          return st && st[name] != null ? st[name] : model.initials[name] || 0;
        }
      });
      let val = 0;
      try { val = n.fn ? n.fn.evaluate(ctx) : 0; } catch (e) {}
      if (cur[id] === undefined || Math.abs(cur[id] - val) > tol) {
        cur[id] = val;
        changed = true;
      }
    }
    iter++;
  }
  return cur;
}

function simulate(params) {
  simParams = params;
  const years = params.years || 30;
  const state = [Object.assign({}, model.initials)];
  for (let t = 1; t <= years; t++) {
    state[t] = simulateStep(state, t);
  }
  return { years: Array.from({ length: years + 1 }, (_, i) => i), series: state.map(s => s.gw_stock) };
}

self.onmessage = async e => {
  const data = e.data;
  if (data.cmd === 'init') {
    try {
      const json = await fetchJSONResolved('water-cld.json');
      if(json) parseModel(json);
    } catch (err) {
      // ignore
    }
  } else if (data.cmd === 'runBatch') {
    const { param, range, base } = data;
    const values = [];
    const total = Math.floor((range.max - range.min) / range.step) + 1;
    let i = 0;
    for (let v = range.min; v <= range.max + 1e-9; v += range.step) {
      const params = Object.assign({}, base, { [param]: v });
      const res = simulate(params);
      values.push(res.series);
      i++;
      self.postMessage({ type: 'progress', value: i / total });
    }
    const years = simulate(base).years;
    const p10 = [], p50 = [], p90 = [];
    for (let t = 0; t < years.length; t++) {
      const arr = values.map(v => v[t]).sort((a, b) => a - b);
      const n = arr.length - 1;
      p10.push(arr[Math.floor(n * 0.1)]);
      p50.push(arr[Math.floor(n * 0.5)]);
      p90.push(arr[Math.floor(n * 0.9)]);
    }
    self.postMessage({ type: 'complete', years, p10, p50, p90 });
  }
};
