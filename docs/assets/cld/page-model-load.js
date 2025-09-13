import { loadModel as _loadModel } from './loader/model-fetch.js';

// Public API used by page init/defer scripts
export async function loadModel(candidate){
  return await _loadModel(candidate);
}

// Expose on window for non-module scripts (e.g., water-cld.init.js)
try { window.CLD_LOAD_MODEL = loadModel; } catch(_) { /* no window in SSR */ }
