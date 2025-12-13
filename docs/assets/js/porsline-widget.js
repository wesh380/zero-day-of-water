(function () {
  'use strict';

  const BUTTON_SELECTOR = '.porsline-button-wrapper';
  const SCRIPT_ID = 'porsline-share';
  const SCRIPT_SRC = 'https://cdn.porsline.ir/static/panel/v2/statics/side-tab.js';
  const IFRAME_ID = 'porsline-side-tab-iframe';

  function loadWidgetScript() {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute('data-position', 'right');
      script.onload = () => resolve();
      script.onerror = (error) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(error);
      };

      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    });
  }

  function primeIframe() {
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe) return;

    iframe.fetchPriority = 'high';
    if (!iframe.src) {
      iframe.src = 'https://survey.porsline.ir/s/zdTiLuIp#/?ac=0&ns=0';
    }
  }

  function showSideTabSafe() {
    try {
      if (typeof window.showSideTab === 'function') {
        window.showSideTab();
      }
    } catch (error) {
      console.warn('Porsline showSideTab error:', error);
    }
  }

  function handleClick(event) {
    const target = event.currentTarget;
    const fallbackHref = target && target.getAttribute('href');

    event.preventDefault();

    loadWidgetScript()
      .then(() => {
        primeIframe();
        showSideTabSafe();
      })
      .catch(() => {
        if (fallbackHref) {
          window.location.href = fallbackHref;
        }
      });
  }

  function init() {
    const button = document.querySelector(BUTTON_SELECTOR);
    if (!button) return;

    button.addEventListener('click', handleClick);

    // Preload script to minimize delay when user opens the widget
    loadWidgetScript().catch(() => {
      /* already logged */
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
