/**
 * Suppress Cloudflare Beacon Loading Errors
 *
 * این اسکریپت خطاهای مربوط به بارگذاری beacon.min.js را در کنسول پنهان می‌کند
 * این خطاها معمولاً توسط ad-blocker ها ایجاد می‌شوند و مشکلی برای عملکرد سایت ندارند
 */
(function() {
  'use strict';

  // ذخیره reference اصلی console.error
  const originalConsoleError = console.error.bind(console);

  // Override console.error
  console.error = function() {
    const args = Array.prototype.slice.call(arguments);
    const errorMessage = args.join(' ');

    // اگر خطا مربوط به cloudflareinsights یا beacon است، آن را نشان نده
    if (errorMessage.includes('cloudflareinsights.com') ||
        errorMessage.includes('beacon.min.js') ||
        errorMessage.includes('ERR_CONNECTION_CLOSED')) {
      // خطا را log نمی‌کنیم
      return;
    }

    // سایر خطاها را به صورت عادی نمایش بده
    originalConsoleError.apply(console, args);
  };

  // مدیریت خطاهای network در سطح window
  window.addEventListener('error', function(e) {
    // اگر خطا مربوط به بارگذاری beacon است
    if (e.target && e.target.src && e.target.src.includes('cloudflareinsights.com')) {
      // جلوگیری از نمایش خطا در کنسول
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // مدیریت promise rejection ها
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.toString().includes('cloudflareinsights.com')) {
      e.preventDefault();
      return false;
    }
  });

})();
