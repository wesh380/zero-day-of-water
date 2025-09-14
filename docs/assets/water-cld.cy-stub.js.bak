(typeof window !== 'undefined' && !getCy()) && (function(){
  if (window.__CY_STUB__) return; window.__CY_STUB__ = true;
  'use strict';

  // ---- utils ----
  var noop  = function(){};
  var toArr = function(a){ return Array.prototype.slice.call(a || []); };

  // صف عملیات قبل از آماده‌شدن cy واقعی
  var queue = [];
  function enqueue(kind, method, args, selectorRef){
    queue.push({ kind: kind, method: method, args: toArr(args), selectorRef: selectorRef || null });
  }

  // ساخت reference انتخاب با نگه‌داری زنجیرهٔ فیلترها
  function makeSelectorRef(base){
    // base: { type:'elements'|'id'|'query', value:any }
    var val = base.value;
    if (base.type === 'id'){
      val = val != null ? String(val) : undefined;
    } else if (base.type === 'elements' || base.type === 'query'){
      val = (typeof val === 'string') ? val : undefined;
    }
    return { type: base.type, value: val, ops: [] }; // ops: [{method:'filter', args:[...]}]
  }

  function resolveBase(real, ref){
    if (!ref) return real.elements();
    if (ref.type === 'id')    return real.getElementById(ref.value);
    if (ref.type === 'query') return real.$(ref.value);
    return real.elements(ref.value);
  }

  function applyOps(coll, ops){
    var cur = coll;
    for (var i=0; i<(ops||[]).length; i++){
      var op = ops[i];
      if (cur && typeof cur[op.method] === 'function'){
        cur = cur[op.method].apply(cur, toArr(op.args));
      }
    }
    return cur;
  }

  function flush(real){
    if (!real || !queue.length) return;
    try{
      for (var i=0; i<queue.length; i++){
        var op = queue[i];
        if (op.kind === 'cy'){
          var fnCy = real[op.method];
          if (typeof fnCy === 'function') fnCy.apply(real, op.args);
        } else if (op.kind === 'collection'){
          var base = resolveBase(real, op.selectorRef);
          var coll = applyOps(base, (op.selectorRef && op.selectorRef.ops) || []);
          var fnCo = coll && coll[op.method];
          if (typeof fnCo === 'function') fnCo.apply(coll, op.args);
        }
      }
    }catch(_){}
    queue.length = 0;
  }

  // ---- کالکشن پروکسی: متدهای زنجیره‌ای و عملیاتی ----
  function makeCollectionProxy(selectorRef){
    var api = {};

    // متدهای زنجیره‌ای که مجموعه را تغییر می‌دهند و باید در ops ذخیره شوند
    var chainOps = ['filter']; // در صورت نیاز union/difference/merge هم قابل افزودن است
    for (var i=0; i<chainOps.length; i++){
      (function(m){
        api[m] = function(){
          var sel = (typeof arguments[0] === 'string') ? arguments[0] : undefined;
          selectorRef.ops.push({ method: m, args: [sel] });
          return api;
        };
      })(chainOps[i]);
    }

    // متدهای عملیاتی که باید در صف اعمال روی کالکشن ثبت شوند
    var actionOps = [
      'add','remove',
      'addClass','removeClass','toggleClass',
      'style','data','animate','layout','move'
    ];
    for (var j=0; j<actionOps.length; j++){
      (function(m){
        api[m] = function(){ enqueue('collection', m, arguments, selectorRef); return api; };
      })(actionOps[j]);
    }

    // کمکی‌های فقط‌خواندنی
    api.forEach = noop;
    api.map     = function(){ return []; };

    // ایمن‌سازی دسترسی عددی مثل [0]
    try{
      Object.defineProperty(api, 'length', { get: function(){ return 0; } });
    }catch(_){ api.length = 0; }
    api[0] = api;
    try{
      Object.defineProperty(api, 1, { get: function(){ return api; } });
      Object.defineProperty(api, 2, { get: function(){ return api; } });
    }catch(_){}

    return api;
  }

  // ---- شیء استاب cy ----
  var realCy = null;
  var cyStub = {
    // selectors
    elements: function(sel){ return makeCollectionProxy(makeSelectorRef({ type:'elements', value: sel })); },
    nodes:    function(sel){ return makeCollectionProxy(makeSelectorRef({ type:'elements', value: sel })); },
    edges:    function(sel){ return makeCollectionProxy(makeSelectorRef({ type:'elements', value: sel })); },
    getElementById: function(id){ return makeCollectionProxy(makeSelectorRef({ type:'id', value: id })); },
    $: function(query){ return makeCollectionProxy(makeSelectorRef({ type:'query', value: query })); },

    // events & batching
    on: noop, off: noop,
    startBatch: noop, endBatch: noop,
    batch: function(fn){ try{ if (typeof fn === 'function') fn.call(this); } catch(_){ } },

    // cy-level ops (queued)
    fit:    function(){ enqueue('cy','fit',    arguments); },
    add:    function(){ enqueue('cy','add',    arguments); },
    remove: function(){ enqueue('cy','remove', arguments); },
    addClass:    function(){ enqueue('cy','addClass',    arguments); },
    removeClass: function(){ enqueue('cy','removeClass', arguments); },
    style:       function(){ enqueue('cy','style',       arguments); },
    reset:       function(){ enqueue('cy','reset',       arguments); },
    layout:      function(){ enqueue('cy','layout',      arguments); }
  };
  cyStub.graph = { meta: { synonymToId: new Map(), nodes: new Map(), edges: new Map() } };

  // expose stub via safe namespace
  window.CLD_SAFE = window.CLD_SAFE || {};
  if (!window.CLD_SAFE.cy) window.CLD_SAFE.cy = cyStub;

  function setReal(v){
    realCy = v;
    window.CLD_SAFE.cy = v;
    flush(realCy);
  }

  // گرفتن instance از رویداد
  document.addEventListener('cy:ready', function(e){
    var inst = e && e.detail && e.detail.cy;
    if (inst){ try{ setReal(inst); }catch(_){ } }
  });
  document.addEventListener('cld:ready', function(e){
    var inst = e && e.detail && e.detail.cy;
    if (inst){ try{ setReal(inst); }catch(_){ } }
  });

  // Late flush fallback
  setTimeout(function(){
    try{ var c = getCy(); if (c && c !== cyStub) flush(c); }catch(_){}
  }, 200);
})();
