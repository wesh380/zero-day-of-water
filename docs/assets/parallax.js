// Smooth Parallax with Gradient Fade Overlay
(function(){
  'use strict';

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroBackground = document.getElementById('heroBackground');
  const heroBox = document.getElementById('heroBox');
  const scrollIndicator = document.getElementById('scrollIndicator');

  if (!heroBackground) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // در موبایل افکت را غیرفعال می‌کنیم
  if (isMobile || reduce) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;

    // 1. Background fade با gradient overlay
    if (scrolled > windowHeight * 0.3) {
      heroBackground.classList.add('fading');
    } else {
      heroBackground.classList.remove('fading');
    }

    // 2. Box fade out
    const boxFadeStart = windowHeight * 0.5;
    const boxFadeEnd = windowHeight * 1.2;
    const boxFadeProgress = Math.min(1,
      Math.max(0, (scrolled - boxFadeStart) / (boxFadeEnd - boxFadeStart))
    );

    if (heroBox) {
      if (boxFadeProgress > 0.1) {
        heroBox.classList.add('fading-out');
      } else {
        heroBox.classList.remove('fading-out');
      }
    }

    // 3. Scroll indicator hide
    if (scrollIndicator) {
      if (scrolled > 100) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }

    // 4. Parallax effect (optional - subtle movement)
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${scrolled * 0.3}px)`;
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

(function(){
  const cards = Array.from(document.querySelectorAll('.card'));
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { rootMargin: '-10% 0px' });
    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('visible'));
  }
})();

// Stats Parallax Effect & Counter Animation
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // Parallax Effect on Scroll
  function handleParallax() {
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;

    const scrolled = window.pageYOffset;

    statCards.forEach((card, index) => {
      const speed = 0.05 + (index * 0.01);
      const yPos = scrolled * speed;

      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.style.setProperty('--parallax-y', `${yPos}px`);
        card.classList.add('parallax-active');
      }
    });
  }

  // Throttle scroll event for better performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
      handleParallax();
    });
  });

  // Counter Animation
  function animateNumber(element, final) {
    const match = final.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = final;
        clearInterval(timer);
      } else {
        element.textContent = final.replace(/\d+/, Math.floor(current));
      }
    }, 16);
  }

  // Intersection Observer for Counter Animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numberEl = entry.target.querySelector('.stat-number');
        if (numberEl && !numberEl.dataset.animated) {
          const finalNumber = numberEl.textContent;
          numberEl.dataset.animated = 'true';

          setTimeout(() => {
            animateNumber(numberEl, finalNumber);
          }, 200);
        }
      }
    });
  }, { threshold: 0.5 });

  // Observe all stat cards
  document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
  });

})();

// Smooth Cross-fade between Hero and Stats sections
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // Hero Section Fade Observer
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.5) {
          entry.target.classList.add('fading');
        } else {
          entry.target.classList.remove('fading');
        }
      });
    }, { threshold: [0, 0.5, 1] });

    heroObserver.observe(heroSection);
  }

  // Stats Section Visibility Observer
  const statsSection = document.querySelector('.stats-parallax');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);
  }

})();

