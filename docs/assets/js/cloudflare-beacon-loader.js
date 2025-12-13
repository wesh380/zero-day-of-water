/**
 * Statsfa Website Analytics Loader
 * بارگذاری فقط روی دامنه‌های تولید و با مدیریت بی‌صدا در صورت خطا
 */
(function() {
  'use strict';

  const PROD_DOMAIN = 'wesh360.ir';
  const STATSFA_SCRIPT_URL = 'https://statsfa.com/js/script.js';

  function isProductionHost(hostname) {
    if (!hostname) return false;
    return hostname === PROD_DOMAIN || hostname.endsWith('.' + PROD_DOMAIN);
  }

  /**
   * بارگذاری امن اسکریپت Statsfa Analytics
   */
  function loadStatsfaSafely() {
    if (!isProductionHost(window.location.hostname)) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = STATSFA_SCRIPT_URL;
    script.id = 'ZwSg9rf6GA';
    script.setAttribute('data-host', 'https://statsfa.com');
    script.setAttribute('data-dnt', true);

    // مدیریت خطاها بدون ایجاد نویز کنسول
    script.onerror = function() {};

    // اضافه کردن اسکریپت به DOM
    document.body.appendChild(script);
  }

  // بارگذاری پس از بارگذاری کامل DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStatsfaSafely);
  } else {
    loadStatsfaSafely();
  }
})();
