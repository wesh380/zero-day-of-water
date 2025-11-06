/**
 * بهبودهای نمایش گراف CLD
 * این فایل بهبودهای اضافی برای نمایش و خوانایی گراف ارائه می‌دهد
 */

(function() {
  'use strict';

  /**
   * بهبود نمایش نودها بعد از بارگذاری
   */
  function enhanceGraphDisplay(cy) {
    if (!cy || typeof cy.nodes !== 'function') {
      console.warn('[graph-enhancements] Cytoscape instance not ready');
      return;
    }

    // اطمینان از اینکه نودها به اندازه کافی بزرگ هستند
    cy.batch(() => {
      cy.nodes().forEach(node => {
        if (node.isParent && node.isParent()) return;

        // دریافت استایل فعلی
        const currentWidth = node.style('width');
        const currentHeight = node.style('height');

        // اگر خیلی کوچک هستند، بزرگ‌تر کن
        const minWidth = 140;
        const minHeight = 64;

        if (currentWidth && parseFloat(currentWidth) < minWidth) {
          node.style('width', minWidth + 'px');
        }
        if (currentHeight && parseFloat(currentHeight) < minHeight) {
          node.style('height', minHeight + 'px');
        }

        // اضافه کردن class برای نودهایی که label دارند
        if (node.data('label')) {
          node.addClass('has-label');
        }
      });

      // بهبود یال‌ها
      cy.edges().forEach(edge => {
        const sign = edge.data('sign') || edge.data('polarity');

        // اطمینان از اینکه class‌های درست اضافه شده‌اند
        if (sign === '+' && !edge.hasClass('pos')) {
          edge.addClass('pos');
        } else if (sign === '-' && !edge.hasClass('neg')) {
          edge.addClass('neg');
        }
      });
    });

    // تنظیم زوم اولیه مناسب
    setTimeout(() => {
      try {
        const currentZoom = cy.zoom();
        // اگر زوم خیلی کم است، کمی بزرگ‌تر کن
        if (currentZoom < 0.5) {
          cy.zoom({
            level: 0.7,
            position: cy.extent().x1 + (cy.extent().x2 - cy.extent().x1) / 2
          });
        }
        // fit کردن با padding مناسب
        cy.fit(cy.elements(), 50);
      } catch (e) {
        console.warn('[graph-enhancements] Zoom adjustment failed:', e);
      }
    }, 500);

    console.log('[graph-enhancements] Graph display enhanced');
  }

  /**
   * اضافه کردن کنترل‌های زوم بهبود یافته
   */
  function addZoomControls(cy) {
    if (!cy) return;

    // گوش دادن به رویداد زوم برای نمایش/مخفی کردن label‌های یال‌ها
    let zoomTimeout;
    cy.on('zoom', function() {
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        const zoom = cy.zoom();

        // در زوم‌های پایین، label‌های یال‌ها را مخفی کن
        cy.batch(() => {
          if (zoom < 0.6) {
            cy.edges().style('label', '');
          } else {
            cy.edges().style('label', 'data(label)');
          }
        });
      }, 100);
    });
  }

  /**
   * بهبود رندرینگ متن‌های فارسی
   */
  function enhancePersianText(cy) {
    if (!cy) return;

    cy.nodes().forEach(node => {
      const label = node.data('label');
      if (!label) return;

      // بررسی اینکه آیا متن فارسی دارد یا نه
      const hasPersian = /[\u0600-\u06FF]/.test(label);

      if (hasPersian) {
        node.addClass('persian-text');
        // تنظیمات بهتر برای متن فارسی
        node.style({
          'text-wrap': 'wrap',
          'text-max-width': 300,
          'line-height': 1.6
        });
      }
    });
  }

  /**
   * اضافه کردن دکمه‌های کنترل سریع
   */
  function addQuickControls() {
    const cy = getCyInstance();
    if (!cy) return;

    // بررسی اینکه آیا کنترل‌ها قبلاً اضافه شده‌اند یا نه
    if (document.getElementById('graph-quick-controls')) return;

    const controlsHTML = `
      <div id="graph-quick-controls" style="position: absolute; top: 10px; left: 10px; z-index: 10; display: flex; flex-direction: column; gap: 8px;">
        <button id="zoom-in-btn" class="btn btn-sm" style="min-width: 40px; padding: 8px; background: rgba(17,24,39,0.9); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; font-weight: 600;" title="زوم بیشتر">+</button>
        <button id="zoom-out-btn" class="btn btn-sm" style="min-width: 40px; padding: 8px; background: rgba(17,24,39,0.9); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; font-weight: 600;" title="زوم کمتر">−</button>
        <button id="fit-btn" class="btn btn-sm" style="min-width: 40px; padding: 8px; background: rgba(17,24,39,0.9); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; font-weight: 600;" title="نمایش کل گراف">⊡</button>
        <button id="center-btn" class="btn btn-sm" style="min-width: 40px; padding: 8px; background: rgba(17,24,39,0.9); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; font-weight: 600;" title="مرکز گراف">◎</button>
      </div>
    `;

    const cyWrap = document.getElementById('cy-wrap');
    if (cyWrap) {
      cyWrap.insertAdjacentHTML('beforeend', controlsHTML);

      // اضافه کردن event listener‌ها
      document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
        cy.zoom({
          level: cy.zoom() * 1.2,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
      });

      document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
        cy.zoom({
          level: cy.zoom() * 0.8,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
      });

      document.getElementById('fit-btn')?.addEventListener('click', () => {
        cy.fit(cy.elements(), 50);
      });

      document.getElementById('center-btn')?.addEventListener('click', () => {
        cy.center(cy.elements());
      });

      console.log('[graph-enhancements] Quick controls added');
    }
  }

  /**
   * دریافت نمونه Cytoscape
   */
  function getCyInstance() {
    return (window.CLD_CORE && window.CLD_CORE.getCy && window.CLD_CORE.getCy())
           || window.__cy
           || window.cy;
  }

  /**
   * آماده‌سازی و اجرا
   */
  function init() {
    const checkCy = () => {
      const cy = getCyInstance();

      if (cy && typeof cy.nodes === 'function') {
        // اعمال بهبودها
        enhanceGraphDisplay(cy);
        addZoomControls(cy);
        enhancePersianText(cy);

        // اضافه کردن کنترل‌های سریع بعد از 1 ثانیه
        setTimeout(addQuickControls, 1000);

        // گوش دادن به رویداد افزودن نودهای جدید
        cy.on('add', 'node', function(evt) {
          const node = evt.target;
          enhancePersianText(cy);
        });

        // گوش دادن به رویداد layoutstop برای تنظیم مجدد
        cy.on('layoutstop', function() {
          setTimeout(() => enhanceGraphDisplay(cy), 300);
        });

        return true;
      }
      return false;
    };

    // تلاش برای یافتن cy
    if (!checkCy()) {
      // گوش دادن به رویداد آمادگی
      if (typeof window.onCyReady === 'function') {
        window.onCyReady(cy => {
          enhanceGraphDisplay(cy);
          addZoomControls(cy);
          enhancePersianText(cy);
          setTimeout(addQuickControls, 1000);
        });
      } else {
        document.addEventListener('cy:ready', function(evt) {
          const cy = evt.detail && evt.detail.cy;
          if (cy) {
            enhanceGraphDisplay(cy);
            addZoomControls(cy);
            enhancePersianText(cy);
            setTimeout(addQuickControls, 1000);
          }
        });
      }

      // همچنین گوش دادن به رویداد بارگذاری مدل
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(checkCy, 1500);
      });
    }
  }

  // اجرای init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // صادر کردن برای استفاده در سایر ماژول‌ها
  if (typeof window !== 'undefined') {
    window.CLD_GRAPH_ENHANCEMENTS = {
      enhanceGraphDisplay: enhanceGraphDisplay,
      addZoomControls: addZoomControls,
      enhancePersianText: enhancePersianText
    };
  }

})();
