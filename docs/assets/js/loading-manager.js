/**
 * Loading Manager - سیستم مدیریت جامع Loading States
 *
 * این ماژول مسئول مدیریت وضعیت‌های بارگذاری در سراسر سایت است
 * و تجربه کاربری را با نمایش بازخورد بصری مناسب بهبود می‌بخشد
 */

(function(window) {
  'use strict';

  /**
   * کلاس اصلی مدیریت Loading
   */
  class LoadingManager {
    constructor(options = {}) {
      this.options = {
        minDisplayTime: options.minDisplayTime || 300, // حداقل زمان نمایش (ms)
        fadeOutDuration: options.fadeOutDuration || 300, // مدت زمان fade out
        progressSimulation: options.progressSimulation !== false, // شبیه‌سازی progress
        messages: options.messages || {
          default: 'در حال بارگذاری...',
          scripts: 'در حال بارگذاری اسکریپت‌ها...',
          data: 'در حال دریافت داده‌ها...',
          diagram: 'در حال ترسیم دیاگرام...',
          complete: 'تکمیل شد!'
        },
        ...options
      };

      this.overlay = null;
      this.startTime = null;
      this.progressInterval = null;
      this.currentProgress = 0;
      this.scriptsLoaded = 0;
      this.totalScripts = 0;
    }

    /**
     * ایجاد HTML برای loading overlay
     */
    createOverlay(type = 'default', message = null) {
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.setAttribute('aria-busy', 'true');

      const content = document.createElement('div');
      content.className = 'loading-overlay__content';

      // انتخاب نوع spinner
      let spinnerHTML = '';
      switch(type) {
        case 'dots':
          spinnerHTML = `
            <div class="spinner-dots">
              <div class="spinner-dots__dot"></div>
              <div class="spinner-dots__dot"></div>
              <div class="spinner-dots__dot"></div>
            </div>
          `;
          break;
        case 'wave':
          spinnerHTML = `
            <div class="spinner-wave">
              <div class="spinner-wave__bar"></div>
              <div class="spinner-wave__bar"></div>
              <div class="spinner-wave__bar"></div>
              <div class="spinner-wave__bar"></div>
              <div class="spinner-wave__bar"></div>
            </div>
          `;
          break;
        default:
          spinnerHTML = '<div class="spinner"></div>';
      }

      const messageText = message || this.options.messages.default;

      content.innerHTML = `
        ${spinnerHTML}
        <div class="loading-message">${messageText}</div>
        <div class="loading-submessage">لطفاً صبر کنید...</div>
        <div class="loading-progress">
          <div class="loading-progress__bar"></div>
        </div>
        <span class="sr-only">در حال بارگذاری محتوا</span>
      `;

      overlay.appendChild(content);
      return overlay;
    }

    /**
     * نمایش loading overlay
     */
    show(type = 'default', message = null) {
      // اگر overlay قبلاً وجود دارد، آن را حذف کنید
      this.hide(true);

      this.startTime = Date.now();
      this.overlay = this.createOverlay(type, message);
      document.body.appendChild(this.overlay);

      // شروع شبیه‌سازی progress (اختیاری)
      if (this.options.progressSimulation) {
        this.startProgressSimulation();
      }

      // جلوگیری از اسکرول بدنه
      document.body.style.overflow = 'hidden';

      return this.overlay;
    }

    /**
     * مخفی کردن loading overlay
     */
    hide(immediate = false) {
      if (!this.overlay) return;

      // متوقف کردن شبیه‌سازی progress
      this.stopProgressSimulation();

      const hideOverlay = () => {
        if (!this.overlay) return;

        this.overlay.classList.add('fade-out');

        setTimeout(() => {
          if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
          }
          this.overlay = null;
          document.body.style.overflow = '';
        }, this.options.fadeOutDuration);
      };

      if (immediate) {
        hideOverlay();
        return;
      }

      // اطمینان از حداقل زمان نمایش
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.options.minDisplayTime - elapsedTime);

      setTimeout(hideOverlay, remainingTime);
    }

    /**
     * به‌روزرسانی پیام loading
     */
    updateMessage(message, submessage = null) {
      if (!this.overlay) return;

      const messageEl = this.overlay.querySelector('.loading-message');
      const submessageEl = this.overlay.querySelector('.loading-submessage');

      if (messageEl) messageEl.textContent = message;
      if (submessageEl && submessage) submessageEl.textContent = submessage;
    }

    /**
     * به‌روزرسانی progress bar
     */
    updateProgress(percentage) {
      if (!this.overlay) return;

      const progressBar = this.overlay.querySelector('.loading-progress__bar');
      if (progressBar) {
        progressBar.classList.add('loading-progress__bar--determinate');
        progressBar.style.width = percentage + '%';
      }

      this.currentProgress = percentage;
    }

    /**
     * شبیه‌سازی پیشرفت بارگذاری
     */
    startProgressSimulation() {
      this.currentProgress = 0;
      this.progressInterval = setInterval(() => {
        // افزایش تدریجی progress با سرعت کاهنده
        const increment = (100 - this.currentProgress) * 0.1;
        this.currentProgress = Math.min(95, this.currentProgress + increment);
        this.updateProgress(this.currentProgress);
      }, 300);
    }

    /**
     * توقف شبیه‌سازی progress
     */
    stopProgressSimulation() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }

    /**
     * تکمیل progress به 100%
     */
    completeProgress() {
      this.stopProgressSimulation();
      this.updateProgress(100);
      this.updateMessage(this.options.messages.complete, '');
    }

    /**
     * ردیابی بارگذاری اسکریپت‌ها
     */
    trackScripts(scriptElements) {
      if (!Array.isArray(scriptElements)) {
        scriptElements = Array.from(scriptElements);
      }

      this.totalScripts = scriptElements.length;
      this.scriptsLoaded = 0;

      scriptElements.forEach(script => {
        const newScript = document.createElement('script');

        // کپی attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // رویداد load
        newScript.addEventListener('load', () => {
          this.scriptsLoaded++;
          const progress = (this.scriptsLoaded / this.totalScripts) * 100;
          this.updateProgress(progress);
          this.updateMessage(
            this.options.messages.scripts,
            `${this.scriptsLoaded} از ${this.totalScripts} اسکریپت`
          );
        });

        // رویداد error
        newScript.addEventListener('error', () => {
          console.warn('Failed to load script:', script.src || script.textContent?.substring(0, 50));
          this.scriptsLoaded++;
        });

        // جایگزینی script
        if (script.parentNode) {
          script.parentNode.replaceChild(newScript, script);
        }
      });
    }
  }

  /**
   * Helper Functions - توابع کمکی
   */

  /**
   * ایجاد skeleton برای عنصر
   */
  function createSkeleton(element, type = 'line') {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;

    if (element.dataset.skeletonWidth) {
      skeleton.style.width = element.dataset.skeletonWidth;
    }
    if (element.dataset.skeletonHeight) {
      skeleton.style.height = element.dataset.skeletonHeight;
    }

    element.appendChild(skeleton);
    return skeleton;
  }

  /**
   * حذف skeletons از عنصر
   */
  function removeSkeleton(element) {
    const skeletons = element.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => skeleton.remove());
  }

  /**
   * نمایش skeleton برای container
   */
  function showSkeletonContainer(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const {
      lines = 3,
      header = false,
      card = false
    } = config;

    if (card) {
      const cardEl = document.createElement('div');
      cardEl.className = 'skeleton-card';
      container.appendChild(cardEl);
      container = cardEl;
    }

    if (header) {
      const headerEl = document.createElement('div');
      headerEl.className = 'skeleton skeleton-header';
      container.appendChild(headerEl);
    }

    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton skeleton-line';

      // تنوع در طول خطوط
      if (i === lines - 1) {
        line.classList.add('skeleton-line--short');
      } else if (i % 2 === 0) {
        line.classList.add('skeleton-line--medium');
      }

      container.appendChild(line);
    }
  }

  /**
   * بارگذاری lazy برای تصاویر با skeleton
   */
  function lazyLoadImage(img, onLoad) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-rect';
    skeleton.style.width = img.width ? img.width + 'px' : '100%';
    skeleton.style.height = img.height ? img.height + 'px' : '200px';

    img.style.display = 'none';
    img.parentNode.insertBefore(skeleton, img);

    img.addEventListener('load', () => {
      skeleton.remove();
      img.style.display = '';
      if (onLoad) onLoad();
    });

    // اگر تصویر قبلاً بارگذاری شده است
    if (img.complete) {
      skeleton.remove();
      img.style.display = '';
      if (onLoad) onLoad();
    }
  }

  /**
   * انتظار برای بارگذاری همه منابع
   */
  function waitForResources() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  /**
   * Auto-hide loading بعد از load کامل
   */
  function setupAutoHideLoading(manager) {
    // انتظار برای load شدن window
    window.addEventListener('load', () => {
      // تاخیر کوچک برای اطمینان از اجرای همه init scripts
      setTimeout(() => {
        manager.completeProgress();
        setTimeout(() => {
          manager.hide();
        }, 500);
      }, 200);
    });

    // Fallback: اگر بعد از 30 ثانیه هنوز loading نشده
    setTimeout(() => {
      if (manager.overlay) {
        console.warn('Loading timeout - force hiding overlay');
        manager.hide(true);
      }
    }, 30000);
  }

  // Export به window
  window.LoadingManager = LoadingManager;
  window.LoadingHelpers = {
    createSkeleton,
    removeSkeleton,
    showSkeletonContainer,
    lazyLoadImage,
    waitForResources,
    setupAutoHideLoading
  };

  // ایجاد instance پیش‌فرض
  window.loadingManager = new LoadingManager();

})(window);
