// Lightweight loader to insert the CLD bundle script (root-absolute with safe detection)
(function () {
  var cur = (function(){ try{ return document.currentScript; }catch(_){ return null; } })();
  var v = 'v=3';
  // 1) Prefer data-cld-bundle on this defer tag, then global
  var bundleUrl = (cur && cur.getAttribute && cur.getAttribute('data-cld-bundle'))
               || (typeof window!=='undefined' && window.CLD_BUNDLE_URL)
               || null;
  if (!bundleUrl) bundleUrl = location.origin + '/assets/dist/water-cld.bundle.js?' + v;

  // 2) Detect real bundle presence (ignore defer tag itself). Match path ending with /assets/dist/water-cld.bundle.js
  var hasBundleTag = false;
  try {
    var scripts = Array.prototype.slice.call(document.scripts || []);
    hasBundleTag = scripts.some(function(s){
      var src = (s && s.src) || '';
      try { src = new URL(src, location.href).href; } catch(_){}
      var plain = src.split('?')[0];
      return plain.endsWith('/assets/dist/water-cld.bundle.js');
    });
  } catch(_){}

  if (hasBundleTag) {
    console.log('[CLD defer] bundle already present:', bundleUrl);
    try { window.dispatchEvent(new Event('cld:bundle:loaded')); } catch(_){}
    return;
  }

  // 3) Inject bundle script
  console.log('[CLD defer] trying bundle:', bundleUrl);
  var s = document.createElement('script');
  s.setAttribute('data-cld-bundle', 'true');
  s.defer = true;
  s.src = bundleUrl;
  s.onload = function(){
    console.log('[CLD defer] bundle loaded OK:', bundleUrl);
    try { window.dispatchEvent(new Event('cld:bundle:loaded')); } catch(_){}
  };
  s.onerror = function(){
    console.warn('[CLD defer] bundle load failed:', bundleUrl);
  };
  document.head.appendChild(s);
})();

