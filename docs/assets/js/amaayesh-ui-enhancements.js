/**
 * بهبودهای UI برای نقشه آمایش انرژی
 * شامل: Legend، راهنماها، کنترل‌های بهتر
 */

(function() {
  'use strict';

  // ✅ منتظر بمانید تا map آماده شود
  const waitForMap = () => {
    return new Promise((resolve) => {
      const checkMap = () => {
        if (window.__AMA_MAP) {
          resolve(window.__AMA_MAP);
        } else {
          setTimeout(checkMap, 100);
        }
      };
      checkMap();
    });
  };

  // ✅ اضافه کردن Legend به نقشه
  const addLegend = (map) => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <div class="legend-header">
          <h3>راهنمای نقشه</h3>
          <button class="legend-toggle" aria-label="بستن/باز کردن راهنما">−</button>
        </div>
        <div class="legend-content">
          <div class="legend-section">
            <h4>مرزها</h4>
            <div class="legend-item">
              <span class="legend-line legend-province"></span>
              <span>مرز استان خراسان رضوی</span>
            </div>
            <div class="legend-item">
              <span class="legend-line legend-county"></span>
              <span>مرزهای شهرستان‌ها</span>
            </div>
          </div>
          <div class="legend-section">
            <h4>سایت‌های انرژی</h4>
            <div class="legend-item">
              <span class="legend-marker">💨</span>
              <span>سایت‌های بادی (${window.AMA?.G?.wind?.getLayers()?.[0]?.getLayers?.()?.length || 23})</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker">☀️</span>
              <span>سایت‌های خورشیدی (${window.AMA?.G?.solar?.getLayers()?.[0]?.getLayers?.()?.length || 37})</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker">💧</span>
              <span>سدها و منابع آب (${window.AMA?.G?.dams?.getLayers()?.[0]?.getLayers?.()?.length || 24})</span>
            </div>
          </div>
          <div class="legend-section legend-help">
            <h4>نکات</h4>
            <ul>
              <li>روی نقاط کلیک کنید تا جزئیات ببینید</li>
              <li>با scroll زوم کنید</li>
              <li>برای بازگشت به نمای کلی دکمه ↺ را بزنید</li>
            </ul>
          </div>
        </div>
      `;

      // Toggle legend
      const toggleBtn = div.querySelector('.legend-toggle');
      const content = div.querySelector('.legend-content');
      let isCollapsed = false;

      toggleBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        content.style.display = isCollapsed ? 'none' : 'block';
        toggleBtn.textContent = isCollapsed ? '+' : '−';
      });

      return div;
    };

    legend.addTo(map);
    console.log('[AMA-UI] Legend added');
    return legend;
  };

  // ✅ اضافه کردن Info Panel
  const addInfoPanel = (map) => {
    const info = L.control({ position: 'topright' });

    info.onAdd = function() {
      this._div = L.DomUtil.create('div', 'map-info-panel');
      this.update();
      return this._div;
    };

    info.update = function(props) {
      const content = props
        ? `
          <h4>${props.name_fa || props.name || 'نامشخص'}</h4>
          <p><strong>نوع:</strong> ${props.type || 'نامشخص'}</p>
          ${props.capacity_mw ? `<p><strong>ظرفیت:</strong> ${props.capacity_mw} مگاوات</p>` : ''}
          ${props.county ? `<p><strong>شهرستان:</strong> ${props.county}</p>` : ''}
        `
        : '<p class="map-info-hint">روی یک سایت انرژی کلیک کنید</p>';

      this._div.innerHTML = content;
    };

    info.addTo(map);
    console.log('[AMA-UI] Info panel added');
    return info;
  };

  // ✅ بهبود کنترل‌های نقشه
  const enhanceControls = (map) => {
    // اضافه کردن دکمه fullscreen
    const fullscreenBtn = L.control({ position: 'topleft' });

    fullscreenBtn.onAdd = function() {
      const btn = L.DomUtil.create('button', 'map-control-btn');
      btn.innerHTML = '⛶';
      btn.title = 'تمام صفحه';
      btn.setAttribute('aria-label', 'تمام صفحه');

      btn.onclick = () => {
        const mapEl = document.getElementById('map');
        if (mapEl) {
          if (!document.fullscreenElement) {
            mapEl.requestFullscreen().catch(err => {
              console.warn('[AMA-UI] Fullscreen failed:', err);
            });
          } else {
            document.exitFullscreen();
          }
        }
      };

      L.DomEvent.disableClickPropagation(btn);
      return btn;
    };

    fullscreenBtn.addTo(map);

    // اضافه کردن دکمه reset view
    const resetBtn = L.control({ position: 'topleft' });

    resetBtn.onAdd = function() {
      const btn = L.DomUtil.create('button', 'map-control-btn');
      btn.innerHTML = '↺';
      btn.title = 'بازگشت به نمای کلی';
      btn.setAttribute('aria-label', 'بازگشت به نمای کلی');

      btn.onclick = () => {
        if (window.__mapBounds) {
          map.fitBounds(window.__mapBounds);
        } else {
          map.setView([36.3, 59.6], 7);
        }
      };

      L.DomEvent.disableClickPropagation(btn);
      return btn;
    };

    resetBtn.addTo(map);

    console.log('[AMA-UI] Enhanced controls added');
  };

  // ✅ راهنمای اولیه (Tour)
  const showInitialGuide = () => {
    // فقط یکبار نمایش بده
    if (localStorage.getItem('amaayesh_tour_shown')) return;

    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    overlay.innerHTML = `
      <div class="tour-dialog">
        <h2>🗺️ خوش آمدید به نقشه آمایش انرژی</h2>
        <p>این نقشه پتانسیل انرژی‌های تجدیدپذیر خراسان رضوی را نمایش می‌دهد:</p>
        <ul>
          <li>💨 سایت‌های بادی</li>
          <li>☀️ سایت‌های خورشیدی</li>
          <li>💧 سدها و منابع آب</li>
        </ul>
        <p><strong>نکات:</strong></p>
        <ul>
          <li>روی نقاط کلیک کنید تا جزئیات ببینید</li>
          <li>از scroll برای زوم استفاده کنید</li>
          <li>راهنما در پایین سمت راست قرار دارد</li>
        </ul>
        <button class="tour-close-btn">متوجه شدم</button>
        <label class="tour-checkbox">
          <input type="checkbox" id="tour-dont-show">
          <span>دیگر نمایش نده</span>
        </label>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.tour-close-btn');
    const dontShowCheckbox = overlay.querySelector('#tour-dont-show');

    closeBtn.addEventListener('click', () => {
      if (dontShowCheckbox.checked) {
        localStorage.setItem('amaayesh_tour_shown', 'true');
      }
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  };

  // ✅ Initialize همه چیز
  (async () => {
    try {
      const map = await waitForMap();

      // اضافه کردن ویژگی‌ها
      addLegend(map);
      addInfoPanel(map);
      enhanceControls(map);

      // نمایش راهنمای اولیه بعد از 2 ثانیه
      setTimeout(showInitialGuide, 2000);

      console.log('[AMA-UI] All enhancements initialized');
    } catch (error) {
      console.error('[AMA-UI] Initialization failed:', error);
    }
  })();

})();
