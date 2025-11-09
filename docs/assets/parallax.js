// ============================================
// WESH360 - Parallax & Animations
// بهبود یافته با تمام fixها
// ============================================

(function() {
  'use strict';

  // ============================================
  // 1. HERO PARALLAX با Smooth Fade
  // ============================================

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroBackground = document.getElementById('heroBackground');
  const heroBox = document.getElementById('heroBox');
  const scrollIndicator = document.getElementById('scrollIndicator');

  if (!heroBackground) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Skip animations در صورت reduced motion
  if (reduce) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;

    // ✅ FIX 1: Background fade کندتر و smooth تر
    // قبل: 0.3vh -> بعد: 0.5vh
    if (scrolled > windowHeight * 0.5) {
      heroBackground.classList.add('fading');
    } else {
      heroBackground.classList.remove('fading');
    }

    // ✅ FIX 2: Box fade out خیلی دیرتر
    // قبل: 0.7vh-1.5vh -> بعد: 1.0vh-2.0vh
    const boxFadeStart = windowHeight * 1.0;
    const boxFadeEnd = windowHeight * 2.0;
    const boxFadeProgress = Math.min(1,
      Math.max(0, (scrolled - boxFadeStart) / (boxFadeEnd - boxFadeStart))
    );

    if (heroBox) {
      // ✅ FIX 3: Threshold بالاتر = box بیشتر می‌مونه
      if (boxFadeProgress > 0.2) {
        heroBox.classList.add('fading-out');
      } else {
        heroBox.classList.remove('fading-out');
      }
    }

    // 3. Scroll indicator hide
    if (scrollIndicator) {
      if (scrolled > 150) { // کمی دیرتر
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }

    // ✅ FIX 4: Parallax کندتر = smooth تر
    // قبل: 0.3 -> بعد: 0.2
    if (heroBackground && !isMobile) {
      heroBackground.style.transform = `translateY(${scrolled * 0.2}px)`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateParallax();

})();


// ============================================
// 2. CARDS FADE-IN Animation
// ============================================

(function() {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.card'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // ✅ تاخیر کمی برای smooth بودن
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '-10% 0px',
      threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));
  } else {
    // Fallback برای مرورگرهای قدیمی
    cards.forEach(card => card.classList.add('visible'));
  }
})();


// ============================================
// 3. STATS SECTION با Counter Animation
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // ✅ Counter Animation بهبود یافته
  function animateNumber(element, final) {
    const match = final.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]);
    const duration = 2000;
    const fps = 60;
    const totalFrames = (duration / 1000) * fps;
    const increment = target / totalFrames;
    let current = 0;
    let frame = 0;

    function update() {
      frame++;
      current = Math.min(current + increment, target);

      element.textContent = final.replace(/\d+/, Math.floor(current));

      if (current < target && frame < totalFrames) {
        requestAnimationFrame(update);
      } else {
        element.textContent = final;
      }
    }

    requestAnimationFrame(update);
  }

  // ✅ Intersection Observer بهبود یافته
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const numberEl = card.querySelector('.stat-number');

        if (numberEl && !numberEl.dataset.animated) {
          const finalNumber = numberEl.textContent;
          numberEl.dataset.animated = 'true';

          // تاخیر برای smooth بودن
          setTimeout(() => {
            animateNumber(numberEl, finalNumber);
          }, 200);
        }

        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  });

  // Observe all stat cards
  document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
  });

})();


// ============================================
// 4. STATS PARALLAX Effect (Subtle)
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  const statCards = document.querySelectorAll('.stat-card');
  if (!statCards.length) return;

  let scrollTimeout;

  function handleParallax() {
    const scrolled = window.pageYOffset;

    statCards.forEach((card, index) => {
      // ✅ Parallax خیلی subtle
      const speed = 0.02 + (index * 0.005);
      const yPos = -(scrolled * speed);

      const rect = card.getBoundingClientRect();

      // فقط وقتی در viewport است
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.style.transform = `translateY(${yPos}px)`;
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(handleParallax);
  }, { passive: true });

})();


// ============================================
// 5. SMOOTH CROSS-FADE Hero ↔ Stats
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // ✅ Hero fade observer
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio;

        // ✅ Smooth fade بر اساس visibility
        if (ratio < 0.4) {
          entry.target.classList.add('fading');
        } else {
          entry.target.classList.remove('fading');
        }
      });
    }, {
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
    });

    heroObserver.observe(heroSection);
  }

  // ✅ Stats fade-in observer
  const statsSection = document.querySelector('.stats-parallax');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    statsObserver.observe(statsSection);
  }

})();


// ============================================
// 6. CTA BUTTON Interactions
// ============================================

(function() {
  'use strict';

  const ctaButtons = document.querySelectorAll('.cta-button, .btn-hero, .hero-btn');

  ctaButtons.forEach(button => {
    // Ripple effect on click
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

})();


// ============================================
// 7. PERFORMANCE OPTIMIZATION
// ============================================

(function() {
  'use strict';

  // Lazy load images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Debounce resize events
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalculate layouts if needed
      document.body.classList.add('resizing');
      setTimeout(() => {
        document.body.classList.remove('resizing');
      }, 100);
    }, 150);
  });

})();


// ============================================
// Console Info
// ============================================

console.log('%c✨ WESH360 Parallax Loaded', 'color: #0ea5e9; font-size: 14px; font-weight: bold;');
console.log('%cAnimations: Active', 'color: #10b981; font-size: 12px;');
