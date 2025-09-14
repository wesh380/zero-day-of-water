(function(){
  if (window.__WATER_KERNEL__) return; window.__WATER_KERNEL__ = true;
  'use strict';

  // ---- tiny emitter (no deps)
  function E(){ this._=Object.create(null); }
  E.prototype.on=function(k,fn){ (this._[k]||(this._[k]=[])).push(fn); return fn; };
  E.prototype.off=function(k,fn){ var a=this._[k]; if(!a) return; var i=a.indexOf(fn); if(i>-1) a.splice(i,1); };
  E.prototype.emit=function(k,p){ var a=this._[k]||[]; for(var i=0;i<a.length;i++){ try{ a[i](p); }catch(_){ } } };

  // ---- phases & states
  // BOOT → VENDORS_READY → CY_READY → MODEL_LOADED → GRAPH_READY
  var PH = ['BOOT','VENDORS_READY','CY_READY','MODEL_LOADED','GRAPH_READY'];
  var IDX = {}; PH.forEach(function(s,i){ IDX[s]=i; });
  var MAP = { vendors:'VENDORS_READY', cy:'CY_READY', model:'MODEL_LOADED', graph:'GRAPH_READY' };

  var ev  = new E();
  var st  = 'BOOT';
  var q   = { vendors:[], cy:[], model:[], graph:[] }; // deferred actions per phase
  var once = Object.create(null);
  var debugOn = false;

  function log(){ if(debugOn && console && console.log) try{ console.log.apply(console, arguments); }catch(_){ } }
  function state(){ return st; }
  function canAdvance(to){ return IDX[to] > IDX[st]; }
  function reached(phase){ return IDX[MAP[phase]||phase] <= IDX[st]; }

  function _drain(phase){
    var arr = q[phase]||[];
    if (!arr.length) return;
    var copy = arr.splice(0, arr.length);
    for (var i=0;i<copy.length;i++){
      try{ copy[i](); }catch(_){ }
    }
  }

  function emit(next, payload){
    if (!MAP[next] && !IDX[next]) return; // ignore unknown
    var target = MAP[next] || next;
    if (!canAdvance(target)) { // allow duplicate emits silently
      ev.emit(target, payload);
      return;
    }
    st = target;
    log('[kernel] →', st, payload||'');
    ev.emit(st, payload);
    // auto drain queues for all phases <= current state
    if (st==='VENDORS_READY'){ _drain('vendors'); }
    if (IDX[st] >= IDX['CY_READY'])     { _drain('cy'); }
    if (IDX[st] >= IDX['MODEL_LOADED']) { _drain('model'); }
    if (IDX[st] >= IDX['GRAPH_READY'])  { _drain('graph'); }
  }

  function onReady(phase, fn){
    var stName = MAP[phase]||phase;
    if (reached(phase)) { try{ fn(); }catch(_){ } return fn; }
    return ev.on(stName, fn);
  }
  function onceReady(phase, fn){
    var key = phase + '::' + (fn && fn.name || Math.random());
    if (once[key]) return once[key];
    var off = onReady(phase, function(){
      try{ fn(); }finally{ ev.off(MAP[phase]||phase, off); }
    });
    once[key] = off;
    return off;
  }
  function queue(phase, fn){
    (q[phase]||(q[phase]=[])).push(fn);
  }
  function debug(v){ debugOn = !!v; return api; }

  // ---- bootstrap wiring
  function onDomReady(){
    emit('VENDORS_READY');
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onDomReady, { once:true });
  } else { onDomReady(); }

  // bridge existing cy:ready
  document.addEventListener('cy:ready', function(e){
    emit('CY_READY', e && e.detail && e.detail.cy);
  });

  // public api
  var api = {
    state: state,
    emit: emit,            // used by adapters only
    onReady: onReady,
    onceReady: onceReady,
    queue: queue,
    debug: debug
  };
  window.waterKernel = window.waterKernel || api;
})();
