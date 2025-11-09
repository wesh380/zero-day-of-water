// Layered Parallax Effect - پارالکس چند لایه
(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroImage = document.querySelector('.hero-media');
  const heroCard = document.querySelector('.hero .content');

  if (!heroImage) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // در موبایل افکت را غیرفعال می‌کنیم
  if (isMobile || reduce) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const progress = scrolled / windowHeight;

    // Parallax Background: سرعت 0.6 (سریع‌تر)
    heroImage.style.setProperty('--hero-scroll-y', `${scrolled * 0.6}px`);
    heroImage.style.setProperty('--hero-opacity', Math.max(1 - progress * 1.2, 0));

    // Parallax Card: سرعت 0.3 (آهسته‌تر) برای ایجاد عمق
    if (heroCard) {
      heroCard.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  });
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

