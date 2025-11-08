/**
 * CLD Loading Initialization
 * مدیریت وضعیت بارگذاری برای صفحه CLD
 *
 * این اسکریپت باید قبل از همه اسکریپت‌های دیگر بارگذاری شود
 */

(function() {
  'use strict';

  // شروع loading به محض اجرای این اسکریپت
  if (window.loadingManager) {
    window.loadingManager.show('wave', 'در حال بارگذاری مدل بهره‌وری آب...');
  }

  // ایجاد skeleton برای دیاگرام CLD
  document.addEventListener('DOMContentLoaded', function() {
    const cyContainer = document.getElementById('cy');
    if (cyContainer && !window.cyLoaded) {
      // اضافه کردن skeleton به container دیاگرام
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-cld-diagram';
      skeleton.id = 'cld-skeleton';
      skeleton.innerHTML = `
        <div class="skeleton-cld-diagram__content">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <div style="margin-top: 16px; font-size: 14px;">در حال ترسیم دیاگرام...</div>
        </div>
      `;

      // مخفی کردن container اصلی
      cyContainer.style.opacity = '0';
      cyContainer.style.position = 'absolute';

      // اضافه کردن skeleton
      cyContainer.parentNode.insertBefore(skeleton, cyContainer);

      // تابع برای حذف skeleton و نمایش دیاگرام
      window.removeCLDSkeleton = function() {
        const skeletonEl = document.getElementById('cld-skeleton');
        if (skeletonEl) {
          skeletonEl.style.opacity = '0';
          skeletonEl.style.transition = 'opacity 0.3s ease-out';

          setTimeout(() => {
            skeletonEl.remove();
            cyContainer.style.position = '';
            cyContainer.style.opacity = '';
            cyContainer.style.transition = 'opacity 0.5s ease-in';
          }, 300);
        }
      };
    }

    // ردیابی تعداد اسکریپت‌های بارگذاری شده
    let scriptsToLoad = 0;
    let scriptsLoaded = 0;

    // شمارش اسکریپت‌های defer
    const scripts = document.querySelectorAll('script[defer], script[src*="cld"], script[src*="water-cld"]');
    scriptsToLoad = scripts.length;

    console.log(`[CLD Loading] Total scripts to track: ${scriptsToLoad}`);

    // به‌روزرسانی progress بر اساس تعداد اسکریپت‌ها
    function updateScriptProgress() {
      scriptsLoaded++;
      const progress = Math.min(95, (scriptsLoaded / scriptsToLoad) * 100);

      if (window.loadingManager) {
        window.loadingManager.updateProgress(progress);
        window.loadingManager.updateMessage(
          'در حال بارگذاری اسکریپت‌ها...',
          `${scriptsLoaded} از ${scriptsToLoad} اسکریپت بارگذاری شد`
        );
      }

      console.log(`[CLD Loading] Progress: ${scriptsLoaded}/${scriptsToLoad} (${progress.toFixed(1)}%)`);

      // اگر همه اسکریپت‌ها بارگذاری شدند
      if (scriptsLoaded >= scriptsToLoad) {
        onAllScriptsLoaded();
      }
    }

    // وقتی همه اسکریپت‌ها بارگذاری شدند
    function onAllScriptsLoaded() {
      console.log('[CLD Loading] All scripts loaded, waiting for diagram...');

      if (window.loadingManager) {
        window.loadingManager.updateMessage(
          'در حال آماده‌سازی دیاگرام...',
          'لطفاً چند لحظه صبر کنید'
        );
      }

      // چک کردن وضعیت Cytoscape
      const checkCytoscape = setInterval(() => {
        // چک کردن آیا Cytoscape آماده است
        if (window.cy && window.cy.nodes && window.cy.nodes().length > 0) {
          clearInterval(checkCytoscape);
          onDiagramReady();
        }
      }, 100);

      // Timeout بعد از 10 ثانیه
      setTimeout(() => {
        clearInterval(checkCytoscape);
        if (!window.cyLoaded) {
          console.warn('[CLD Loading] Diagram load timeout');
          onDiagramReady(); // بسته شدن loading حتی اگر diagram آماده نشد
        }
      }, 10000);
    }

    // وقتی دیاگرام آماده شد
    function onDiagramReady() {
      console.log('[CLD Loading] Diagram ready!');

      // علامت‌گذاری به عنوان بارگذاری شده
      window.cyLoaded = true;

      // حذف skeleton
      if (window.removeCLDSkeleton) {
        window.removeCLDSkeleton();
      }

      // تکمیل progress
      if (window.loadingManager) {
        window.loadingManager.completeProgress();

        // پنهان کردن loading overlay بعد از تاخیر کوتاه
        setTimeout(() => {
          window.loadingManager.hide();
        }, 500);
      }
    }

    // نصب listeners برای اسکریپت‌ها
    scripts.forEach(script => {
      if (script.hasAttribute('data-tracked')) return;
      script.setAttribute('data-tracked', 'true');

      // اگر اسکریپت قبلاً بارگذاری شده
      if (script.readyState === 'complete' || script.readyState === 'loaded') {
        updateScriptProgress();
        return;
      }

      // استفاده از Promise برای مدیریت بهتر
      const scriptPromise = new Promise((resolve, reject) => {
        script.addEventListener('load', () => {
          updateScriptProgress();
          resolve();
        });

        script.addEventListener('error', (e) => {
          console.error('[CLD Loading] Script load error:', script.src, e);
          updateScriptProgress(); // حتی در صورت خطا، progress را به‌روز کنید
          resolve(); // resolve (not reject) تا loading ادامه یابد
        });
      });
    });

    // Fallback: پنهان کردن loading بعد از window.onload
    window.addEventListener('load', () => {
      setTimeout(() => {
        // اگر هنوز loading نمایش داده می‌شود، آن را پنهان کنید
        if (window.loadingManager && window.loadingManager.overlay) {
          console.log('[CLD Loading] Window loaded - hiding overlay');
          onDiagramReady();
        }
      }, 2000);
    });
  });

  // Skeleton برای charts
  document.addEventListener('DOMContentLoaded', function() {
    // اضافه کردن skeleton به canvas های chart
    const chartCanvases = document.querySelectorAll('canvas[id*="chart"], canvas.chart');

    chartCanvases.forEach(canvas => {
      if (canvas.dataset.chartLoaded) return;

      const parent = canvas.parentElement;
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-chart';
      skeleton.innerHTML = `
        <div class="skeleton-chart__bars">
          <div class="skeleton-chart__bar"></div>
          <div class="skeleton-chart__bar"></div>
          <div class="skeleton-chart__bar"></div>
          <div class="skeleton-chart__bar"></div>
          <div class="skeleton-chart__bar"></div>
        </div>
      `;

      canvas.style.display = 'none';
      parent.insertBefore(skeleton, canvas);

      // حذف skeleton وقتی chart آماده شد
      const observer = new MutationObserver(() => {
        if (canvas.dataset.chartLoaded === 'true') {
          skeleton.remove();
          canvas.style.display = '';
          observer.disconnect();
        }
      });

      observer.observe(canvas, {
        attributes: true,
        attributeFilter: ['data-chart-loaded']
      });
    });
  });

  // متغیر global برای track کردن وضعیت
  window.cldLoadingState = {
    scriptsTotal: 0,
    scriptsLoaded: 0,
    diagramReady: false,
    startTime: Date.now()
  };

  // Log زمان کل بارگذاری
  window.addEventListener('load', () => {
    const loadTime = Date.now() - window.cldLoadingState.startTime;
    console.log(`[CLD Loading] Total page load time: ${(loadTime / 1000).toFixed(2)}s`);

    // ارسال metrics به analytics (اگر موجود باشد)
    if (window.RUM && window.RUM.mark) {
      window.RUM.mark('cld-loaded', {
        duration: loadTime,
        scripts: window.cldLoadingState.scriptsTotal
      });
    }
  });

})();
