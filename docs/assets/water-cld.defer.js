(function () {
  var existing = document.querySelector('script[data-cld-bundle]');
  if (existing) { console.log('[CLD defer] bundle tag already in DOM:', existing.src); return; }

  var candidates = (Array.isArray(window.CLD_BUNDLE_URLS) && window.CLD_BUNDLE_URLS.length)
    ? window.CLD_BUNDLE_URLS
    : ['../assets/dist/water-cld.bundle.js?v=3', './assets/dist/water-cld.bundle.js?v=3'];

  function tryLoad(i) {
    if (i >= candidates.length) {
      console.error('[CLD defer] failed from all candidates:', candidates);
      return;
    }
    var url = new URL(candidates[i], location.href).href;
    var s = document.createElement('script');
    s.setAttribute('data-cld-bundle', 'true');
    s.defer = true;
    s.src = url;
    s.onload = function () {
      console.log('[CLD defer] bundle loaded OK:', url, 'CLD_SAFE=', !!window.CLD_SAFE);
      document.dispatchEvent(new Event('cld:bundle:loaded'));
    };
    s.onerror = function () {
      console.warn('[CLD defer] bundle load failed:', url, '→ next…');
      tryLoad(i + 1);
    };
    console.debug('[CLD defer] trying:', url);
    document.head.appendChild(s);
  }
  tryLoad(0);
})();

