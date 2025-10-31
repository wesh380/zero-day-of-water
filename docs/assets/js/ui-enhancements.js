/**
 * UI Enhancements for Wesh360
 * Includes: Theme Toggle, FAB Menu, Smooth Animations, and more
 */

(function() {
  'use strict';

  // ===== 1. Theme Management =====
  const ThemeManager = {
    STORAGE_KEY: 'wesh360-theme',

    init() {
      this.createToggleButton();
      this.loadSavedTheme();
      this.bindEvents();
    },

    createToggleButton() {
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.setAttribute('aria-label', 'تغییر تم');
      button.setAttribute('type', 'button');
      button.innerHTML = '<span class="theme-toggle-icon">🌙</span>';
      document.body.appendChild(button);
      this.button = button;
    },

    loadSavedTheme() {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(theme, false);
    },

    setTheme(theme, animate = true) {
      const html = document.documentElement;
      const icon = this.button.querySelector('.theme-toggle-icon');

      if (animate) {
        html.style.transition = 'background-color 0.35s ease, color 0.35s ease';
        setTimeout(() => {
          html.style.transition = '';
        }, 350);
      }

      html.setAttribute('data-theme', theme);
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      localStorage.setItem(this.STORAGE_KEY, theme);

      // Update meta theme-color
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#0ea5e9');
      }
    },

    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    },

    bindEvents() {
      this.button.addEventListener('click', () => this.toggleTheme());

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  };

  // ===== 2. Floating Action Button (FAB) =====
  const FABManager = {
    init() {
      this.createFAB();
      this.createMenu();
      this.bindEvents();
    },

    createFAB() {
      const fab = document.createElement('button');
      fab.className = 'fab';
      fab.setAttribute('aria-label', 'منوی اقدامات سریع');
      fab.setAttribute('type', 'button');
      fab.innerHTML = '⚡';
      document.body.appendChild(fab);
      this.fab = fab;
    },

    createMenu() {
      const menu = document.createElement('div');
      menu.className = 'fab-menu';

      const menuItems = [
        { icon: '💧', label: 'داشبورد آب', href: '/water/hub' },
        { icon: '⚡', label: 'داشبورد برق', href: '/electricity/hub' },
        { icon: '🔥', label: 'داشبورد گاز', href: '/gas/hub' },
        { icon: '🧮', label: 'ماشین‌حساب', href: '/calculators/' },
      ];

      menuItems.forEach(item => {
        const menuItem = document.createElement('a');
        menuItem.className = 'fab-menu-item ripple';
        menuItem.href = item.href;
        menuItem.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
        menu.appendChild(menuItem);
      });

      document.body.appendChild(menu);
      this.menu = menu;
    },

    toggleMenu() {
      this.menu.classList.toggle('active');
      this.fab.style.transform = this.menu.classList.contains('active')
        ? 'scale(1.1) rotate(135deg)'
        : '';
    },

    bindEvents() {
      this.fab.addEventListener('click', () => this.toggleMenu());

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.fab.contains(e.target) && !this.menu.contains(e.target)) {
          this.menu.classList.remove('active');
          this.fab.style.transform = '';
        }
      });
    }
  };

  // ===== 3. Scroll Animations =====
  const ScrollAnimations = {
    init() {
      this.observeElements();
    },

    observeElements() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('fade-in-up');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe cards
      document.querySelectorAll('.card, .dash-card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
      });
    }
  };

  // ===== 4. Enhanced Tooltips =====
  const TooltipManager = {
    init() {
      this.createTooltips();
    },

    createTooltips() {
      // Add tooltips to elements with data-tooltip attribute
      document.querySelectorAll('[data-tooltip]').forEach(element => {
        const wrapper = document.createElement('span');
        wrapper.className = 'tooltip';

        const content = document.createElement('span');
        content.className = 'tooltip-content';
        content.textContent = element.getAttribute('data-tooltip');

        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        wrapper.appendChild(content);
      });
    }
  };

  // ===== 5. Loading Skeleton Helper =====
  const SkeletonLoader = {
    create(type = 'card', count = 1) {
      const container = document.createElement('div');
      container.className = 'skeleton-container';

      for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        container.appendChild(skeleton);
      }

      return container;
    },

    show(targetElement, type = 'card', count = 1) {
      const skeleton = this.create(type, count);
      targetElement.innerHTML = '';
      targetElement.appendChild(skeleton);
    },

    hide(targetElement) {
      const skeleton = targetElement.querySelector('.skeleton-container');
      if (skeleton) {
        skeleton.remove();
      }
    }
  };

  // ===== 6. Glassmorphism Card Converter =====
  const GlassmorphismConverter = {
    init() {
      // Convert specific cards to glass style
      const glassCards = document.querySelectorAll('.footprint-card, .simulator-card');
      glassCards.forEach(card => {
        if (!card.classList.contains('card-glass')) {
          card.classList.add('card-glass');
        }
      });
    }
  };

  // ===== 7. Progress Circle Helper =====
  const ProgressCircle = {
    create(value, label = '') {
      const circle = document.createElement('div');
      circle.className = 'progress-circle';
      circle.style.setProperty('--progress', value);

      const text = document.createElement('div');
      text.className = 'progress-circle-text';
      text.textContent = label || `${value}%`;

      circle.appendChild(text);
      return circle;
    }
  };

  // ===== 8. Smooth Scroll =====
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  };

  // ===== 9. Enhanced Focus Management =====
  const FocusManager = {
    init() {
      // Add keyboard navigation indicators
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-nav');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
      });
    }
  };

  // ===== 10. Performance Monitor (Dev Only) =====
  const PerformanceMonitor = {
    init() {
      if (!window.__WESH_DEBUG__) return;

      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('🚀 Performance Metrics:', {
          'DOM Content Loaded': `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
          'Load Complete': `${perfData.loadEventEnd - perfData.loadEventStart}ms`,
          'Total Time': `${perfData.loadEventEnd - perfData.fetchStart}ms`
        });
      });
    }
  };

  // ===== 11. Accessibility Announcer =====
  const A11yAnnouncer = {
    init() {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(announcer);
      this.announcer = announcer;
    },

    announce(message) {
      this.announcer.textContent = '';
      setTimeout(() => {
        this.announcer.textContent = message;
      }, 100);
    }
  };

  // ===== 12. Initialize All Enhancements =====
  function initUIEnhancements() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    function init() {
      try {
        ThemeManager.init();
        FABManager.init();
        ScrollAnimations.init();
        TooltipManager.init();
        GlassmorphismConverter.init();
        SmoothScroll.init();
        FocusManager.init();
        A11yAnnouncer.init();
        PerformanceMonitor.init();

        // Make utilities globally available
        window.WESH_UI = {
          ThemeManager,
          SkeletonLoader,
          ProgressCircle,
          A11yAnnouncer
        };

        console.log('✨ UI Enhancements loaded successfully');
      } catch (error) {
        console.error('❌ Error initializing UI enhancements:', error);
      }
    }
  }

  // Start initialization
  initUIEnhancements();

})();
