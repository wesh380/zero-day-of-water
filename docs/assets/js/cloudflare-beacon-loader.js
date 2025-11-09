/**
 * Statsfa Website Analytics Loader
 * با error handling برای جلوگیری از خطاهای کنسول در صورت بلاک شدن توسط ad-blocker
 */
(function() {
  'use strict';

  // تنظیمات Statsfa Analytics
  const STATSFA_CONFIG = {
    host: 'https://statsfa.com',
    id: 'ZwSg9rf6GA',
    dnt: true
  };

  const STATSFA_SCRIPT_URL = 'https://statsfa.com/js/script.js';

  /**
   * بارگذاری امن اسکریپت Statsfa Analytics
   */
  function loadStatsfaSafely() {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = STATSFA_SCRIPT_URL;
    script.id = STATSFA_CONFIG.id;
    script.setAttribute('data-host', STATSFA_CONFIG.host);
    script.setAttribute('data-dnt', STATSFA_CONFIG.dnt);

    // مدیریت خطاها
    script.onerror = function() {
      // خطا را silent می‌کنیم - احتمالاً ad-blocker فعال است
      // هیچ پیامی در کنسول نمایش نمی‌دهیم چون این مشکل client-side است
      console.debug('Statsfa Analytics: Unable to load (blocked by ad-blocker or network)');
    };

    // بررسی موفقیت‌آمیز بودن بارگذاری
    script.onload = function() {
      console.debug('Statsfa Analytics: Loaded successfully');
    };

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
