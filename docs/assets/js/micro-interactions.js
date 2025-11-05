/**
 * WESH360 Micro-interactions
 * Advanced animations and interactions
 */

(function() {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Intersection Observer for fade-in animations
   */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe cards
    document.querySelectorAll('.card, .data-card, .dash-card').forEach(card => {
      observer.observe(card);
    });
  }

  /**
   * Stagger animation for card grids
   */
  function initStaggerAnimation() {
    if (prefersReducedMotion) return;

    const cardContainers = document.querySelectorAll('.cards-section, .cards-grid, .cards');

    cardContainers.forEach(container => {
      const cards = container.querySelectorAll('.card, .data-card');

      cards.forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.animationDelay = `${index * 0.1}s`;
      });
    });
  }

  /**
   * Number counter animation
   */
  function animateCounter(element, target, duration = 1000) {
    if (prefersReducedMotion) {
      element.textContent = target;
      return;
    }

    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      // Format number with Persian digits if needed
      const formatted = Math.floor(current).toLocaleString('fa-IR');
      element.textContent = formatted;
    }, 16);
  }

  /**
   * Initialize counters on page load
   */
  function initCounters() {
    const counters = document.querySelectorAll('.counter[data-target]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target, 10);
          const duration = parseInt(entry.target.dataset.duration, 10) || 1000;

          animateCounter(entry.target, target, duration);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  /**
   * Add ripple effect to buttons
   */
  function initRippleEffect() {
    if (prefersReducedMotion) return;

    document.addEventListener('click', function(e) {
      const target = e.target.closest('.ripple');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');

      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.width = ripple.style.height = '100px';
      ripple.style.left = `${e.clientX - rect.left - 50}px`;
      ripple.style.top = `${e.clientY - rect.top - 50}px`;
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      ripple.style.opacity = '1';

      target.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(4)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => ripple.remove(), 600);
    });
  }

  /**
   * Smooth scroll to anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const offset = 80; // Header height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  /**
   * Add loading skeleton on fetch
   */
  function showSkeleton(container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.width = '100%';
    skeleton.style.height = '100px';
    container.appendChild(skeleton);
    return skeleton;
  }

  /**
   * Animate progress bars
   */
  function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar-fill[data-progress]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progress = entry.target.dataset.progress;

          if (!prefersReducedMotion) {
            setTimeout(() => {
              entry.target.style.width = `${progress}%`;
            }, 100);
          } else {
            entry.target.style.width = `${progress}%`;
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
  }

  /**
   * Add shake effect on form validation errors
   */
  function shakeElement(element) {
    if (prefersReducedMotion) return;

    element.classList.add('shake');
    setTimeout(() => {
      element.classList.remove('shake');
    }, 500);
  }

  /**
   * Observe cards becoming visible
   */
  function observeCardVisibility() {
    if (prefersReducedMotion) {
      // Make all cards visible immediately
      document.querySelectorAll('.card, .data-card').forEach(card => {
        card.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.card, .data-card').forEach(card => {
      observer.observe(card);
    });
  }

  /**
   * Add hover sound effects (optional)
   */
  function initHoverSounds() {
    // Only enable if user has sound enabled (check localStorage)
    const soundEnabled = localStorage.getItem('wesh360.soundEnabled') === 'true';
    if (!soundEnabled) return;

    const hoverSound = new Audio('/assets/sounds/hover.mp3');
    hoverSound.volume = 0.1;

    document.querySelectorAll('.card, .data-card, .btn').forEach(element => {
      element.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {
          // Silently fail if audio can't play
        });
      });
    });
  }

  /**
   * Initialize all micro-interactions
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initScrollAnimations();
    initStaggerAnimation();
    initCounters();
    initRippleEffect();
    initSmoothScroll();
    initProgressBars();
    observeCardVisibility();

    // Optional: init hover sounds
    // initHoverSounds();

    // Add page transition class
    if (!prefersReducedMotion) {
      document.body.classList.add('page-transition');
    }

    console.log('✨ WESH360 Micro-interactions initialized');
  }

  // Auto-initialize
  init();

  // Export functions for external use
  window.WESH360Animations = {
    animateCounter,
    shakeElement,
    showSkeleton
  };
})();
