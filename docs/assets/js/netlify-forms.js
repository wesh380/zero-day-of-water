(function() {
  'use strict';

  const forms = Array.from(document.querySelectorAll('form[data-netlify="true"]'));
  if (!forms.length) return;

  function encodeFormData(form) {
    const formData = new FormData(form);
    // Ensure form-name is present even if the hidden input is removed by Netlify post-processing
    if (!formData.get('form-name')) {
      const fallbackName = form.getAttribute('name') || '';
      if (fallbackName) formData.set('form-name', fallbackName);
    }
    return new URLSearchParams(formData).toString();
  }

  async function submitWithFetch(event) {
    event.preventDefault();
    const form = event.target;

    const encoded = encodeFormData(form);
    const target = form.getAttribute('action') || '/';

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: encoded,
      });

      if (response.ok) {
        window.location.assign(target);
        return;
      }
    } catch (error) {
      console.warn('[Netlify form] Falling back to native submit:', error?.message || error);
    }

    form.submit();
  }

  forms.forEach((form) => {
    if (form.dataset.netlifyManual === 'true') return;
    form.addEventListener('submit', submitWithFetch);
  });
})();
