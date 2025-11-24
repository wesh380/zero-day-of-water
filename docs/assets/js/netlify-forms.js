(function() {
  'use strict';

  /**
   * Serialize a form into x-www-form-urlencoded format while preserving all fields
   * Netlify expects (including hidden, honeypot, and reCAPTCHA). This keeps
   * Netlify form detection intact and must always post to form.action or "/".
   * @param {HTMLFormElement} form
   * @returns {string}
   */
  function encodeFormData(form) {
    const formData = new FormData(form);
    if (!formData.get('form-name')) {
      const fallbackName = form.getAttribute('name') || '';
      if (fallbackName) formData.set('form-name', fallbackName);
    }

    return Array.from(formData.entries())
      .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value)))
      .join('&');
  }

  async function submitWithFetch(event) {
    event.preventDefault();
    const form = event.target;

    const encoded = encodeFormData(form);
    const target = form.getAttribute('action') || '/';

    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded,
      });

      if (response.ok) {
        window.location.assign(target);
        return;
      }

      console.warn('[Netlify form] Non-OK response, falling back to native submit.');
    } catch (error) {
      console.warn('[Netlify form] Falling back to native submit:', error?.message || error);
    }

    form.submit();
  }

  function initNetlifyForms() {
    const forms = Array.from(document.querySelectorAll('form[data-netlify="true"]'));
    if (!forms.length) return;

    forms.forEach((form) => {
      const { netlifyManual, netlifyFetch } = form.dataset;

      if (netlifyManual === 'true') return;

      if (netlifyFetch === 'true') {
        if (!form.__netlifyBound) {
          form.addEventListener('submit', submitWithFetch);
          form.__netlifyBound = true;
        }
      }
    });
  }

  initNetlifyForms();
})();
