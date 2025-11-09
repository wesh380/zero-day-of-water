/**
 * Suppress Analytics Script Loading Errors
 *
 * این اسکریپت خطاهای مربوط به بارگذاری اسکریپت آمارگیری را در کنسول پنهان می‌کند
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

    // اگر خطا مربوط به اسکریپت آمارگیری است، آن را نشان نده
    if (errorMessage.includes('statsfa.com') ||
        errorMessage.includes('script.js') ||
        errorMessage.includes('ERR_CONNECTION_CLOSED')) {
      // خطا را log نمی‌کنیم
      return;
    }

    // سایر خطاها را به صورت عادی نمایش بده
    originalConsoleError.apply(console, args);
  };

  // مدیریت خطاهای network در سطح window
  window.addEventListener('error', function(e) {
    // اگر خطا مربوط به بارگذاری اسکریپت آمارگیری است
    if (e.target && e.target.src && e.target.src.includes('statsfa.com')) {
      // جلوگیری از نمایش خطا در کنسول
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // مدیریت promise rejection ها
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.toString().includes('statsfa.com')) {
      e.preventDefault();
      return false;
    }
  });

})();
