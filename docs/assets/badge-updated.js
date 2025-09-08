import { setClass } from './css-classes.js';

(function () {
  'use strict';

  const JSON_URL = (function () {
    // مسیر نسبی را بر اساس عمق صفحه تعیین کن
    // (صفحات ریشه docs/ => ./assets/ ... ، صفحات زیرشاخه مثل electricity/ => ../assets/ ...)
    const depth = (location.pathname.match(/\//g) || []).length;
    return (depth > 2 ? '../'.repeat(depth - 2) : './') + 'assets/last-updated.json';
  })();

  const SECTION_KEY = (function () {
    // 1) اگر متا داشتیم از آن بخوان
    const meta = document.querySelector('meta[name="section"]');
    if (meta && meta.content) return meta.content.trim();
    // 2) وگرنه از سگمنت اول مسیر استفاده کن (electricity / water / gas)
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return seg || 'site';
  })();

  const SELECTORS = [
    '.card', '.dashboard-card', '.nt-card',
    '[class*="card"]', '[id*="card"]', // fallback عمومی
    '[data-badge]'     // اگر کارت‌ها نشانه‌گذاری شده باشند
  ].join(',');

  function makeBadge(text) {
    const span = document.createElement('span');
    span.className = [
      'inline-flex','items-center','gap-1',
      'rounded-full','border','border-gray-300/60',
      'px-2','py-0.5','text-xs','font-medium',
      'bg-white/60','backdrop-blur','text-gray-700',
      'rtl'
    ].join(' ');
    span.setAttribute('dir', 'rtl');
    span.innerHTML = `آخرین به‌روزرسانی: <time>${text}</time>`;
    return span;
  }

  function injectBadges(labelText) {
    const cards = Array.from(document.querySelectorAll(SELECTORS));
    cards.forEach((card) => {
      // اگر کارت خودش کلید خاصی خواست:
      const key = card.getAttribute('data-updated-key');
      const ownText = key && window.__WESH_UPDATED__ && window.__WESH_UPDATED__[key]
        ? (window.__WESH_UPDATED__[key].label || window.__WESH_UPDATED__[key].iso)
        : null;

      const badge = makeBadge(ownText || labelText);

      // جای‌گذاری: گوشه‌ی بالا-چپ یا داخل هدر کارت اگر وجود داشت
      const header = card.querySelector('.card-header, header, .head, [data-card-header]');
      if (header) {
        header.appendChild(badge);
      } else {
        // گوشه‌ی کارت بدون به‌هم‌ریختگی
        setClass(card, ['relative']);
        setClass(badge, ['badge-pos']);
        card.appendChild(badge);
      }
    });
  }

  fetch(JSON_URL, { cache: 'no-cache' })
    .then(r => r.json())
    .then((data) => {
      window.__WESH_UPDATED__ = data;
      const entry = data[SECTION_KEY] || data['site'];
      const label = entry ? (entry.label || entry.iso) : 'نامشخص';
      injectBadges(label);
    })
    .catch(() => {
      // fallback: از meta[name="last-updated"] یا document.lastModified
      const meta = document.querySelector('meta[name="last-updated"]');
      const fallback = meta?.content || new Date(document.lastModified).toISOString().slice(0,10);
      injectBadges(fallback);
    });
})();
