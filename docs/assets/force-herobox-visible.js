// ============================================
// FORCE HERO BOX TO STAY VISIBLE
// این script مطمئن میشه heroBox همیشه visible باقی بمونه
// ============================================

(function() {
  'use strict';

  console.log('%c🔧 Force Hero Box Visible - Loaded', 'color: #10b981; font-size: 14px; font-weight: bold;');

  const heroBox = document.getElementById('heroBox');

  if (!heroBox) {
    console.error('❌ heroBox not found!');
    return;
  }

  // 1. Remove fading-out class if it exists
  heroBox.classList.remove('fading-out');

  // 2. Force inline styles
  heroBox.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    z-index: 20 !important;
  `;

  // 3. Prevent fading-out class from being added
  const preventFading = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (heroBox.classList.contains('fading-out')) {
          console.warn('⚠️ Preventing fading-out class!');
          heroBox.classList.remove('fading-out');

          // Re-apply inline styles
          heroBox.style.opacity = '1';
          heroBox.style.visibility = 'visible';
          heroBox.style.display = 'block';
        }
      }
    });
  });

  preventFading.observe(heroBox, {
    attributes: true,
    attributeFilter: ['class']
  });

  // 4. Monitor and fix opacity every 100ms
  setInterval(() => {
    const computedStyle = window.getComputedStyle(heroBox);

    if (computedStyle.opacity !== '1') {
      console.warn('⚠️ Opacity was not 1, fixing it!');
      heroBox.style.opacity = '1';
    }

    if (computedStyle.visibility !== 'visible') {
      console.warn('⚠️ Visibility was not visible, fixing it!');
      heroBox.style.visibility = 'visible';
    }

    if (computedStyle.display === 'none') {
      console.warn('⚠️ Display was none, fixing it!');
      heroBox.style.display = 'block';
    }
  }, 100);

  console.log('✅ Hero Box is now protected and will stay visible!');

})();
