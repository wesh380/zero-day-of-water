(function () {
  function removeBadge(el) {
    if (el) el.remove();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.date-badge').forEach(removeBadge);
    document.querySelectorAll('time.update-date').forEach(removeBadge);
  });
})();
