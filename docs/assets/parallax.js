// ============================================
// WESH360 - Professional Parallax System
// پارالکس حرفه‌ای با Fixed Background
// ============================================

(function() {
  'use strict';

  // ============================================
  // 1. HERO PARALLAX - با Fixed Background
  // ============================================

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const heroBackground = document.getElementById('heroBackground');
  const heroBox = document.getElementById('heroBox');
  const scrollIndicator = document.getElementById('scrollIndicator');

  if (!heroBackground) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;

    // ============================================
    // BACKGROUND EFFECTS - فقط opacity و scale
    // ============================================

    // ============================================
    // BACKGROUND FADE ONLY - NO TRANSFORM!
    // ============================================

    // 1. Fade gradient overlay
    if (scrolled > windowHeight * 0.5) {
      heroBackground.classList.add('fading');
    } else {
      heroBackground.classList.remove('fading');
    }

    // 2. ❌ حذف کامل opacity change - background همیشه visible
    // این خط حذف شد تا background ثابت بماند
    // heroBackground.style.opacity = opacityValue; // ❌ این مشکل ساز بود!

    // 3. ✅ فقط gradient overlay را fade کن (از طریق class)
    // کلاس "fading" در CSS gradient را visible می‌کند

    // ============================================
    // HERO BOX FADE OUT
    // ============================================

    const boxFadeStart = windowHeight * 0.8;
    const boxFadeEnd = windowHeight * 1.5;

    if (heroBox) {
      if (scrolled >= boxFadeStart) {
        const progress = Math.min(1, (scrolled - boxFadeStart) / (boxFadeEnd - boxFadeStart));

        if (progress > 0.1) {
          heroBox.classList.add('fading-out');
        }
      } else {
        heroBox.classList.remove('fading-out');
      }
    }

    // ============================================
    // SCROLL INDICATOR
    // ============================================

    if (scrollIndicator) {
      if (scrolled > 150) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }

    ticking = false;
  }

  // Optimized scroll listener
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  if (scrollIndicator && window.pageYOffset > 150) {
    scrollIndicator.classList.add('hidden');
  }

  // ============================================
  // FORCE FIXED POSITION ON LOAD
  // ============================================

  // اطمینان از fixed بودن background در load
  window.addEventListener('load', () => {
    if (heroBackground) {
      // Force reset
      heroBackground.style.position = 'fixed';
      heroBackground.style.transform = 'none';
      heroBackground.style.top = '0';
      heroBackground.style.left = '0';
    }
  });

})();


// ============================================
// 2. CARDS FADE-IN Animation
// ============================================

(function() {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.card'));
  if (!cards.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
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
    cards.forEach(card => card.classList.add('visible'));
  }
})();


// ============================================
// 3. STATS COUNTER Animation
// ============================================

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const numberEl = card.querySelector('.stat-number');

        if (numberEl && !numberEl.dataset.animated) {
          const finalNumber = numberEl.textContent;
          numberEl.dataset.animated = 'true';

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
      const speed = 0.02 + (index * 0.005);
      const yPos = -(scrolled * speed);

      const rect = card.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.style.setProperty('--parallax-y', `${yPos}px`);
        card.classList.add('parallax-active');
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

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio;

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
// 6. CTA BUTTONS Ripple Effect
// ============================================

(function() {
  'use strict';

  const buttons = document.querySelectorAll('.hero-btn, .cta-button, .btn-hero');

  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

})();


// ============================================
// 7. LAZY LOAD Images
// ============================================

(function() {
  'use strict';

  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  } else {
    // Fallback with IntersectionObserver
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

})();


// ============================================
// 8. PERFORMANCE - Debounce Resize
// ============================================

(function() {
  'use strict';

  let resizeTimeout;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      // Re-calculate dimensions
      const windowHeight = window.innerHeight;

      // Update CSS custom properties
      document.documentElement.style.setProperty('--vh', `${windowHeight * 0.01}px`);
    }, 150);
  }, { passive: true });

  // Initial set
  const windowHeight = window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${windowHeight * 0.01}px`);

})();
