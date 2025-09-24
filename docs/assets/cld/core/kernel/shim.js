// Ensures a stable kernel object and a readiness promise without inline scripts.
(function () {
  const g = (typeof window !== 'undefined') ? window : globalThis;

  const hasSize = (el, minW = 80, minH = 80) =>
    !!el && el.offsetParent !== null && el.offsetWidth >= minW && el.offsetHeight >= minH;

  const waitForCyVisible = (timeout = 15000) => {
    const selector = '#cy';
    const useGlobal = typeof window !== 'undefined' && typeof window.waitForVisible === 'function';
    if (useGlobal) {
      return window.waitForVisible(selector, timeout).then((resolved) => {
        const el = resolved && typeof resolved === 'object' ? resolved : document.querySelector(selector);
        if (!hasSize(el)) throw new Error('kernelReady: #cy became visible without layout');
        return el;
      });
    }
    return new Promise((resolve, reject) => {
      const start = performance.now();
      (function tick() {
        const el = document.querySelector(selector);
        if (hasSize(el)) return resolve(el);
        if (performance.now() - start > timeout) return reject(new Error('kernelReady: #cy did not become visible in time'));
        requestAnimationFrame(tick);
      })();
    });
  };

  // --- 1) Kernel & Graph skeleton
  g.kernel = g.kernel || {};
  g.graphStore = g.graphStore || {};
  if (!g.kernel.graph && !g.graphStore.graph) {
    // build a minimal skeleton to avoid "nodes is undefined"
    g.graphStore.graph = { nodes: [], edges: [] };
  }

  // --- helpers
  const getGraph = () => g.kernel?.graph || g.graphStore?.graph || null;
  const getCyEl  = () => document.querySelector('#cy');
  const hasKernel = () => !!g.kernel;
  const hasGraph  = () => {
    const graph = getGraph();
    return !!graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges);
  };

  // resolve conditions:
  //   - kernel موجود
  //   - graph اسکلت حداقل {nodes:[],edges:[]} موجود
  //   - #cy وجود دارد (اندازه قبل از resolve با waitForVisible بررسی می‌شود)
  const readyNow = () => {
    const el = getCyEl();
    return hasKernel() && hasGraph() && !!el;
  };

  // --- 2) Single shared promise
  if (!g.kernelReady) {
    g.kernelReady = new Promise((resolve, reject) => {
      const startMs   = Date.now();
      const warnAtMs  = 1200;  // وقتی منتظر شدیم، یک هشدار بده
      const hardMs    = 8000;  // تایم‌اوت نهایی برای kernel/graph/#cy
      let warned = false;
      let resolved = false;
      let waitingForVisible = false;

      const stop = (ok, payload) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        ok ? resolve(payload) : reject(payload);
      };

      // listeners to speed up readiness
      const onDom = () => maybeResolve('dom');
      const onLoad = () => maybeResolve('load');

      const resizeObs = new ResizeObserver(() => maybeResolve('resize'));
      const elForObs = getCyEl();
      if (elForObs) resizeObs.observe(elForObs);

      function cleanup() {
        try {
          document.removeEventListener('DOMContentLoaded', onDom);
          g.removeEventListener?.('load', onLoad);
          resizeObs.disconnect();
          clearInterval(iv);
        } catch (_) {}
      }

      document.addEventListener('DOMContentLoaded', onDom, { once: true });
      g.addEventListener?.('load', onLoad, { once: true });

      function maybeResolve(trigger) {
        const el = getCyEl();
        const graph = getGraph();
        if (readyNow() && !waitingForVisible) {
          waitingForVisible = true;
          if (!hasSize(el)) {
            console.warn('[kernel-shim] #cy has no size yet; waiting for visibility (trigger:', trigger, ')');
          }
          waitForCyVisible(15000).then((visibleEl) => {
            const cy = visibleEl || el;
            if (!g.kernel.graph && graph) g.kernel.graph = graph;
            stop(true, { kernel: g.kernel, graph, el: cy });
          }).catch((err) => {
            stop(false, err instanceof Error ? err : new Error(String(err)));
          });
        }
      }

      // periodic check as fallback
      const iv = setInterval(() => {
        const now = Date.now();
        const waited = now - startMs;

        if (!warned && waited > warnAtMs) {
          warned = true;
          console.warn('[kernel-shim] waiting for kernel/graph/#cy...');
        }

        // try normal resolve
        if (readyNow()) return maybeResolve('interval-ready');

        // hard timeout (only before waiting for visibility)
        if (!waitingForVisible && waited > hardMs) {
          const el = getCyEl();
          const graph = getGraph();
          console.error('[kernel-shim] kernelReady timeout', {
            kernel: !!g.kernel,
            graph: graph ? {
              has: true,
              nodes: Array.isArray(graph.nodes) ? graph.nodes.length : 'n/a',
              edges: Array.isArray(graph.edges) ? graph.edges.length : 'n/a'
            } : { has: false },
            cy: el ? { w: el.offsetWidth, h: el.offsetHeight } : null
          });
          return stop(false, new Error('kernelReady timeout'));
        }
      }, 50);
    });
  }
})();
