/**
 * Stats Parallax Effect & Counter Animation
 * Adds parallax scrolling and number counting to stat cards
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // Parallax Effect on Scroll
  function handleParallax() {
    const cards = document.querySelectorAll('.stat-card');
    if (!cards.length) return;

    const scrolled = window.pageYOffset;

    cards.forEach((card, index) => {
      // Different speed for each card to create depth effect
      const speed = 0.05 + (index * 0.01);
      const yPos = scrolled * speed;

      // Only apply parallax after initial animation completes
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.style.transform = `translateY(${yPos}px)`;
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
    // Extract number from text (e.g., "500M+" -> 500)
    const match = final.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]);
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = final;
        clearInterval(timer);
      } else {
        // Replace number in original format (preserves M+, K+, etc)
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

          // Small delay before starting animation
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
