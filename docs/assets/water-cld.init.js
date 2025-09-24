const waitForVisible = (selector, opts) => {
  const timeoutValue = typeof opts === 'number' ? opts : (opts && typeof opts.timeout === 'number' ? opts.timeout : undefined);
  if (typeof window !== 'undefined' && typeof window.waitForVisible === 'function') {
    const duration = typeof timeoutValue === 'number' ? timeoutValue : 5000;
    return window.waitForVisible(selector, duration);
  }
  const limit = typeof timeoutValue === 'number' ? timeoutValue : 5000;
  return new Promise((resolve, reject) => {
    const startedAt = performance.now();
    (function tick() {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) {
        resolve(el);
        return;
      }
      if (performance.now() - startedAt > limit) {
        reject(new Error('waitForVisible timeout: ' + selector));
        return;
      }
      requestAnimationFrame(tick);
    })();
  });
};
const OFFLINE_BADGE_ID = 'cld-offline-badge';
const OFFLINE_BADGE_TEXT = 'Offline \u2013 Read-only';
const OFFLINE_BUTTON_SELECTORS = ['#btn-run', '#scn-compare-toggle', '#scn-pin'];
let offlineActive = false;
let offlineStyleEl = null;

function ensureOfflineStyle() {
  if (offlineStyleEl) return;
  offlineStyleEl = document.createElement('style');
  offlineStyleEl.textContent = '.cld-offline-badge{position:fixed;bottom:16px;right:16px;padding:6px 12px;border-radius:9999px;background:#dc2626;color:#fff;font-size:12px;font-weight:600;letter-spacing:0.02em;z-index:2147483000;box-shadow:0 8px 18px rgba(15,23,42,0.25);} .cld-offline-disabled{opacity:0.45 !important;pointer-events:none !important;cursor:not-allowed !important;}';
  if (document.head) {
    document.head.appendChild(offlineStyleEl);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.head && document.head.appendChild(offlineStyleEl), { once: true });
  }
}

function getOfflineBadge() {
  ensureOfflineStyle();
  let badge = document.getElementById(OFFLINE_BADGE_ID);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = OFFLINE_BADGE_ID;
    badge.className = 'cld-offline-badge';
    badge.textContent = OFFLINE_BADGE_TEXT;
    if (document.body) {
      document.body.appendChild(badge);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body && document.body.appendChild(badge), { once: true });
    }
  }
  return badge;
}

function renderOfflineBadge(active) {
  const badge = document.getElementById(OFFLINE_BADGE_ID);
  if (active) {
    const el = getOfflineBadge();
    if (el) el.textContent = OFFLINE_BADGE_TEXT;
  } else if (badge) {
    badge.remove();
  }
}

function disableActionButtons(disabled) {
  OFFLINE_BUTTON_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      try {
        if ('disabled' in el) {
          el.disabled = disabled;
        }
        if (disabled) {
          el.setAttribute('aria-disabled', 'true');
        } else {
          el.removeAttribute('aria-disabled');
        }
        el.classList.toggle('cld-offline-disabled', disabled);
      } catch (err) {
        // ignore toggle failures
      }
    });
  });
}

function applyOfflineState(active) {
  offlineActive = !!active;
  if (offlineActive) {
    renderOfflineBadge(true);
    disableActionButtons(true);
  } else {
    renderOfflineBadge(false);
    disableActionButtons(false);
  }
}

function isOfflineEventRelevant(detail) {
  if (!detail || typeof detail !== 'object') {
    return true;
  }
  let path = '';
  if (typeof detail.path === 'string') {
    path = detail.path;
  }
  if (!path) {
    return true;
  }
  try {
    path = new URL(path, window.location.origin).pathname || path;
  } catch (_) {
    // ignore URL parsing errors and use the raw path
  }
  return path.indexOf('/api/submit') !== -1 || path.indexOf('/api/result') !== -1;
}
window.addEventListener('api:offline', (event) => {
  const detail = event && event.detail ? event.detail : {};
  console.error('[CLD] API offline', detail.path || '', detail.error || detail);
  if (!isOfflineEventRelevant(detail)) {
    return;
  }
  applyOfflineState(true);
});

window.addEventListener('api:online', () => {
  applyOfflineState(false);
});

if (typeof MutationObserver !== 'undefined') {
  const offlineObserver = new MutationObserver(() => {
    if (offlineActive) disableActionButtons(true);
  });
  offlineObserver.observe(document.documentElement, { childList: true, subtree: true });
}

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
  if (typeof window!=="undefined" && window.CLD_CORE){ if (window.__CLD_DEBUG__) try{ console.log("[DEBUG guard] facade present, skip legacy patches"); }catch(_){ } return; }
    // If a core facade is present, skip legacy runtime patches
    if (window.CLD_CORE) return;
    const cy = getCy();
    if (cy) {
      if (window.__CLD_DEBUG__) console.log("[CLD] bundle loaded -> cy ready", {
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
  // Minimal cy builder to break init cycles when the bundle hasn't created one yet
  function ensureCy(){
    const container = document.getElementById('cy');
    if (!container) throw new Error("[CLD] #cy not found");
    if (container.dataset.cyMounted === "1" && window.__cy && !window.__cy.destroyed) return window.__cy;
    const cy = window.cytoscape({ container, elements: [] });
    container.dataset.cyMounted = "1";
    window.__cy = cy;
    return cy;
  }
  function attachModelSwitcher(){
    try{
      var sw = document.getElementById('model-switch');
      if (!sw) return;
      // inline minimal loader to avoid races with module scripts
      function norm(candidate){
        try{
          if (!candidate) return null;
          if (/^https?:\/\//i.test(candidate)) return candidate;
          if (candidate.startsWith('/')) return candidate;
          var u = new URL(candidate, location.href);
          if (u.pathname.indexOf('/water/data/') === 0) return '/data/' + u.pathname.slice('/water/data/'.length);
          return u.pathname;
        }catch(_){ return candidate; }
      }
      async function loadModelAndMount(url){
        const json = await fetch(url, {cache:'no-cache'}).then(r=>r.json());
        const el = document.getElementById('cy');
        if (window.__CLD_DEBUG__) {
          try{ console.debug("[CLD init] pre-visible", { w: el?.offsetWidth, h: el?.offsetHeight, display: getComputedStyle(el).display }); }catch(_){ }
        }
        await waitForVisible('#cy', 15000);
        const cy = ensureCy();
        const elements = (window.CLD_MAP && typeof window.CLD_MAP.coerceElements === 'function') ? window.CLD_MAP.coerceElements(json) : [];
        const rawNodes = Array.isArray(json.nodes) ? json.nodes.length : Array.isArray(json.elements?.nodes) ? json.elements.nodes.length : elements.filter(e=>e.group==='nodes').length;
        const rawEdges = Array.isArray(json.edges) ? json.edges.length : Array.isArray(json.elements?.edges) ? json.elements.edges.length : elements.filter(e=>e.group==='edges').length;
        console.log('[CLD]', { rawNodes, rawEdges });
        if (window.__CLD_DEBUG__) {
          try{ console.debug("[CLD init] pre-add", { container: { w: el.offsetWidth, h: el.offsetHeight }, nodes: Array.isArray(json.nodes) ? json.nodes.length : Array.isArray(json.elements?.nodes) ? json.elements.nodes.length : elements.filter(e=>e.group==='nodes').length, edges: Array.isArray(json.edges) ? json.edges.length : Array.isArray(json.elements?.edges) ? json.elements.edges.length : elements.filter(e=>e.group==='edges').length }); }catch(_){ }
        }
        if (window.CLD_CORE?.initCore) window.CLD_CORE.initCore({ cy });

        const boot = (window.CLD_LOADER || window.LOADER);
        if (boot?.bootstrap) { try{ boot.bootstrap({ cy, model: json, layout: null }); }catch(e){ console.warn("[CLD] boot warn", e); } }

        let tries=0;
        (function apply(){
          const ready = window.CLD_CORE?.setModel && window.CLD_CORE?.getCy;
          if (ready){
            try{
              window.CLD_CORE.setModel(json);
              const c = window.CLD_CORE.getCy() || cy;
              if (window.__CLD_DEBUG__) {
                try{ console.debug("[CLD init] after add", { size: c.elements().size(), nodes: c.nodes().length, edges: c.edges().length }); }catch(_){ }
                if (c.elements().size() === 0) {
                  try{ console.warn("[CLD init] empty graph after add", { sample: elements && elements[0] }); }catch(_){ }
                }
              }
              c?.resize(); c?.fit(undefined, 24);
              const cyStats = { cyNodes: c.nodes().length, cyEdges: c.edges().length };
              console.log('[CLD] added to cy', cyStats);
              if (!cyStats.cyNodes || !cyStats.cyEdges) console.warn('[CLD] mount:empty', cyStats);
              if (window.__CLD_DEBUG__) {
                try{ const bb = c.elements().boundingBox(); console.debug("[CLD init] layout done", { bbox: bb, zoom: c.zoom(), center: c.center() }); }catch(_){ }
              }
            }catch(e){ console.error("[CLD] setModel error", e); }
          } else if (tries++ < 120){ setTimeout(apply, 100); } else {
            console.error("[CLD] core not ready to set model");
          }
        }());
      }
      function selectedUrl(){
        try{
          var opt = sw.options[sw.selectedIndex];
          var base = opt ? opt.value : sw.value;
          var ver = opt && opt.dataset ? opt.dataset.version : null;
          var full = ver ? base + '?v=' + ver : base;
          return norm(full);
        }catch(_){ return norm(sw.value); }
      }
      if (!sw.__CLD_PATCHED__){
        sw.addEventListener('change', function(){ loadModelAndMount(selectedUrl()); });
        sw.__CLD_PATCHED__ = true;
      }
      var initUrl = selectedUrl();
      if (initUrl) loadModelAndMount(initUrl);
    }catch(_){ }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attachModelSwitcher, { once:true });
  } else {
    attachModelSwitcher();
  }
})();

// Resize/visibility hooks to keep the graph fit when container changes
const doResize = () => {
  const c = window.CLD_CORE?.getCy?.() || window.__cy;
  if (c) {
    c.resize();
    c.fit(undefined, 24);
  }
};
window.addEventListener('resize', doResize);
document.addEventListener('transitionend', () => {
  const el = document.getElementById('cy');
  if (el?.offsetParent !== null) doResize();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) doResize();
});
