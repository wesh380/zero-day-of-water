(function () {
  const root = document.documentElement;
  const header = document.querySelector('header, .site-header, nav[role="navigation"]');
  const footer = document.querySelector('footer, .site-footer');
  function setHF() {
    const hh = header ? header.getBoundingClientRect().height : 0;
    const fh = footer ? footer.getBoundingClientRect().height : 0;
    root.style.setProperty('--header-h', hh + 'px');
    root.style.setProperty('--footer-h', fh + 'px');
  }
  setHF();
  addEventListener('load', setHF);
  addEventListener('resize', setHF);
})();
