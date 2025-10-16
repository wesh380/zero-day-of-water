// docs/assets/js/nav-prune.js
(function () {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();

  function removeLeftMostSecurityPolicy() {
    // کاندیداها: فقط آیتم‌های داخل هدر
    const candidates = Array.from(
      document.querySelectorAll(
        'header a, header button, .site-header a, .site-header button'
      )
    ).filter(el => norm(el.textContent) === 'سیاست امنیت');

    if (candidates.length <= 1) return; // اگر یکی یا هیچ است، کاری نکن (راستی‌آزمایی)

    // چپ‌ترین را بر اساس مختصات x حذف کن (برای RTL هم معتبر است: چپ‌ترین در ویوپورت)
    let leftMost = candidates[0];
    let minX = leftMost.getBoundingClientRect().x;

    for (let i = 1; i < candidates.length; i++) {
      const x = candidates[i].getBoundingClientRect().x;
      if (x < minX) {
        minX = x;
        leftMost = candidates[i];
      }
    }

    // فقط همان مورد چپ را حذف کن؛ بقیه بمانند
    leftMost.remove();
  }

  // اجرا یک‌بار و پس از آماده شدن DOM (درصورت دیر لود شدن هدر)
  removeLeftMostSecurityPolicy();
  document.addEventListener('DOMContentLoaded', removeLeftMostSecurityPolicy);
})();
