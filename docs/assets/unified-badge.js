(function(){
  if (window.__UNIFIED_BADGE_LOADED__) return; // guard
  window.__UNIFIED_BADGE_LOADED__ = true;

  function installBadges(){
    document.querySelectorAll('.dash-card').forEach(card => {
      // هر نشانهٔ تاریخ قبلی را حذف کن تا دوتا نشود
      card.querySelectorAll('.dash-badge-wrap, .date-badge, .date-chip, time.update-date').forEach(el => el.remove());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    if (!html.getAttribute('data-theme')) {
      const p = location.pathname;
      html.setAttribute('data-theme',
        p.startsWith('/electricity') ? 'electric' :
        p.startsWith('/water')       ? 'water'   :
        p.startsWith('/gas')         ? 'gas'     : 'electric');
    }
    installBadges();
  });
})();
