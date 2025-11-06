/**
 * افزودن آیکون‌های Font Awesome به نودهای CLD
 * این فایل بر اساس محتوای نودها، آیکون مناسب را اضافه می‌کند
 */

(function() {
  'use strict';

  // نقشه آیکون‌ها: کلیدواژه‌های فارسی/انگلیسی به آیکون Font Awesome
  const iconMap = {
    // آب و منابع آبی
    'آب': 'fa-droplet',
    'water': 'fa-droplet',
    'تقاضا': 'fa-chart-line',
    'demand': 'fa-chart-line',
    'عرضه': 'fa-hand-holding-water',
    'supply': 'fa-hand-holding-water',
    'مصرف': 'fa-tint',
    'consumption': 'fa-tint',
    'تلفات': 'fa-leak',
    'leakage': 'fa-leak',
    'شبکه': 'fa-project-diagram',
    'network': 'fa-project-diagram',
    'سد': 'fa-water',
    'dam': 'fa-water',
    'رودخانه': 'fa-water',
    'river': 'fa-water',
    'چاه': 'fa-circle-dot',
    'well': 'fa-circle-dot',
    'بارندگی': 'fa-cloud-rain',
    'rainfall': 'fa-cloud-rain',
    'خشکسالی': 'fa-temperature-high',
    'drought': 'fa-temperature-high',

    // اقتصادی و مالی
    'قیمت': 'fa-dollar-sign',
    'price': 'fa-dollar-sign',
    'هزینه': 'fa-coins',
    'cost': 'fa-coins',
    'درآمد': 'fa-money-bill-trend-up',
    'income': 'fa-money-bill-trend-up',
    'سرمایه': 'fa-sack-dollar',
    'capital': 'fa-sack-dollar',
    'بودجه': 'fa-wallet',
    'budget': 'fa-wallet',

    // کشاورزی
    'کشاورزی': 'fa-seedling',
    'agriculture': 'fa-seedling',
    'آبیاری': 'fa-spray-can-sparkles',
    'irrigation': 'fa-spray-can-sparkles',
    'محصول': 'fa-wheat-awn',
    'crop': 'fa-wheat-awn',
    'مزرعه': 'fa-tractor',
    'farm': 'fa-tractor',
    'بهره': 'fa-percent',
    'efficiency': 'fa-percent',

    // جمعیت و اجتماعی
    'جمعیت': 'fa-users',
    'population': 'fa-users',
    'سرانه': 'fa-user',
    'per capita': 'fa-user',
    'خانوار': 'fa-house-user',
    'household': 'fa-house-user',

    // انرژی
    'انرژی': 'fa-bolt',
    'energy': 'fa-bolt',
    'برق': 'fa-plug',
    'electricity': 'fa-plug',
    'پمپ': 'fa-gear',
    'pump': 'fa-gear',

    // محیط زیست
    'محیط': 'fa-leaf',
    'environment': 'fa-leaf',
    'آلودگی': 'fa-smog',
    'pollution': 'fa-smog',
    'کیفیت': 'fa-certificate',
    'quality': 'fa-certificate',

    // زمان و تأخیر
    'زمان': 'fa-clock',
    'time': 'fa-clock',
    'تأخیر': 'fa-hourglass-half',
    'delay': 'fa-hourglass-half',

    // عمومی
    'سیاست': 'fa-landmark',
    'policy': 'fa-landmark',
    'مدیریت': 'fa-sitemap',
    'management': 'fa-sitemap',
    'فناوری': 'fa-microchip',
    'technology': 'fa-microchip',
    'نوآوری': 'fa-lightbulb',
    'innovation': 'fa-lightbulb',
    'سرمایه‌گذاری': 'fa-hand-holding-dollar',
    'investment': 'fa-hand-holding-dollar'
  };

  /**
   * پیدا کردن آیکون مناسب برای یک نود بر اساس برچسب آن
   * @param {string} label - برچسب نود
   * @returns {string|null} - کلاس Font Awesome یا null
   */
  function findIconForLabel(label) {
    if (!label) return null;

    const lowerLabel = label.toLowerCase().trim();

    // جستجو در نقشه آیکون‌ها
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (lowerLabel.includes(keyword.toLowerCase())) {
        return icon;
      }
    }

    // آیکون پیش‌فرض برای نودهایی که هیچ مطابقتی ندارند
    return 'fa-circle';
  }

  /**
   * اضافه کردن آیکون‌ها به نودها
   * @param {object} cy - نمونه Cytoscape
   */
  function addIconsToNodes(cy) {
    if (!cy || typeof cy.nodes !== 'function') {
      console.warn('[node-icons] Cytoscape instance not ready');
      return;
    }

    cy.nodes().forEach(node => {
      // فقط نودهای معمولی (نه parent/compound)
      if (node.isParent && node.isParent()) return;

      const label = node.data('label') || node.data('_label') || node.id();
      const icon = findIconForLabel(label);

      if (icon) {
        // ذخیره آیکون در data نود
        node.data('icon', icon);

        // اضافه کردن آیکون به ابتدای برچسب (اگر قبلاً اضافه نشده)
        const currentLabel = node.data('label') || '';
        if (!currentLabel.includes('')) {
          // استفاده از Unicode character برای نمایش ساده
          // در صورت نیاز به نمایش واقعی آیکون، باید از روش‌های پیشرفته‌تر استفاده شود
          const iconPrefix = getIconPrefix(icon);
          if (iconPrefix) {
            node.data('label', `${iconPrefix} ${currentLabel}`);
          }
        }
      }
    });

    console.log('[node-icons] Icons added to nodes');
  }

  /**
   * دریافت پیشوند یونیکد برای آیکون‌های رایج
   * @param {string} iconClass - کلاس Font Awesome
   * @returns {string} - کاراکتر یونیکد
   */
  function getIconPrefix(iconClass) {
    const unicodeMap = {
      'fa-droplet': '💧',
      'fa-tint': '💦',
      'fa-water': '🌊',
      'fa-chart-line': '📈',
      'fa-hand-holding-water': '🚰',
      'fa-cloud-rain': '🌧️',
      'fa-temperature-high': '🌡️',
      'fa-dollar-sign': '💲',
      'fa-coins': '🪙',
      'fa-seedling': '🌱',
      'fa-wheat-awn': '🌾',
      'fa-users': '👥',
      'fa-user': '👤',
      'fa-house-user': '🏠',
      'fa-bolt': '⚡',
      'fa-plug': '🔌',
      'fa-leaf': '🍃',
      'fa-clock': '🕐',
      'fa-hourglass-half': '⏳',
      'fa-landmark': '🏛️',
      'fa-sitemap': '🗂️',
      'fa-lightbulb': '💡',
      'fa-circle': '⭕'
    };

    return unicodeMap[iconClass] || '';
  }

  /**
   * آماده‌سازی و اجرای افزودن آیکون‌ها
   */
  function init() {
    // منتظر آماده شدن Cytoscape
    const checkCy = () => {
      const cy = (window.CLD_CORE && window.CLD_CORE.getCy && window.CLD_CORE.getCy())
                 || window.__cy
                 || window.cy;

      if (cy && typeof cy.nodes === 'function') {
        // اضافه کردن آیکون‌ها به نودهای موجود
        addIconsToNodes(cy);

        // گوش دادن به رویداد افزودن نودهای جدید
        cy.on('add', 'node', function(evt) {
          const node = evt.target;
          if (node.isParent && node.isParent()) return;

          const label = node.data('label') || node.data('_label') || node.id();
          const icon = findIconForLabel(label);

          if (icon) {
            node.data('icon', icon);
            const currentLabel = node.data('label') || '';
            const iconPrefix = getIconPrefix(icon);
            if (iconPrefix && !currentLabel.includes(iconPrefix)) {
              node.data('label', `${iconPrefix} ${currentLabel}`);
            }
          }
        });

        return true;
      }
      return false;
    };

    // تلاش برای یافتن cy
    if (!checkCy()) {
      // گوش دادن به رویداد آمادگی
      if (typeof window.onCyReady === 'function') {
        window.onCyReady(addIconsToNodes);
      } else {
        document.addEventListener('cy:ready', function(evt) {
          const cy = evt.detail && evt.detail.cy;
          if (cy) addIconsToNodes(cy);
        });
      }

      // همچنین گوش دادن به رویداد بارگذاری مدل
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(checkCy, 1000);
      });
    }
  }

  // اجرای init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // صادر کردن برای استفاده در سایر ماژول‌ها
  if (typeof window !== 'undefined') {
    window.CLD_NODE_ICONS = {
      addIconsToNodes: addIconsToNodes,
      findIconForLabel: findIconForLabel
    };
  }

})();
