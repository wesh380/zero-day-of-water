// Relative paths allow loading the bundle under subpath deployments
window.CLD_BUNDLE_URLS = [
  '../assets/dist/' + 'water-cld.bundle.js?v=3',
  './assets/dist/' + 'water-cld.bundle.js?v=3'
];

try {
  // اگر window.cy به خاطر id="cy" یک HTMLElement است، خنثی‌اش کن تا باندل بتواند cy instance را ست کند
  if (window.cy && window.cy.tagName) { window.cy = undefined; }
} catch (e) {}

document.addEventListener('cld:bundle:loaded', () => {
  const cy = window.CLD_SAFE && window.CLD_SAFE.cy;
  console.log('[CLD debug] bundle loaded. cy?', !!cy);
});
