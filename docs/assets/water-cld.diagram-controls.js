/**
 * ================================================
 * CLD Diagram Interactive Controls
 * ================================================
 * کنترل‌های تعاملی برای بهبود accessibility:
 * - دکمه‌های زوم (+/-/Fit)
 * - دکمه Fullscreen
 * - زوم هوشمند با scale متن
 * - بهبود tooltips
 */

(function() {
  'use strict';

  // منتظر آماده شدن Cytoscape
  function waitForCy(callback) {
    if (window.__WATER_CLD_READY__) {
      window.__WATER_CLD_READY__.then(callback);
    } else if (window.onCyReady) {
      window.onCyReady(callback);
    } else {
      document.addEventListener('cy:ready', function(e) {
        const cy = e.detail?.cy || (typeof getCy === 'function' && getCy()) || window.__cy || window.cy;
        if (cy) callback(cy);
      }, { once: true });
    }
  }

  /**
   * ایجاد دکمه‌های کنترل زوم
   */
  function createZoomControls(cy) {
    const wrap = document.getElementById('cy-wrap');
    if (!wrap) return;

    // بررسی وجود کنترل‌ها
    if (document.getElementById('cld-zoom-controls')) return;

    // ایجاد container
    const controls = document.createElement('div');
    controls.id = 'cld-zoom-controls';
    controls.setAttribute('role', 'toolbar');
    controls.setAttribute('aria-label', 'کنترل‌های زوم دیاگرام');

    // دکمه Zoom In
    const btnZoomIn = createButton('+', 'بزرگ‌نمایی', function() {
      const level = cy.zoom();
      const newLevel = Math.min(level * 1.2, 5);
      cy.animate({
        zoom: newLevel,
        duration: 200
      });
    });

    // دکمه Zoom Out
    const btnZoomOut = createButton('−', 'کوچک‌نمایی', function() {
      const level = cy.zoom();
      const newLevel = Math.max(level / 1.2, 0.5);
      cy.animate({
        zoom: newLevel,
        duration: 200
      });
    });

    // دکمه Fit (نمایش کل دیاگرام)
    const btnFit = createButton('⊡', 'نمایش کل دیاگرام', function() {
      try {
        const elements = cy.elements();
        if (elements.length > 0) {
          cy.fit(elements, 40);
        }
      } catch(e) {
        console.warn('Fit failed:', e);
      }
    });

    // دکمه Reset (بازگشت به zoom اولیه)
    const btnReset = createButton('⟲', 'بازگشت به حالت اولیه', function() {
      cy.animate({
        zoom: 1,
        pan: { x: 0, y: 0 },
        duration: 300
      });
    });

    controls.appendChild(btnZoomIn);
    controls.appendChild(btnZoomOut);
    controls.appendChild(btnFit);
    controls.appendChild(btnReset);

    wrap.appendChild(controls);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // فقط اگر focus روی دیاگرام باشد
      if (!wrap.contains(document.activeElement) && document.activeElement !== wrap) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        btnZoomIn.click();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        btnZoomOut.click();
      } else if (e.key === '0') {
        e.preventDefault();
        btnFit.click();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        btnReset.click();
      }
    });
  }

  /**
   * ایجاد دکمه Fullscreen
   */
  function createFullscreenButton(cy) {
    const wrap = document.getElementById('cy-wrap');
    if (!wrap) return;

    // بررسی وجود دکمه
    if (document.getElementById('cld-fullscreen-btn')) return;

    const btn = createButton('⛶', 'حالت تمام‌صفحه', function() {
      toggleFullscreen(wrap, cy);
    });
    btn.id = 'cld-fullscreen-btn';

    wrap.appendChild(btn);

    // ESC برای خروج از fullscreen
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && wrap.classList.contains('fullscreen')) {
        toggleFullscreen(wrap, cy);
      }
    });

    // بررسی تغییرات fullscreen API
    document.addEventListener('fullscreenchange', function() {
      if (!document.fullscreenElement && wrap.classList.contains('fullscreen')) {
        wrap.classList.remove('fullscreen');
        cy.resize();
        cy.fit(cy.elements(), 40);
      }
    });
  }

  /**
   * تابع کمکی برای ایجاد دکمه
   */
  function createButton(icon, label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'cld-zoom-btn';
    btn.innerHTML = icon;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.onclick = onClick;
    return btn;
  }

  /**
   * تعویض حالت Fullscreen
   */
  function toggleFullscreen(wrap, cy) {
    if (wrap.classList.contains('fullscreen')) {
      wrap.classList.remove('fullscreen');
      // خروج از fullscreen API اگر فعال باشد
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function(e) {
          console.warn('Exit fullscreen failed:', e);
        });
      }
    } else {
      wrap.classList.add('fullscreen');
      // فعال‌سازی fullscreen API
      if (wrap.requestFullscreen) {
        wrap.requestFullscreen().catch(function(e) {
          console.warn('Fullscreen request failed:', e);
        });
      } else if (wrap.webkitRequestFullscreen) {
        wrap.webkitRequestFullscreen();
      } else if (wrap.mozRequestFullScreen) {
        wrap.mozRequestFullScreen();
      } else if (wrap.msRequestFullscreen) {
        wrap.msRequestFullscreen();
      }
    }

    // resize و fit بعد از تغییر
    setTimeout(function() {
      cy.resize();
      cy.fit(cy.elements(), 40);
    }, 300);
  }

  /**
   * بهبود زوم هوشمند - اسکیل معکوس برای متن
   */
  function enhanceSmartZoom(cy) {
    let zoomTimeout;

    cy.on('zoom', function() {
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function() {
        const zoom = cy.zoom();

        // مقیاس معکوس برای فونت نودها
        cy.batch(function() {
          cy.nodes().forEach(function(node) {
            // محاسبه فونت بر اساس zoom
            let baseFontSize = 16; // پایه
            if (window.innerWidth <= 640) {
              baseFontSize = 20; // موبایل
            } else if (window.innerWidth <= 1024) {
              baseFontSize = 18; // تبلت
            }

            // اسکیل معکوس: هرچه zoom بیشتر، فونت کوچک‌تر (تا حد معقول)
            const scaledFontSize = Math.max(12, Math.min(28, baseFontSize / Math.sqrt(zoom)));

            node.style({
              'font-size': scaledFontSize + 'px'
            });
          });

          // مقیاس معکوس برای فونت یال‌ها
          cy.edges().forEach(function(edge) {
            let baseEdgeFontSize = 13;
            if (window.innerWidth <= 640) {
              baseEdgeFontSize = 15;
            } else if (window.innerWidth <= 1024) {
              baseEdgeFontSize = 14;
            }

            const scaledEdgeFontSize = Math.max(10, Math.min(18, baseEdgeFontSize / Math.sqrt(zoom)));

            edge.style({
              'font-size': scaledEdgeFontSize + 'px'
            });
          });
        });
      }, 50); // debounce برای کارایی
    });
  }

  /**
   * بهبود استایل‌های Cytoscape برای خوانایی بهتر
   */
  function improveNodeStyles(cy) {
    // رنگ‌های بهبود یافته
    const colors = {
      nodeFill: '#f0f4f8',
      nodeBorder: '#64748b',
      nodeText: '#0f172a',
      edgePos: '#16a34a',
      edgeNeg: '#dc2626',
      edgeLine: '#475569',
      highlight: '#60a5fa'
    };

    // استایل‌های پایه برای نودها و یال‌ها
    const styles = [
      // نودها: فونت بزرگ‌تر، کنتراست بالاتر
      {
        selector: 'node',
        style: {
          'background-color': colors.nodeFill,
          'border-color': colors.nodeBorder,
          'border-width': 3,
          'color': colors.nodeText,
          'font-size': '16px',
          'font-weight': 700,
          'text-outline-width': 0,
          'width': 'label',
          'height': 'label',
          'padding': '22px',
          'text-wrap': 'wrap',
          'text-max-width': '280px',
          'min-width': '160px',
          'min-height': '72px',
          'shape': 'round-rectangle',
          'text-valign': 'center',
          'text-halign': 'center',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.15)'
        }
      },
      // یال‌ها: ضخیم‌تر و با کنتراست بهتر
      {
        selector: 'edge',
        style: {
          'width': 3.5,
          'line-color': colors.edgeLine,
          'target-arrow-color': colors.edgeLine,
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
          'curve-style': 'bezier',
          'font-size': '13px',
          'font-weight': 600,
          'color': '#ffffff',
          'text-background-color': 'rgba(15, 23, 42, 0.9)',
          'text-background-opacity': 1,
          'text-background-padding': 5,
          'text-background-shape': 'roundrectangle',
          'text-rotation': 'autorotate'
        }
      },
      // یال مثبت
      {
        selector: 'edge[sign = "+"], edge.pos',
        style: {
          'line-color': colors.edgePos,
          'target-arrow-color': colors.edgePos,
          'width': 4
        }
      },
      // یال منفی
      {
        selector: 'edge[sign = "-"], edge.neg',
        style: {
          'line-color': colors.edgeNeg,
          'target-arrow-color': colors.edgeNeg,
          'width': 4
        }
      },
      // یال با تأخیر (خط‌چین)
      {
        selector: 'edge[delayYears > 0]',
        style: {
          'line-style': 'dashed',
          'line-dash-pattern': [10, 8]
        }
      },
      // حالت highlight
      {
        selector: '.highlight',
        style: {
          'border-color': colors.highlight,
          'border-width': 4
        }
      },
      {
        selector: 'edge.highlight',
        style: {
          'line-color': colors.highlight,
          'target-arrow-color': colors.highlight,
          'width': 5
        }
      },
      // حالت faded
      {
        selector: '.faded',
        style: {
          'opacity': 0.15
        }
      },
      // حالت hidden
      {
        selector: '.hidden',
        style: {
          'display': 'none'
        }
      }
    ];

    // اعمال استایل‌ها
    cy.style().fromJson(styles).update();
  }

  /**
   * بهبود tooltips با استفاده از Tippy
   */
  function improveTooltips(cy) {
    if (!window.tippy) return;

    // تنظیمات پیش‌فرض Tippy
    const defaultProps = {
      theme: 'cld',
      allowHTML: true,
      interactive: false,
      arrow: true,
      placement: 'top',
      delay: [200, 0],
      duration: [150, 100],
      maxWidth: 300
    };

    // tooltip برای نودها
    cy.on('mouseover', 'node', function(evt) {
      const node = evt.target;
      if (node.scratch('_tippy')) return;

      const data = node.data();
      let content = '<div dir="rtl" style="text-align: right;">';
      content += '<div style="font-weight: 700; margin-bottom: 6px; font-size: 15px;">';
      content += escapeHtml(data.label || data.id || '');
      content += '</div>';

      if (data.desc) {
        content += '<div style="margin-bottom: 6px;">';
        content += escapeHtml(data.desc);
        content += '</div>';
      }

      const meta = [];
      if (data.unit) meta.push('واحد: ' + escapeHtml(data.unit));
      if (data.group) meta.push('گروه: ' + escapeHtml(data.group));

      if (meta.length > 0) {
        content += '<div style="font-size: 13px; opacity: 0.9; margin-top: 6px;">';
        content += meta.join(' • ');
        content += '</div>';
      }

      content += '</div>';

      const tip = tippy(document.body, Object.assign({}, defaultProps, {
        getReferenceClientRect: function() {
          const bb = node.renderedBoundingBox({ includeLabels: true });
          const rect = cy.container().getBoundingClientRect();
          return {
            width: bb.w,
            height: bb.h,
            top: rect.top + bb.y1,
            left: rect.left + bb.x1,
            right: rect.left + bb.x2,
            bottom: rect.top + bb.y2
          };
        },
        content: content
      }));

      node.scratch('_tippy', tip);
      tip.show();
    });

    cy.on('mouseout', 'node', function(evt) {
      const tip = evt.target.scratch('_tippy');
      if (tip) {
        tip.destroy();
        evt.target.scratch('_tippy', null);
      }
    });

    // tooltip برای یال‌ها
    cy.on('mouseover', 'edge', function(evt) {
      const edge = evt.target;
      if (edge.scratch('_tippy')) return;

      const data = edge.data();
      let content = '<div dir="rtl" style="text-align: right;">';
      content += '<div style="font-weight: 700; margin-bottom: 6px;">';
      content += escapeHtml(data.label || '');
      content += '</div>';

      const meta = [];
      if (data.sign) {
        meta.push('قطبیت: ' + (data.sign === '+' ? 'مثبت (+)' : 'منفی (−)'));
      }
      if (typeof data.weight === 'number') {
        meta.push('وزن: ' + data.weight.toFixed(2));
      }
      if (typeof data.delayYears === 'number' && data.delayYears > 0) {
        meta.push('تأخیر: ' + data.delayYears + ' سال');
      }

      if (meta.length > 0) {
        content += '<div style="font-size: 13px;">';
        content += meta.join(' • ');
        content += '</div>';
      }

      content += '</div>';

      const tip = tippy(document.body, Object.assign({}, defaultProps, {
        getReferenceClientRect: function() {
          const bb = edge.renderedBoundingBox();
          const rect = cy.container().getBoundingClientRect();
          return {
            width: bb.w || 10,
            height: bb.h || 10,
            top: rect.top + bb.y1,
            left: rect.left + bb.x1,
            right: rect.left + bb.x2,
            bottom: rect.top + bb.y2
          };
        },
        content: content
      }));

      edge.scratch('_tippy', tip);
      tip.show();
    });

    cy.on('mouseout', 'edge', function(evt) {
      const tip = evt.target.scratch('_tippy');
      if (tip) {
        tip.destroy();
        evt.target.scratch('_tippy', null);
      }
    });

    // به‌روزرسانی tooltips هنگام zoom/pan
    cy.on('zoom pan', function() {
      cy.$('node, edge').forEach(function(ele) {
        const tip = ele.scratch('_tippy');
        if (tip && tip.state.isVisible) {
          if (tip.popperInstance && tip.popperInstance.update) {
            tip.popperInstance.update();
          }
        }
      });
    });
  }

  /**
   * تابع کمکی برای escape کردن HTML
   */
  function escapeHtml(text) {
    if (text == null) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  /**
   * اضافه کردن نشانگر بارگذاری
   */
  function addLoadingIndicator() {
    const wrap = document.getElementById('cy-wrap');
    if (wrap) {
      wrap.classList.add('loading');

      // حذف بعد از بارگذاری
      waitForCy(function() {
        setTimeout(function() {
          wrap.classList.remove('loading');
        }, 500);
      });
    }
  }

  /**
   * Initialization
   */
  function init() {
    waitForCy(function(cy) {
      try {
        // ایجاد کنترل‌ها
        createZoomControls(cy);
        createFullscreenButton(cy);

        // بهبود استایل‌ها
        improveNodeStyles(cy);

        // فعال‌سازی زوم هوشمند
        enhanceSmartZoom(cy);

        // بهبود tooltips
        improveTooltips(cy);

        console.log('[CLD Diagram Controls] Initialized successfully');
      } catch(e) {
        console.error('[CLD Diagram Controls] Initialization failed:', e);
      }
    });

    // نشانگر بارگذاری
    addLoadingIndicator();
  }

  // اجرای اولیه
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export برای استفاده در سایر ماژول‌ها
  window.CLDDiagramControls = {
    init: init,
    improveNodeStyles: improveNodeStyles,
    enhanceSmartZoom: enhanceSmartZoom
  };

})();
