// docs/assets/js/nav-prune.js
(function () {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();

  function removeOnlyLeftMostSecurityPolicy() {
    // همهٔ کاندیداهای هدر با متن «سیاست امنیت»
    const nodes = Array.from(
      document.querySelectorAll('header a, header button, .site-header a, .site-header button')
    ).filter(el => norm(el.textContent) === 'سیاست امنیت');

    if (nodes.length < 2) return; // اگر فقط یکی/هیچ‌کدام، کاری نکن

    // چپ‌ترین بر اساس مختصات X در ویوپورت (در RTL هم معتبر است)
    let leftMost = nodes[0];
    let minX = leftMost.getBoundingClientRect().x;
    for (let i = 1; i < nodes.length; i++) {
      const x = nodes[i].getBoundingClientRect().x;
      if (x < minX) { minX = x; leftMost = nodes[i]; }
    }

    // فقط همان نمونهٔ چپ را حذف کن
    leftMost.remove();
  }

  // صبر کن تا هدر واقعاً رندر شود (برخی صفحات هدر را دیر می‌سازند)
  let tries = 0;
  const tick = () => {
    const any = document.querySelector('header .nav-link, .site-header .nav-link, header a, header button');
    if (any || tries > 40) { // ~2ثانیه با rAF
      removeOnlyLeftMostSecurityPolicy();
      return;
    }
    tries++;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // در تغییر اندازه هم ایمن بماند (layout می‌لغزد)
  window.addEventListener('resize', () => {
    // اگر هنوز دو نمونه وجود داشته باشد، بازهم فقط چپ را حذف می‌کنیم
    removeOnlyLeftMostSecurityPolicy();
  }, { passive: true });
})();
