(() => {
  // Relative paths allow loading the bundle under subpath deployments
  window.CLD_BUNDLE_URLS = [
    '../assets/dist/' + 'water-cld.bundle.js?v=3',
    './assets/dist/' + 'water-cld.bundle.js?v=3'
  ];
  try {
    if (window.cy && window.cy.tagName) { window.cy = undefined; }
  } catch (e) {}
})();

