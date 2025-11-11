// ============================================
// WESH360 - Optimized Parallax System
// Fixed Hero + Smooth Animations
// ============================================

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // ============================================
  // 1. SCROLL INDICATOR - با IntersectionObserver
  // ============================================

  const scrollIndicator = document.getElementById('scrollIndicator') ||
                          document.querySelector('.scroll-hint');

  if (scrollIndicator) {
    let lastScrollY = 0;
    let ticking = false;

    function updateScrollIndicator() {
      const scrollY = window.pageYOffset;

      // Show/hide based on scroll position
      if (scrollY > 150 && lastScrollY <= 150) {
        scrollIndicator.classList.add('hidden');
      } else if (scrollY <= 150 && lastScrollY > 150) {
        scrollIndicator.classList.remove('hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollIndicator);
        ticking = true;
      }
    }, { passive: true });

    // Initial state
    if (window.pageYOffset > 150) {
      scrollIndicator.classList.add('hidden');
    }
  }

})();


// ============================================
// 2. STATS COUNTER - بهینه شده با easing
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Easing function for smooth animation
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateNumber(element, finalText) {
    const match = finalText.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.floor(easedProgress * target);

      element.textContent = finalText.replace(/\d+/, current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalText;
      }
    }

    requestAnimationFrame(update);
  }

  // Observe stat cards
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const numberEl = card.querySelector('.stat-number');

        if (numberEl && !numberEl.dataset.animated) {
          const finalText = numberEl.textContent;
          numberEl.dataset.animated = 'true';

          // Small delay for better UX
          setTimeout(() => {
            animateNumber(numberEl, finalText);
          }, 200);
        }

        // Unobserve after animation starts
        statObserver.unobserve(card);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all stat cards
  document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
  });

})();


// ============================================
// 3. CARDS FADE-IN Animation
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('.card, .data-card');
  if (!cards.length) return;

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 100);
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '-10% 0px',
    threshold: 0.1
  });

  cards.forEach(card => cardObserver.observe(card));

})();


// ============================================
// 4. RIPPLE EFFECT - بهینه شده
// ============================================

(function() {
  'use strict';

  const buttons = document.querySelectorAll('.hero-btn, .btn-primary, .cta-button, .btn-hero');

  function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    // Calculate ripple position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    `;

    // Add to button
    button.appendChild(ripple);

    // Remove after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });

})();


// ============================================
// 5. VIEWPORT HEIGHT - برای mobile
// ============================================

(function() {
  'use strict';

  let resizeTimeout;

  function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Set initial value
  updateViewportHeight();

  // Update on resize with debounce
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateViewportHeight, 150);
  }, { passive: true });

})();


// ============================================
// 6. SMOOTH SCROLL - برای navigation links
// ============================================

(function() {
  'use strict';

  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip empty or single # links
      if (!href || href === '#') return;

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

})();


// ============================================
// 7. LAZY LOAD Images - بهینه شده
// ============================================

(function() {
  'use strict';

  // Check if browser supports native lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback with IntersectionObserver
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

})();


// ============================================
// 8. PERFORMANCE MONITORING (Development)
// ============================================

(function() {
  'use strict';

  // Only in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {

    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;

    function measureFPS() {
      const now = performance.now();
      frames++;

      if (now >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));

        // Warn if FPS is low
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}`);
        }

        frames = 0;
        lastTime = now;
      }

      requestAnimationFrame(measureFPS);
    }

    // Start monitoring
    requestAnimationFrame(measureFPS);
  }

})();


// ============================================
// 9. ERROR HANDLING - Global
// ============================================

(function() {
  'use strict';

  // Catch errors in animations
  window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('parallax.js')) {
      console.error('Parallax Error:', e.message);
      // Graceful degradation - disable animations
      document.documentElement.classList.add('no-animations');
    }
  }, true);

})();


// ============================================
// Console info
// ============================================

console.log('%c🚀 WESH360 Parallax System Loaded', 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
console.log('%c✅ Fixed Hero | Smooth Animations | Optimized Performance', 'color: #10b981; font-size: 12px;');
