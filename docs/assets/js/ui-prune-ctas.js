(function () {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();

  // 1) حذف CTA وسط با عنوان «ماشین‌حساب (آزمایشی)» در خارج از هدر
  document.querySelectorAll('a,button').forEach(el => {
    const text = norm(el.textContent);
    if (text === 'ماشین‌حساب (آزمایشی)') {
      const inHeader = !!el.closest('header, .site-header');
      if (!inHeader) {
        // اگر داخل یک کارت/کانتینر قرار دارد همان کانتینر را حذف کن
        const card = el.closest('.card, .section, .cta, .hero-cta, .container, .panel') || el;
        card.remove();
      }
    }
  });

  // 2) حذف «ورود به داشبورد» در هدر (سایت‌گسترده)
  const killHeaderButton = () => {
    document.querySelectorAll('header a, header button, .site-header a, .site-header button').forEach(el => {
      const text = norm(el.textContent);
      const href = (el.getAttribute('href') || '').toLowerCase();
      if (text === 'ورود به داشبورد' || href.endsWith('/dashboard/') || href.endsWith('/dashboards/') || href.includes('/dashboard')) {
        el.remove();
      }
    });
  };
  // یک‌بار و سپس بعد از رندر تنبل هدر (درصورت دیرلودشدن)
  killHeaderButton();
  document.addEventListener('DOMContentLoaded', killHeaderButton);
})();
