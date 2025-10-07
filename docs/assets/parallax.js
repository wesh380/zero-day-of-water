(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const ampMul = isMobile ? 0.55 : 1.0;
  const vh = Math.max(1, window.innerHeight);
  let targetY = 0, currentY = 0;
  const lerp = (a,b,t)=>a+(b-a)*t;

  function frame(){
    targetY = window.scrollY || 0;
    currentY = lerp(currentY, targetY, 0.08);

    const norm = currentY * -0.14 * ampMul * (vh / 900);
    hero.style.transform = `translateY(${norm}px)`;

    const p = Math.min(1, currentY / (vh * 0.7));
    document.documentElement.style.setProperty('--overlay', (0.35 - p * 0.2).toFixed(2));

    requestAnimationFrame(frame);
  }

  if (!reduce) requestAnimationFrame(frame);
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

