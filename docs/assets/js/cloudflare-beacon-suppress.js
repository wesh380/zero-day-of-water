(function () {
  'use strict';

  // Suppress Cloudflare Beacon errors without using inline scripts to satisfy CSP
  window.addEventListener(
    'error',
    function (event) {
      const targetSrc = event?.target?.src;
      if (!targetSrc) return;

      if (targetSrc.includes('statsfa.com') || targetSrc.includes('beacon.min.js')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true,
  );
})();
