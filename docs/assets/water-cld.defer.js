// Lightweight loader to insert the CLD bundle script with simple fallback paths
(function () {
  // 0) If a bundle tag already exists with data-cld-bundle, respect it and stop
  var pre = document.querySelector('script[data-cld-bundle]');
  if (pre && pre.src) {
    console.log('[CLD defer] bundle tag already in DOM:', pre.src);
    return;
  }

  // 1) Allow per-tag override on THIS defer script
  var cur = (function(){ try{ return document.currentScript; }catch(_){ return null; } })();
  var tagUrl = (cur && cur.getAttribute && cur.getAttribute('data-cld-bundle')) || null;

  // 2) Allow global overrides
  var globalUrl = (typeof window !== 'undefined' && window.CLD_BUNDLE_URL) || null;
  var globalUrls = (typeof window !== 'undefined' && window.CLD_BUNDLE_URLS);

  // 3) Build candidate list (absolute first, then relatives)
  var candidates = [];
  if (tagUrl) {
    candidates = [tagUrl];
  } else if (globalUrl && typeof globalUrl === 'string') {
    candidates = [globalUrl];
  } else if (Array.isArray(globalUrls) && globalUrls.length) {
    candidates = globalUrls.slice();
  } else {
    try {
      var abs = location.origin + '/assets/dist/water-cld.bundle.js?v=3';
      var rel1 = new URL('assets/dist/water-cld.bundle.js?v=3', document.baseURI).href;
      var rel2 = new URL('../assets/dist/water-cld.bundle.js?v=3', document.baseURI).href;
      candidates = [abs, rel1, rel2];
    } catch(_) {
      candidates = ['/assets/dist/water-cld.bundle.js?v=3'];
    }
  }

  function tryLoad(i) {
    if (i >= candidates.length) {
      console.error('[CLD defer] failed from all candidates:', candidates);
      return;
    }
    var src = candidates[i] || '';
    var url = (function(u){ try { return new URL(u, location.href).href; } catch(_) { return String(u||''); } })(src);
    var s = document.createElement('script');
    s.setAttribute('data-cld-bundle', 'true');
    s.defer = true; // kept for consistency
    s.src = url;
    s.onload = function () {
      console.log('[CLD defer] bundle loaded OK:', url);
      try { document.dispatchEvent(new Event('cld:bundle:loaded')); } catch(_){}
    };
    s.onerror = function () {
      console.warn('[CLD defer] bundle load failed:', url, '-> next');
      tryLoad(i + 1);
    };
    console.log('[CLD defer] trying:', url);
    document.head.appendChild(s);
  }
  tryLoad(0);
})();

