/**
 * صفحه اصلی - مدیریت Loading برای صفحات معمولی
 * این اسکریپت برای صفحاتی که نیاز به loading state دارند استفاده می‌شود
 */

(function() {
  'use strict';

  /**
   * Dynamic Stylesheet Helper - CSP compliant
   */
  const dynamicStyleSheet = (() => {
    const style = document.createElement('style');
    style.id = 'page-loading-dynamic-styles';
    document.head.appendChild(style);
    return style.sheet;
  })();

  let styleRuleCounter = 0;

  function setDynamicStyles(element, styles) {
    if (!element.id) {
      element.id = 'page-dynamic-el-' + (++styleRuleCounter);
    }

    const cssProps = Object.entries(styles)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; ');

    const rule = `#${element.id} { ${cssProps}; }`;

    try {
      dynamicStyleSheet.insertRule(rule, dynamicStyleSheet.cssRules.length);
    } catch (e) {
      console.warn('Failed to insert dynamic style rule:', e);
    }
  }

  // فقط در صورتی که LoadingManager موجود باشد
  if (!window.LoadingManager) {
    console.warn('LoadingManager not found - skipping page loading');
    return;
  }

  // ایجاد instance
  const pageLoader = new window.LoadingManager({
    minDisplayTime: 200,
    fadeOutDuration: 300,
    progressSimulation: true
  });

  // نمایش loading برای صفحات با محتوای سنگین
  const heavyPages = ['water/insights', 'electricity/', 'gas/', 'amaayesh/'];
  const currentPath = window.location.pathname;
  const isHeavyPage = heavyPages.some(page => currentPath.includes(page));

  if (isHeavyPage) {
    // نمایش loading
    pageLoader.show('default', 'در حال بارگذاری محتوا...');

    // پنهان کردن بعد از load
    window.addEventListener('load', () => {
      setTimeout(() => {
        pageLoader.completeProgress();
        setTimeout(() => pageLoader.hide(), 400);
      }, 200);
    });

    // Fallback timeout
    setTimeout(() => {
      if (pageLoader.overlay) {
        pageLoader.hide(true);
      }
    }, 15000);
  }

  // Lazy loading برای تصاویر
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const skeleton = img.previousElementSibling;

          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }

          img.addEventListener('load', () => {
            if (skeleton && skeleton.classList.contains('skeleton')) {
              skeleton.remove();
            }
            img.classList.add('loaded');
          });

          observer.unobserve(img);
        }
      });
    });

    // مشاهده تمام تصاویر با data-src
    document.addEventListener('DOMContentLoaded', () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        // اضافه کردن skeleton
        if (!img.previousElementSibling || !img.previousElementSibling.classList.contains('skeleton')) {
          const skeleton = document.createElement('div');
          skeleton.className = 'skeleton skeleton-rect';
          setDynamicStyles(skeleton, {
            'height': img.height ? img.height + 'px' : '200px'
          });
          img.classList.add('loading-display-none');
          img.parentNode.insertBefore(skeleton, img);
        }

        imageObserver.observe(img);
      });
    });
  }

  // Skeleton برای data cards در صفحه اصلی
  document.addEventListener('DOMContentLoaded', () => {
    const dataCards = document.querySelectorAll('.data-card');

    dataCards.forEach(card => {
      // اضافه کردن کلاس loading به کارت‌ها
      card.classList.add('loading');

      // حذف کلاس loading بعد از بارگذاری
      setTimeout(() => {
        card.classList.remove('loading');
        card.classList.add('loading-card-fadein');
      }, 100 + Math.random() * 200);
    });
  });

  // Export برای استفاده در سایر اسکریپت‌ها
  window.pageLoader = pageLoader;

})();
