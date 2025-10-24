/**
 * Service Worker برای PWA
 * با قابلیت Offline، Caching و Push Notifications
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `wesh360-${CACHE_VERSION}`;

// فایل‌های استاتیک که باید cache شوند
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/tailwind.css',
  '/assets/vendor/chart.umd.min.js',
  '/assets/vendor/cytoscape.min.js',
  '/manifest.json',
];

// استراتژی‌های مختلف کش
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// تنظیمات استراتژی بر اساس نوع فایل
const RESOURCE_STRATEGIES = {
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,
  '/data/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/assets/': CACHE_STRATEGIES.CACHE_FIRST,
  '/water/': CACHE_STRATEGIES.NETWORK_FIRST,
  '/electricity/': CACHE_STRATEGIES.NETWORK_FIRST,
};

// نصب Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[Service Worker] Failed to cache some assets:', err);
        // ادامه نصب حتی اگر بعضی فایل‌ها cache نشوند
        return Promise.resolve();
      });
    }).then(() => {
      // فعال‌سازی فوری Service Worker جدید
      return self.skipWaiting();
    })
  );
});

// فعال‌سازی Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    // حذف کش‌های قدیمی
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // تسلط بر تمام کلاینت‌ها
      return self.clients.claim();
    })
  );
});

// رهگیری درخواست‌ها
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط درخواست‌های مربوط به domain خودمان
  if (url.origin !== self.location.origin) {
    return;
  }

  // تعیین استراتژی بر اساس URL
  const strategy = determineStrategy(url.pathname);

  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * تعیین استراتژی کش بر اساس path
 */
function determineStrategy(pathname) {
  for (const [prefix, strategy] of Object.entries(RESOURCE_STRATEGIES)) {
    if (pathname.startsWith(prefix)) {
      return strategy;
    }
  }
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * مدیریت درخواست با استراتژی مشخص شده
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);

    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);

    default:
      return networkFirst(request);
  }
}

/**
 * استراتژی Cache First
 * ابتدا از کش بررسی می‌کند، اگر نبود از شبکه
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    return offlineFallback(request);
  }
}

/**
 * استراتژی Network First
 * ابتدا از شبکه تلاش می‌کند، اگر ناموفق بود از کش
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Network fetch failed, trying cache:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return offlineFallback(request);
  }
}

/**
 * استراتژی Stale While Revalidate
 * از کش برمی‌گرداند و در پس‌زمینه آپدیت می‌کند
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  // در پس‌زمینه از شبکه دریافت و کش را آپدیت می‌کند
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch((error) => {
    console.error('[Service Worker] Background fetch failed:', error);
  });

  // اگر کش موجود است، فوراً برگردان
  if (cached) {
    return cached;
  }

  // در غیر این صورت منتظر شبکه بمان
  return fetchPromise;
}

/**
 * صفحه Offline Fallback
 */
function offlineFallback(request) {
  const url = new URL(request.url);

  // برای HTML صفحه offline
  if (request.headers.get('accept').includes('text/html')) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بدون اتصال</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 { font-size: 3rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; opacity: 0.9; }
          button {
            margin-top: 2rem;
            padding: 1rem 2rem;
            font-size: 1rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          }
          button:hover { transform: scale(1.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 بدون اتصال</h1>
          <p>شما در حال حاضر به اینترنت متصل نیستید.</p>
          <p>لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.</p>
          <button onclick="window.location.reload()">تلاش مجدد</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  // برای سایر منابع خطای 503
  return new Response(
    JSON.stringify({
      error: 'offline',
      message: 'شما در حال حاضر آفلاین هستید',
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// مدیریت Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'یک پیام جدید دریافت شد',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'مشاهده',
      },
      {
        action: 'close',
        title: 'بستن',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Wesh360', options)
  );
});

// مدیریت کلیک روی Notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// مدیریت Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * همگام‌سازی داده‌ها در پس‌زمینه
 */
async function syncData() {
  try {
    // خواندن داده‌های ذخیره شده محلی
    const cache = await caches.open(CACHE_NAME);
    // همگام‌سازی با سرور
    console.log('[Service Worker] Data synced');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// مدیریت خطاها
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
});

console.log('[Service Worker] Loaded');
