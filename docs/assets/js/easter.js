(function () {
  function init() {
    if (!document.body || document.body.dataset.page !== "home") {
      return;
    }

    const root = document.documentElement;
    const ensureRevealFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("wesh") === "1" || window.location.hash === "#wesh") {
          root.classList.add("dev-show-experimental");
        }
      } catch (err) {
        /* ignore parse issues */
      }
    };

    const resolveAnchor = (id) => {
      const direct = document.querySelector(`a[data-cta="${id}"]`);
      if (direct) {
        return direct;
      }
      const container = document.querySelector(`[data-cta="${id}"]`);
      if (!container) {
        return null;
      }
      if (container.tagName && container.tagName.toLowerCase() === "a") {
        return container;
      }
      const inner = container.querySelector("a[href]");
      if (inner) {
        return inner;
      }
      const outer = container.closest("a[href]");
      return outer || null;
    };

    let portalsReady = false;
    const ensurePortals = () => {
      if (portalsReady) {
        return;
      }
      const amaayesh = resolveAnchor("amaayesh");
      const waterLab = resolveAnchor("water-lab");
      if (!amaayesh && !waterLab) {
        return;
      }
      const container = document.createElement("div");
      container.id = "secret-portals";

      const addPortal = (href, extraClass, label) => {
        if (!href) {
          return;
        }
        const link = document.createElement("a");
        link.className = `easter-hotspot ${extraClass}`;
        link.href = href;
        link.setAttribute("aria-label", label);
        container.appendChild(link);
      };

      addPortal(amaayesh && amaayesh.href, "easter-top-left", "پورتال آمایش");
      addPortal(waterLab && waterLab.href, "easter-top-right", "پورتال مدل آب");

      if (container.childElementCount > 0) {
        document.body.appendChild(container);
        portalsReady = true;
      }
    };

    ensureRevealFromUrl();
    ensurePortals();
    setTimeout(ensurePortals, 500);

    window.addEventListener("hashchange", ensureRevealFromUrl);
    window.addEventListener("popstate", ensureRevealFromUrl);

    let comboStep = 0;
    let lastKeyAt = 0;
    document.addEventListener("keydown", (event) => {
      if (!event.shiftKey) {
        return;
      }
      const now = Date.now();
      if (!lastKeyAt || now - lastKeyAt > 2000) {
        comboStep = 0;
      }
      const key = event.key ? event.key.toUpperCase() : "";
      if (key === "W" && comboStep === 0) {
        comboStep = 1;
        lastKeyAt = now;
        return;
      }
      if (key === "E" && comboStep === 1) {
        root.classList.toggle("dev-show-experimental");
        comboStep = 0;
        lastKeyAt = now;
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
