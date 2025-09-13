(function () {
  const CLD_CORE = (typeof window !== 'undefined' && window.CLD_CORE) ? window.CLD_CORE : {};
  const getCy = CLD_CORE.getCy ? CLD_CORE.getCy : () => null;
  // In some builds a stray HTMLElement may be assigned to window.cy; neutralize safely.
  try { if (window.cy && window.cy.tagName) { window.cy = undefined; } } catch (e) {}

  // Optional: if a custom bundle URL list is desired, define it here; otherwise rely on loader defaults.
  // window.CLD_BUNDLE_URLS = {
  //   js:  ["../assets/dist/water-cld.bundle.js?v=1"],
  //   css: ["../assets/dist/water-cld.bundle.css?v=1"]
  // };

  // Simple debug log when CLD bundle signals it is ready
  function onBundleLoaded(){
  if (typeof window!=="undefined" && window.CLD_CORE){ try{ console.log("[DEBUG guard] facade present, skip legacy patches"); }catch(_){ } return; }
    // If a core facade is present, skip legacy runtime patches
    if (window.CLD_CORE) return;
    const cy = getCy();
    if (cy) {
      console.log("[CLD] bundle loaded -> cy ready", {
        cyNodes: cy.nodes().length,
        cyEdges: cy.edges().length,
      });
    }

    // Runtime patch: make graphStore.restore accept elements in any shape and inject via array
    try {
      const gs = window.graphStore;
      if (gs && typeof gs.restore === 'function' && !gs.__RESTORE_PATCHED__) {
        const origRestore = gs.restore;
        gs.restore = function(payload){
          try {
            if (window.CLD_MAP && typeof window.CLD_MAP.coerceElements === 'function'){
              const arr = window.CLD_MAP.coerceElements(payload);
              if (Array.isArray(arr) && arr.length) return origRestore.call(this, arr);
            }
          } catch (e) { /* ignore and fallback */ }
          return origRestore.apply(this, arguments);
        };
        gs.__RESTORE_PATCHED__ = true;
        console.debug('[CLD init] graphStore.restore patched for elements object');
      }
    } catch (e) { console.warn('[CLD init] graphStore patch failed', e); }

    // Runtime patch: standardize injection path for cy.json -> always use add(arr)
    try {
      const readyCy = window.CLD_SAFE && window.CLD_SAFE.cy;
      const patchCy = (inst) => {
        if (!inst || inst.__JSON_PATCHED__) return;
        const origJson = inst.json;
        if (typeof origJson === 'function') {
          inst.json = function(obj){
            try{
              if (window.CLD_MAP && typeof window.CLD_MAP.coerceElements === 'function' && obj && obj.elements){
                const arr = window.CLD_MAP.coerceElements(obj);
                if (Array.isArray(arr) && arr.length){ this.add(arr); return this; }
              }
            }catch(_){ /* ignore */ }
            return origJson.apply(this, arguments);
          };
          inst.__JSON_PATCHED__ = true;
          console.debug('[CLD init] cy.json patched for elements object');
        }
      };
      if (readyCy) patchCy(readyCy);
      document.addEventListener('cy:ready', (ev)=>{ try{ patchCy((ev && ev.detail && ev.detail.cy) || readyCy); }catch(_){ } }, { once:true });
    } catch (e) { console.warn('[CLD init] cy.json patch failed', e); }
  }
  // Some loaders dispatch on document; listen to both
  window.addEventListener('cld:bundle:loaded', onBundleLoaded);
  document.addEventListener('cld:bundle:loaded', onBundleLoaded);
  // Also attempt an immediate run in case the event already fired
  try { setTimeout(onBundleLoaded, 0); } catch(_) {}

  // Propagate initial layout algorithm from UI (if present)
  try {
    const setAlgo = () => {
      const sel = document.getElementById('layout');
      if (!sel) return;
      // Force default to Dagre for stability; user can still switch later
      try {
        if (!sel.value || sel.value.toLowerCase() === 'elk') sel.value = 'dagre';
      } catch(_){ }
      window.cldLayoutName = sel.value || 'dagre';
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setAlgo, { once:true });
    } else { setAlgo(); }
    document.addEventListener('change', function(ev){
      try{
        if (ev && ev.target && ev.target.id === 'layout') window.cldLayoutName = ev.target.value;
      }catch(_){ }
    });
  } catch(_){ }

  // Guard ELK: if ELK layout throws (promise rejection), fall back to Dagre
  try {
    function runDagreFallback(){
      try{
        const cy = getCy();
        if (CLD_CORE && typeof CLD_CORE.runLayout === 'function'){
          CLD_CORE.runLayout('dagre', { rankDir: 'LR', nodeSep: 60, rankSep: 90, edgeSep: 24, spacingFactor: 1.12, padding: 30, animate: false });
        } else if (cy && cy.layout) {
          cy.layout({ name: 'dagre', rankDir: 'LR', nodeSep: 60, rankSep: 90, edgeSep: 24, spacingFactor: 1.12, padding: 30, animate: false }).run();
        }
        console.warn('[CLD init] ELK failed; fell back to Dagre');
      }catch(e){ console.error('[CLD init] Dagre fallback failed', e); }
    }
    window.addEventListener('unhandledrejection', function(ev){
      try{
        const msg = String((ev && ev.reason && (ev.reason.stack || ev.reason)) || '');
        if (msg.includes('cytoscape-elk') || msg.includes('elk.bundled')) runDagreFallback();
      }catch(_){ }
    });

    // If a helper runLayout is present, wrap it to guard elk
    if (typeof window.runLayout === 'function' && !window.__RUNLAYOUT_PATCHED__){
      const origRunLayout = window.runLayout;
      window.runLayout = function(name, dir){
        try{
          if (String(name).toLowerCase() === 'elk'){
            try { return origRunLayout(name, dir); }
            catch(e){ console.warn('[CLD init] runLayout(elk) failed; fallback to dagre', e); return origRunLayout('dagre', 'LR'); }
          }
          return origRunLayout(name, dir);
        }catch(e2){ try{ return origRunLayout('dagre','LR'); }catch(_){ /* noop */ } }
      };
      window.__RUNLAYOUT_PATCHED__ = true;
    }
  } catch(_){ }

  // Dev-only: attempt validation of elements in store after first graph ready
  try{
    document.addEventListener('cld:ready', function(){
      try{
        const gs = window.graphStore && window.graphStore.graph;
        if (gs && window.CLD_VALIDATE && typeof window.CLD_VALIDATE.validateElements === 'function'){
          window.CLD_VALIDATE.validateElements({ elements:{ nodes: gs.nodes||[], edges: gs.edges||[] } });
        }
      }catch(_){ }
    }, { once:true });
  }catch(_){ }
})();

// Attach a resilient model switcher that uses the normalized loader
// to avoid bad relative paths (e.g., /water/data -> /data)
(function(){
  function attachModelSwitcher(){
    try{
      var sw = document.getElementById('model-switch');
      if (!sw) return;
      async function load(url){
        try{
          var fn = (window && window.CLD_LOAD_MODEL);
          var boot = (window && (window.CLD_LOADER || window.LOADER));
          if (!fn || !(boot && boot.bootstrap)) return;
          var m = await fn(url);
          try { window.rawModel = window.rawModel || m; } catch(_){ }
          boot.bootstrap({ cy: window.cy, layout: null, model: m });
        }catch(e){ console.error('[CLD init] model load failed', e); }
      }
      if (!sw.__CLD_PATCHED__){
        sw.addEventListener('change', function(){ load(sw.value); });
        sw.__CLD_PATCHED__ = true;
      }
      if (sw.value) load(sw.value);
    }catch(_){ }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attachModelSwitcher, { once:true });
  } else {
    attachModelSwitcher();
  }
})();
