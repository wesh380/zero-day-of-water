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

    // Parallax: تصویر آهسته‌تر حرکت می‌کند
    heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;

    // Fade out تصویر
    heroImage.style.opacity = Math.max(1 - progress * 1.2, 0);

    // Fade in متن
    if (heroText) {
      if (progress > 0.3) {
        heroText.style.opacity = Math.min((progress - 0.3) * 2, 1);
        heroText.style.transform = `translate(-50%, -50%) translateY(${-(progress - 0.3) * 50}px)`;
      } else {
        heroText.style.opacity = 0;
        heroText.style.transform = `translate(-50%, -50%)`;
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

