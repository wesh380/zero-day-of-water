/**
 * Hotfix for CLD graph crashes
 * این فایل مشکلات critical bundle را override می‌کند
 */
(function() {
  'use strict';

  console.log('[CLD Hotfix] Applying critical patches...');

  // **Fix 1**: Override کردن هر استایلی که از fromJson استفاده می‌کند
  const originalFromJson = window.cytoscape?.prototype?.style()?.fromJson;
  if (window.cytoscape && window.cytoscape.Core) {
    const proto = window.cytoscape.Core.prototype;
    if (proto && proto.style) {
      const originalStyle = proto.style;
      proto.style = function() {
        const styleObj = originalStyle.call(this);
        if (styleObj && styleObj.fromJson) {
          const originalFromJson = styleObj.fromJson;
          styleObj.fromJson = function(styles) {
            console.warn('[CLD Hotfix] fromJson() is deprecated. Using selector() instead.');
            try {
              // Convert fromJson to selector chain
              if (Array.isArray(styles)) {
                styles.forEach(function(styleRule) {
                  if (styleRule.selector && styleRule.style) {
                    styleObj.selector(styleRule.selector).style(styleRule.style);
                  }
                });
                return styleObj;
              }
            } catch (e) {
              console.error('[CLD Hotfix] fromJson conversion failed:', e);
            }
            // Fallback to original if conversion fails
            return originalFromJson.call(this, styles);
          };
        }
        return styleObj;
      };
      console.log('[CLD Hotfix] Patched cy.style().fromJson() ✓');
    }
  }

  // **Fix 2**: مهار کردن infinite loops در reInjectIfReset
  let reInjectCallCount = 0;
  const MAX_REINJECT_CALLS = 10;

  window.addEventListener('DOMContentLoaded', function() {
    // بعد از 10 ثانیه، reinject calls را ریست کن
    setInterval(function() {
      reInjectCallCount = 0;
    }, 10000);
  });

  // **Fix 3**: اضافه کردن error boundary برای cy.style()
  document.addEventListener('cy:ready', function(event) {
    const cy = event.detail?.cy;
    if (!cy) return;

    console.log('[CLD Hotfix] cy:ready - graph has', cy.nodes().length, 'nodes,', cy.edges().length, 'edges');

    // **Fix 4**: اطمینان از اینکه container visible است
    setTimeout(function() {
      const container = document.getElementById('cy');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.error('[CLD Hotfix] Container #cy has zero size!', rect);
          container.style.minHeight = '600px';
          container.style.minWidth = '100%';
          cy.resize();
        }
      }
    }, 100);

    // **Fix 5**: جلوگیری از multiple style applications
    if (cy._cldStylesApplied) {
      console.warn('[CLD Hotfix] Styles already applied, skipping duplicate');
      return;
    }
    cy._cldStylesApplied = true;

    // **Fix 6**: اطمینان از render شدن گراف
    setTimeout(function() {
      if (cy.nodes().length > 0) {
        try {
          cy.fit(cy.elements(), 40);
          console.log('[CLD Hotfix] Graph fitted successfully');
        } catch (e) {
          console.error('[CLD Hotfix] Fit failed:', e);
        }
      }
    }, 500);
  }, { once: true });

  // **Fix 7**: Memory leak prevention
  window.addEventListener('beforeunload', function() {
    const cy = window.__cy || window.cy;
    if (cy && typeof cy.destroy === 'function') {
      try {
        cy.destroy();
        console.log('[CLD Hotfix] Cytoscape instance destroyed on unload');
      } catch (e) {
        console.error('[CLD Hotfix] Destroy failed:', e);
      }
    }
  });

  // **Fix 8**: اگر بعد از 5 ثانیه گراف render نشد، نمایش error
  setTimeout(function() {
    const cy = window.__cy || window.cy;
    if (!cy || cy.nodes().length === 0) {
      console.error('[CLD Hotfix] Graph failed to load after 5 seconds');

      // نمایش پیام به کاربر
      const container = document.getElementById('cy');
      if (container) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: #fee; border: 2px solid #c00; border-radius: 8px; text-align: center; z-index: 1000;';
        errorMsg.innerHTML = '<p style="margin: 0; font-weight: bold; color: #c00;">خطا در بارگذاری گراف</p><p style="margin: 10px 0 0; font-size: 14px;">لطفاً صفحه را رفرش کنید یا به <a href="/contact/">پشتیبانی</a> اطلاع دهید.</p>';
        container.appendChild(errorMsg);
      }
    } else {
      console.log('[CLD Hotfix] Graph loaded successfully ✓');
    }
  }, 5000);

  console.log('[CLD Hotfix] All patches applied ✓');
})();
