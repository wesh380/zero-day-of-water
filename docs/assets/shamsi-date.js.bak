(function () {
  const fmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric', month: 'long', day: '2-digit'
  });

  function parseInputDate(s, hint) {
    if (!s) return null;
    s = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s) || hint === 'YYYY-MM-DD') {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(s) || hint === 'DD-MM-YYYY') {
      const [d, m, y] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const dt = new Date(s);
    return isNaN(dt) ? null : dt;
  }

  function renderBadge(el, date) {
    if (!date) return;
    const text = fmt.format(date);
    el.innerHTML = `
      <span class="date-chip" title="آخرین به‌روزرسانی">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm14 8H3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10zm-5 5h-4v4h4v-4z" fill="currentColor"/>
        </svg>
        <span>آخرین به‌روزرسانی: ${text}</span>
      </span>
    `;
    el.classList.add('date-badge-mounted');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.date-badge').forEach(el => {
      const raw = el.getAttribute('data-gregorian') || el.textContent;
      const dt = parseInputDate(raw, el.getAttribute('data-input-format'));
      renderBadge(el, dt);
    });
    document.querySelectorAll('time.update-date').forEach(t => {
      const raw = t.getAttribute('datetime') || t.textContent;
      const dt = parseInputDate(raw, t.getAttribute('data-input-format'));
      const wrap = document.createElement('div');
      wrap.className = 'date-badge';
      t.replaceWith(wrap);
      renderBadge(wrap, dt);
    });
  });
})();
