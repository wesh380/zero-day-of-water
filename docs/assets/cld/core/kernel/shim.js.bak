// Ensures a stable kernel object and a readiness promise without inline scripts.
(function () {
  const g = (typeof window !== 'undefined') ? window : globalThis;

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

  const cyHasSize = (el) => !!el && el.offsetWidth > 0 && el.offsetHeight > 0;
  const hasKernel = () => !!g.kernel;
  const hasGraph  = () => {
    const graph = getGraph();
    return !!graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges);
  };

  // resolve conditions:
  //   - kernel موجود
  //   - graph اسکلت حداقل {nodes:[],edges:[]} موجود
  //   - #cy وجود دارد (اندازه اگر صفر بود بعداً با resize درست می‌کنیم)
  const readyNow = () => {
    const el = getCyEl();
    return hasKernel() && hasGraph() && !!el;
  };

  // --- 2) Single shared promise
  if (!g.kernelReady) {
    g.kernelReady = new Promise((resolve, reject) => {
      const startMs   = Date.now();
      const warnAtMs  = 1200;  // وقتی منتظر شدیم، یک هشدار بده
      const softAtMs  = 3000;  // اگر cy بی‌ابعاد بود، بعد از این لحظه با هشدار هم resolve می‌کنیم
      const hardMs    = 8000;  // تایم‌اوت نهایی
      let warned = false;
      let resolved = false;

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
        if (readyNow()) {
          if (!cyHasSize(el)) {
            console.warn('[kernel-shim] cy exists but has no size yet; continuing (trigger:', trigger, ')');
          }
          // normalize: ensure kernel.graph is set
          if (!g.kernel.graph && graph) g.kernel.graph = graph;
          return stop(true, { kernel: g.kernel, graph, el });
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

        // soft resolve: cy exists but no size yet → allow proceed after softAtMs
        const el = getCyEl();
        if (el && waited > softAtMs && hasKernel() && hasGraph()) {
          console.warn('[kernel-shim] soft-resolve: #cy has no size yet; allowing continue');
          const graph = getGraph();
          if (!g.kernel.graph && graph) g.kernel.graph = graph;
          return stop(true, { kernel: g.kernel, graph, el });
        }

        // hard timeout
        if (waited > hardMs) {
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
