// @ts-check
// Resolve JSON from the first reachable candidate URL.
(function(global){
  /**
   * @param {string[]} candidates
   * @param {{timeoutMs?: number}} [opt]
   * @returns {Promise<{json:any,url:string}>}
   */
  async function fetchFirstJSON(candidates, opt){
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort('timeout'), opt?.timeoutMs ?? 8000);
    const tried = [];
    try {
      for (const p of candidates){
        const url = new URL(p, location.origin).toString();
        tried.push(url);
        try {
          const res = await fetch(url, { cache:'no-store', signal: ctrl.signal });
          if (!res.ok){ console.warn('[CLD boot] fetch not ok', res.status, url); continue; }
          const json = await res.json();
          return { json, url };
        } catch(e){
          console.warn('[CLD boot] fetch error', String(e), url);
        }
      }
      throw new Error('all candidates failed: ' + tried.join(' | '));
    } finally {
      clearTimeout(t);
    }
  }
  global.fetchFirstJSON = fetchFirstJSON;
})(typeof window !== 'undefined' ? window : globalThis);
