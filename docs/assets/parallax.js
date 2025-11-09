(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroImage = document.querySelector('.hero-media');
  const heroText = document.querySelector('.hero .content');

  if (!heroImage) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // در موبایل افکت را غیرفعال می‌کنیم
  if (isMobile || reduce) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const progress = scrolled / windowHeight;

    // Parallax: تصویر آهسته‌تر حرکت می‌کند (using CSS custom properties)
    heroImage.style.setProperty('--hero-scroll-y', `${scrolled * 0.5}px`);
    heroImage.style.setProperty('--hero-opacity', Math.max(1 - progress * 1.2, 0));

    // Fade out متن (از 1 شروع می‌شود و هنگام scroll کاهش می‌یابد)
    if (heroText) {
      if (progress > 0.3) {
        const textOpacity = Math.min((progress - 0.3) * 2, 1);
        const textY = -(progress - 0.3) * 50;
        heroText.style.setProperty('--text-opacity', textOpacity);
        heroText.style.setProperty('--text-y', `${textY}px`);
      } else {
        heroText.style.setProperty('--text-opacity', 0);
        heroText.style.setProperty('--text-y', '0px');
      }
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

