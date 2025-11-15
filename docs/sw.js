// Service Worker برای WESH360 - Amaayesh Map Caching
// Version 2.0.0 - Phase 3 Optimizations

const CACHE_NAME = 'wesh360-amaayesh-v2';
const DATA_CACHE = 'wesh360-data-v2';

// فایل‌های critical که باید cache شوند
const CRITICAL_ASSETS = [
  '/amaayesh/',
  '/assets/vendor/leaflet/leaflet.js',
  '/assets/vendor/leaflet/leaflet.css',
  '/assets/js/amaayesh-map.min.js',
  '/assets/css/map-inline.css',
  '/assets/css-bundles-dist/core.bundle.css',
  '/assets/css-bundles-dist/layout.bundle.css',
];

// GeoJSON files - cache با استراتژی متفاوت
const GEOJSON_FILES = [
  '/data/amaayesh/wind_sites.geojson',
  '/data/amaayesh/solar_sites.geojson',
  '/data/amaayesh/dams.geojson',
  '/data/amaayesh/khorasan_razavi_combined.geojson', // ✅ Optimized: 769KB (was 4.1MB)
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: استراتژی‌های مختلف برای انواع فایل‌ها
self.addEventListener('fetch', (event) => {
  const {request} = event;
  const url = new URL(request.url);

  // فقط same-origin requests را cache کنیم
  if (url.origin !== location.origin) {
    // برای OpenStreetMap tiles: Network first
    if (url.hostname.includes('tile.openstreetmap.org')) {
      event.respondWith(networkFirst(request, DATA_CACHE));
    }
    return;
  }

  // استراتژی برای GeoJSON files: Cache first (با revalidation)
  if (url.pathname.includes('.geojson')) {
    event.respondWith(cacheFirstWithRevalidation(request, DATA_CACHE));
    return;
  }

  // استراتژی برای static assets: Cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/) ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // استراتژی برای HTML pages: Network first
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // بقیه: network first
  event.respondWith(fetch(request));
});

// استراتژی Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);

  // Cache successful responses
  if (response && response.status === 200) {
    cache.put(request, response.clone());
  }

  return response;
}

// استراتژی Network First
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

// استراتژی Cache First with Background Revalidation
async function cacheFirstWithRevalidation(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // همزمان fetch کن در background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // اگر cached داریم، فوراً برگردان
  if (cached) {
    console.log('[SW] Cache hit (revalidating):', request.url);
    return cached;
  }

  // اگر نداریم، منتظر fetch بمان
  console.log('[SW] Cache miss, fetching:', request.url);
  return fetchPromise;
}

// Message handler: برای manual cache clear
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
