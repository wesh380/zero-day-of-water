/**
 * Navigation Enhancements
 * بهبودهای ناوبری شامل:
 * - Highlight کردن لینک فعال در منو
 * - تولید خودکار Breadcrumb
 * - Smooth scroll برای هدر ثابت
 */

(function() {
  'use strict';

  /**
   * Highlight active navigation link
   * برجسته کردن لینک فعال در منوی ناوبری
   */
  function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.site-header__nav-link');

    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;

      // Check if current path matches or starts with link path
      if (currentPath === linkPath ||
          (linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Add CSS for active nav link if not present
   * اضافه کردن استایل برای لینک فعال
   */
  function injectActiveNavStyles() {
    if (!document.getElementById('nav-active-styles')) {
      const style = document.createElement('style');
      style.id = 'nav-active-styles';
      style.textContent = `
        .site-header__nav-link.active {
          background: rgba(14, 165, 233, 0.15);
          color: var(--theme-water-primary, #0369a1);
          font-weight: 600;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Generate breadcrumb navigation automatically
   * تولید خودکار مسیریابی (Breadcrumb)
   */
  function generateBreadcrumb() {
    // Don't generate breadcrumb on home page
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') {
      return;
    }

    // Check if breadcrumb container already exists
    if (document.querySelector('.breadcrumb-nav')) {
      return;
    }

    // Parse path into breadcrumb items
    const pathParts = path.split('/').filter(part => part && part !== 'index.html');
    if (pathParts.length === 0) {
      return;
    }

    // Create breadcrumb navigation
    const nav = document.createElement('nav');
    nav.className = 'breadcrumb-nav';
    nav.setAttribute('aria-label', 'breadcrumb');

    const container = document.createElement('div');
    container.className = 'breadcrumb-container';

    const ol = document.createElement('ol');
    ol.className = 'breadcrumb';

    // Add home item
    const homeItem = document.createElement('li');
    homeItem.className = 'breadcrumb-item';
    homeItem.innerHTML = `<a href="/"><i class="fas fa-home"></i> خانه</a>`;
    ol.appendChild(homeItem);

    // Path name mapping (Persian)
    const pathNameMap = {
      'water': 'آب',
      'hub': 'داشبورد',
      'electricity': 'برق',
      'gas': 'گاز',
      'environment': 'محیط زیست',
      'solar': 'خورشیدی',
      'calculators': 'ماشین‌حساب',
      'research': 'پژوهش',
      'contact': 'ارتباط',
      'security': 'امنیت',
      'amaayesh': 'آمایش',
      'dashboards': 'داشبوردها'
    };

    // Build breadcrumb items
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += '/' + part;
      const isLast = index === pathParts.length - 1;
      const displayName = pathNameMap[part] || part;

      const item = document.createElement('li');
      item.className = 'breadcrumb-item' + (isLast ? ' active' : '');

      if (isLast) {
        item.textContent = displayName;
      } else {
        const link = document.createElement('a');
        link.href = currentPath;
        link.textContent = displayName;
        item.appendChild(link);
      }

      ol.appendChild(item);
    });

    container.appendChild(ol);
    nav.appendChild(container);

    // Insert breadcrumb after header
    const header = document.querySelector('.site-header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(nav, header.nextSibling);
    } else if (header) {
      header.parentNode.appendChild(nav);
    }

    // Apply theme class if applicable
    applyBreadcrumbTheme(nav, pathParts[0]);
  }

  /**
   * Apply theme color to breadcrumb based on section
   * اعمال رنگ تم به breadcrumb بر اساس بخش
   */
  function applyBreadcrumbTheme(breadcrumbNav, section) {
    const themeMap = {
      'water': 'water',
      'electricity': 'electricity',
      'gas': 'gas',
      'environment': 'environment',
      'solar': 'solar'
    };

    const theme = themeMap[section];
    if (theme) {
      breadcrumbNav.classList.add(theme);
    }
  }

  /**
   * Add smooth scroll offset for fixed header
   * اضافه کردن offset برای اسکرول صاف با هدر ثابت
   */
  function addSmoothScrollOffset() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  /**
   * Make header fixed when scrolling (optional enhancement)
   * تبدیل هدر به ثابت هنگام اسکرول (بهبود اختیاری)
   */
  function enhanceHeaderBehavior() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });

    // Add styles for scrolled state
    if (!document.getElementById('header-scroll-styles')) {
      const style = document.createElement('style');
      style.id = 'header-scroll-styles';
      style.textContent = `
        .site-header.scrolled {
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.12);
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Initialize all navigation enhancements
   * راه‌اندازی تمام بهبودهای ناوبری
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    highlightActiveNavLink();
    injectActiveNavStyles();
    generateBreadcrumb();
    addSmoothScrollOffset();
    enhanceHeaderBehavior();

    // Re-highlight on popstate (browser back/forward)
    window.addEventListener('popstate', highlightActiveNavLink);
  }

  // Start initialization
  init();

})();
