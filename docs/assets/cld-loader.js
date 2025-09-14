(function(){
  // Only run on pages that actually have the CLD container
  var cyEl = document.getElementById('cy');
  if (!cyEl) return; // no-op when page has no CLD

  // Prevent double-initialization
  if (document.querySelector('script[data-cld-sentinel]')) return;

  // Helper: add or ensure a <link rel="stylesheet"> tag
  function ensureCss(hrefs){
    var list = Array.isArray(hrefs) ? hrefs : [hrefs];
    for (var i=0;i<list.length;i++){
      var href = list[i];
      if (!href) continue;
      var exists = Array.prototype.some.call(document.styleSheets || [], function(ss){
        try{ return (ss.href||'').includes('water-cld.bundle.css') || (ss.href||'').includes('water-cld.css'); }catch(_){ return false; }
      });
      if (exists) return; // already present
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-cld-auto', 'true');
      document.head.appendChild(link);
      return; // only add the first that works for path
    }
  }

  // Helper: add a <script> with onload/onerror and return a Promise
  function loadScript(url){
    return new Promise(function(resolve){
      var abs = new URL(url, location.href).href;
      if (document.querySelector('script[src="'+abs+'"]')) {
        return resolve({ ok:true, url:abs, skipped:true });
      }
      var s = document.createElement('script');
      s.defer = true;
      s.src = abs;
      s.onload = function(){ resolve({ ok:true, url:abs }); };
      s.onerror = function(){ resolve({ ok:false, url:abs }); };
      document.head.appendChild(s);
    });
  }

  // Helper: try multiple candidate URLs until one loads
  async function tryScripts(candidates){
    for (var i=0;i<candidates.length;i++){
      var res = await loadScript(candidates[i]);
      if (res.ok) return res.url;
    }
    return null;
  }

  // Resolve paths relative to current page; try both ./assets and ../assets
  var A = './assets/';
  var B = '../assets/';

  // Ensure CLD styles (bundle + scoped styles)
  ensureCss([A+'dist/water-cld.bundle.css?v=3', B+'dist/water-cld.bundle.css?v=3']);
  ensureCss([A+'water-cld.css?v=1', B+'water-cld.css?v=1']);

  // Insert a sentinel to avoid reruns
  var sentinel = document.createElement('script');
  sentinel.setAttribute('data-cld-sentinel','true');
  document.head.appendChild(sentinel);

  // Load vendor libs if missing
  var needCy = !(window.cytoscape && typeof window.cytoscape === 'function');
  var needDagre = !(window.dagre);
  var needElk = !(window.elk);

  (async function(){
    // Ensure CLD_CORE APIs exist before bundle usage
    await tryScripts([A+'cld/core/validate.js', B+'cld/core/validate.js']);
    await tryScripts([A+'cld/core/mapper.js', B+'cld/core/mapper.js']);
    await tryScripts([A+'cld/core/inject.js', B+'cld/core/inject.js']);
    await tryScripts([A+'cld/core/index.js', B+'cld/core/index.js']);
    if (needCy) {
      await tryScripts([A+'vendor/cytoscape.min.js', B+'vendor/cytoscape.min.js']);
    }
    // elk is optional; load it for ELK layout support
    if (needElk) {
      await tryScripts([A+'vendor/elk.bundled.js', B+'vendor/elk.bundled.js']);
      await tryScripts([A+'vendor/cytoscape-elk.js', B+'vendor/cytoscape-elk.js']);
    }
    // Load Dagre + its Cytoscape plugin unconditionally (idempotent if already present)
    await tryScripts([A+'vendor/dagre.min.js', B+'vendor/dagre.min.js']);
    await tryScripts([A+'vendor/cytoscape-dagre.js', B+'vendor/cytoscape-dagre.js']);

    (function registerLayouts(){
      try {
        // ELK plugin
        const elkPlugin = window.cytoscapeElk || window['cytoscapeElk'];
        if (window.cytoscape && !window.__ELK_REGISTERED__) {
          const hasElk = !!(window.cytoscape.extensions?.().layout?.elk);
          if (!hasElk && typeof elkPlugin === 'function') {
            window.cytoscape.use(elkPlugin);
          }
          window.__ELK_REGISTERED__ = true;
        }
        // Dagre plugin
        const dagrePlugin = window.cytoscapeDagre || window['cytoscapeDagre'];
        if (window.cytoscape && !window.__DAGRE_REGISTERED__) {
          const hasDagre = !!(window.cytoscape.extensions?.().layout?.dagre);
          if (!hasDagre && typeof dagrePlugin === 'function') {
            window.cytoscape.use(dagrePlugin);
          }
          window.__DAGRE_REGISTERED__ = true;
        }
      } catch (e) {
        console.warn("[CLD] layout register warn", e);
      }
    }());

    // Load the CLD bundle (deferred loader picks the right path)
    await tryScripts([A+'water-cld.defer.js', B+'water-cld.defer.js']);
    // Init hooks / debug listeners
    await tryScripts([A+'water-cld.init.js', B+'water-cld.init.js']);
  })();
})();
