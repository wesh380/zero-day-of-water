export async function waitForVisible(target, { timeout = 5000 } = {}) {
  const getElement = () => {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    if (target instanceof Element) return target;
    return null;
  };

  const initial = getElement();
  if (initial && initial.offsetParent !== null) return initial;

  return new Promise((resolve, reject) => {
    let rafId = 0;
    let timerId = 0;
    let observer = null;

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      if (observer) observer.disconnect();
      observer = null;
    };

    const check = () => {
      const node = getElement();
      if (node && node.offsetParent !== null) {
        cleanup();
        resolve(node);
        return;
      }
      rafId = requestAnimationFrame(check);
    };

    observer = new MutationObserver(check);
    try {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'data-state'],
      });
    } catch (_) {
      // ignore observer errors (e.g., document not ready yet)
    }

    timerId = setTimeout(() => {
      cleanup();
      reject(new Error(`waitForVisible timeout after ${timeout}ms`));
    }, timeout);

    check();
  });
}
