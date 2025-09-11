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
      var s = document.createElement('script');
      s.defer = true;
      s.src = url;
      s.onload = function(){ resolve({ ok:true, url:url }); };
      s.onerror = function(){ resolve({ ok:false, url:url }); };
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
    // Load mapper + validator first (optional but recommended)
    await tryScripts([A+'cld-mapper.js', B+'cld-mapper.js']);
    await tryScripts([A+'cld-validate.js', B+'cld-validate.js']);
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

    // Load the CLD bundle (deferred loader picks the right path)
    await tryScripts([A+'water-cld.defer.js', B+'water-cld.defer.js']);
    // Init hooks / debug listeners
    await tryScripts([A+'water-cld.init.js', B+'water-cld.init.js']);
  })();
})();
