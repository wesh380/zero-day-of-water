/**
 * Cloudflare Web Analytics Beacon Loader
 * با error handling برای جلوگیری از خطاهای کنسول در صورت بلاک شدن توسط ad-blocker
 */
(function() {
  'use strict';

  // تنظیمات Cloudflare Beacon
  const BEACON_CONFIG = {
    token: '9e1a59b59254492b858c1d1d730c72c7',
    spa: false
  };

  const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';

  /**
   * بارگذاری امن اسکریپت Cloudflare Beacon
   */
  function loadBeaconSafely() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = BEACON_URL;
    script.setAttribute('data-cf-beacon', JSON.stringify(BEACON_CONFIG));

    // مدیریت خطاها
    script.onerror = function() {
      // خطا را silent می‌کنیم - احتمالاً ad-blocker فعال است
      // هیچ پیامی در کنسول نمایش نمی‌دهیم چون این مشکل client-side است
      console.debug('Cloudflare Analytics: Unable to load (blocked by ad-blocker or network)');
    };

    // بررسی موفقیت‌آمیز بودن بارگذاری
    script.onload = function() {
      console.debug('Cloudflare Analytics: Loaded successfully');
    };

    // اضافه کردن اسکریپت به DOM
    document.body.appendChild(script);
  }

  // بارگذاری پس از بارگذاری کامل DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBeaconSafely);
  } else {
    loadBeaconSafely();
  }
})();
