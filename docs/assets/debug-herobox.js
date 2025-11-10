// ============================================
// DEBUG SCRIPT - Hero Box Disappearing Issue
// ============================================

(function() {
  'use strict';

  console.log('%c🔍 DEBUG: Hero Box Monitoring Started', 'color: #f59e0b; font-size: 16px; font-weight: bold;');

  const heroBox = document.getElementById('heroBox');

  if (!heroBox) {
    console.error('❌ heroBox not found!');
    return;
  }

  console.log('✅ heroBox found:', heroBox);

  // 1. Monitor classList changes
  const classObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        console.log('🔄 Class changed:', {
          old: mutation.oldValue,
          new: heroBox.className,
          classList: Array.from(heroBox.classList),
          timestamp: new Date().toISOString()
        });

        // Check if fading-out was added
        if (heroBox.classList.contains('fading-out')) {
          console.error('⚠️ FADING-OUT class was added!');
          console.trace('Stack trace:');
        }
      }
    });
  });

  classObserver.observe(heroBox, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class']
  });

  // 2. Monitor style changes
  const styleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const computedStyle = window.getComputedStyle(heroBox);
        console.log('🎨 Style changed:', {
          opacity: computedStyle.opacity,
          visibility: computedStyle.visibility,
          display: computedStyle.display,
          transform: computedStyle.transform,
          timestamp: new Date().toISOString()
        });

        if (computedStyle.opacity === '0') {
          console.error('⚠️ Opacity became 0!');
          console.trace('Stack trace:');
        }
      }
    });
  });

  styleObserver.observe(heroBox, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['style']
  });

  // 3. Monitor computed style every 100ms
  let lastOpacity = null;
  let lastVisibility = null;
  let lastDisplay = null;

  const checkInterval = setInterval(() => {
    const computedStyle = window.getComputedStyle(heroBox);
    const currentOpacity = computedStyle.opacity;
    const currentVisibility = computedStyle.visibility;
    const currentDisplay = computedStyle.display;

    if (currentOpacity !== lastOpacity) {
      console.log('📊 Opacity changed:', {
        from: lastOpacity,
        to: currentOpacity,
        scrollY: window.pageYOffset,
        windowHeight: window.innerHeight,
        timestamp: new Date().toISOString()
      });
      lastOpacity = currentOpacity;
    }

    if (currentVisibility !== lastVisibility) {
      console.log('👁️ Visibility changed:', {
        from: lastVisibility,
        to: currentVisibility,
        timestamp: new Date().toISOString()
      });
      lastVisibility = currentVisibility;
    }

    if (currentDisplay !== lastDisplay) {
      console.log('📦 Display changed:', {
        from: lastDisplay,
        to: currentDisplay,
        timestamp: new Date().toISOString()
      });
      lastDisplay = currentDisplay;
    }

    // If opacity becomes 0, log everything
    if (currentOpacity === '0') {
      console.error('❌ HERO BOX IS NOW INVISIBLE!', {
        classList: Array.from(heroBox.classList),
        style: heroBox.getAttribute('style'),
        computedStyle: {
          opacity: currentOpacity,
          visibility: currentVisibility,
          display: currentDisplay,
          transform: computedStyle.transform
        },
        scrollY: window.pageYOffset,
        windowHeight: window.innerHeight
      });
    }
  }, 100);

  // 4. Monitor scroll events
  let scrollCount = 0;
  window.addEventListener('scroll', () => {
    scrollCount++;
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const boxFadeStart = windowHeight * 1.0;

    console.log(`📜 Scroll event #${scrollCount}:`, {
      scrollY,
      windowHeight,
      boxFadeStart,
      shouldFade: scrollY >= boxFadeStart,
      opacity: window.getComputedStyle(heroBox).opacity,
      classList: Array.from(heroBox.classList)
    });
  });

  // 5. Log initial state
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(heroBox);
    console.log('📸 Initial state (after 100ms):', {
      classList: Array.from(heroBox.classList),
      opacity: computedStyle.opacity,
      visibility: computedStyle.visibility,
      display: computedStyle.display,
      transform: computedStyle.transform,
      scrollY: window.pageYOffset
    });
  }, 100);

  // 6. Log state after 3 seconds
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(heroBox);
    console.log('📸 State after 3 seconds:', {
      classList: Array.from(heroBox.classList),
      opacity: computedStyle.opacity,
      visibility: computedStyle.visibility,
      display: computedStyle.display,
      transform: computedStyle.transform,
      scrollY: window.pageYOffset
    });
  }, 3000);

  // Cleanup after 30 seconds
  setTimeout(() => {
    classObserver.disconnect();
    styleObserver.disconnect();
    clearInterval(checkInterval);
    console.log('🛑 Debug monitoring stopped after 30 seconds');
  }, 30000);

})();
