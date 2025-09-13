/* global fetch, location */
// @ts-check
// Resolve JSON from the first reachable candidate URL.
(function (global) {
  let __cldErrCount = 0;
  let __cldErrWindowTs = 0;
  function circuitOpen() {
    const now = Date.now();
    if (now - __cldErrWindowTs > 5000) { __cldErrWindowTs = now; __cldErrCount = 0; }
    __cldErrCount++;
    if (__cldErrCount >= 3) {
      try { /** @type {any} */ (global).__cldFetchLocked = true; } catch (_) {}
      return true;
    }
    return false;
  }

  /**
   * @typedef {{ timeoutMs?: number, maxAttempts?: number, fetchFn?: typeof fetch }} FetchOpts
   * @param {string[]} candidates
   * @param {FetchOpts} [opt]
   * @returns {Promise<{json: any, url: string}>}
   */
  async function fetchFirstJSON(candidates, opt = {}) {
    if (/** @type {any} */ (global).__cldFetchLocked) throw new Error('CLD fetch locked by circuit breaker');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort('timeout'), opt.timeoutMs ?? 10000);
    const tried = [];
    const base = typeof location === 'object' && location ? location.origin : 'http://localhost';
    const fetcher = opt.fetchFn || fetch;
    try {
      const uniq = [...new Set(candidates)].filter(Boolean);
      const attempts = opt.maxAttempts ?? 1;
      for (const p of uniq) {
        const url = new URL(p, base).toString();
        for (let i = 0; i < attempts; i++) {
          tried.push(url);
          try {
            const res = await fetcher(url, { cache: 'no-store', signal: ctrl.signal });
            if (!res.ok) { console.warn('[CLD boot] fetch not ok', res.status, url); break; }
            const json = await res.json();
            return { json, url };
          } catch (e) {
            console.warn('[CLD boot] fetch error', String(e), url);
            if (circuitOpen()) throw new Error('CLD circuit open: too many fetch errors');
          }
        }
      }
      throw new Error('all candidates failed: ' + tried.join(' | '));
    } finally {
      clearTimeout(t);
    }
  }
  /** @type {any} */ (global).fetchFirstJSON = fetchFirstJSON;
})(typeof window !== 'undefined' ? window : globalThis);
