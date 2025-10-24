/**
 * PWA Manager
 * مدیریت Service Worker، Push Notifications و Install Prompt
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.registration = null;
    this.isSubscribed = false;
    this.publicVapidKey = null; // باید از سرور دریافت شود

    this.init();
  }

  /**
   * مقداردهی اولیه
   */
  async init() {
    // بررسی پشتیبانی Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    // بررسی نصب بودن PWA
    this.checkIfInstalled();

    // ثبت Service Worker
    await this.registerServiceWorker();

    // مدیریت Install Prompt
    this.setupInstallPrompt();

    // تنظیم Push Notifications
    this.setupPushNotifications();

    // مدیریت آپدیت‌ها
    this.setupUpdateHandler();

    // مدیریت Online/Offline
    this.setupOnlineOfflineHandlers();
  }

  /**
   * ثبت Service Worker
   */
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', this.registration.scope);

      // بررسی وضعیت
      if (this.registration.installing) {
        console.log('Service Worker installing...');
      } else if (this.registration.waiting) {
        console.log('Service Worker waiting...');
        this.showUpdateNotification();
      } else if (this.registration.active) {
        console.log('Service Worker active');
      }

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * بررسی نصب بودن PWA
   */
  checkIfInstalled() {
    // بررسی display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA is installed');
    }

    // بررسی iOS
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA is installed on iOS');
    }
  }

  /**
   * تنظیم Install Prompt
   */
  setupInstallPrompt() {
    // رویداد beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');

      // جلوگیری از نمایش خودکار
      e.preventDefault();

      // ذخیره رویداد برای استفاده بعدی
      this.deferredPrompt = e;

      // نمایش دکمه نصب
      this.showInstallButton();
    });

    // رویداد appinstalled
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallButton();

      // ارسال تحلیل
      this.trackInstall();
    });
  }

  /**
   * نمایش دکمه نصب
   */
  showInstallButton() {
    // ایجاد دکمه نصب
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-button';
    installBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>نصب اپلیکیشن</span>
    `;

    installBtn.onclick = () => this.promptInstall();

    // اضافه کردن به صفحه
    document.body.appendChild(installBtn);

    // استایل
    if (!document.getElementById('pwa-install-style')) {
      const style = document.createElement('style');
      style.id = 'pwa-install-style';
      style.textContent = `
        .pwa-install-button {
          position: fixed;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          z-index: 1000;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: slideIn 0.3s ease-out;
        }

        .pwa-install-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .pwa-install-button {
            bottom: 10px;
            left: 10px;
            font-size: 12px;
            padding: 10px 16px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * مخفی کردن دکمه نصب
   */
  hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => btn.remove(), 300);
    }
  }

  /**
   * نمایش prompt نصب
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    // نمایش prompt
    this.deferredPrompt.prompt();

    // انتظار برای انتخاب کاربر
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // پاک کردن prompt
    this.deferredPrompt = null;

    if (outcome === 'accepted') {
      this.hideInstallButton();
    }
  }

  /**
   * تنظیم Push Notifications
   */
  setupPushNotifications() {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    // بررسی وضعیت مجوز
    if (Notification.permission === 'granted') {
      this.isSubscribed = true;
      console.log('Push notifications already granted');
    } else if (Notification.permission !== 'denied') {
      console.log('Push notifications permission not determined');
    }
  }

  /**
   * درخواست مجوز Push Notifications
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      await this.subscribeToPush();
      return true;
    }

    console.log('Notification permission denied');
    return false;
  }

  /**
   * اشتراک در Push Notifications
   */
  async subscribeToPush() {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey),
      });

      console.log('Push subscription:', subscription);

      // ارسال subscription به سرور
      await this.sendSubscriptionToServer(subscription);

      this.isSubscribed = true;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  }

  /**
   * ارسال subscription به سرور
   */
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server');
    } catch (error) {
      console.error('Error sending subscription:', error);
    }
  }

  /**
   * نمایش نوتیفیکیشن تست
   */
  async showTestNotification() {
    if (Notification.permission !== 'granted') {
      await this.requestNotificationPermission();
    }

    if (this.registration) {
      await this.registration.showNotification('Wesh360', {
        body: 'اپلیکیشن شما آماده است!',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
          url: '/',
        },
      });
    }
  }

  /**
   * مدیریت آپدیت Service Worker
   */
  setupUpdateHandler() {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // آپدیت جدید در دسترس است
          this.showUpdateNotification();
        }
      });
    });
  }

  /**
   * نمایش پیام آپدیت
   */
  showUpdateNotification() {
    // ایجاد نوار اطلاع‌رسانی
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <span>نسخه جدیدی در دسترس است</span>
        <button id="pwa-update-btn">بروزرسانی</button>
        <button id="pwa-update-dismiss">بعداً</button>
      </div>
    `;

    document.body.appendChild(notification);

    // استایل
    if (!document.getElementById('pwa-update-style')) {
      const style = document.createElement('style');
      style.id = 'pwa-update-style';
      style.textContent = `
        .pwa-update-notification {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #667eea;
          color: white;
          padding: 16px;
          z-index: 1001;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          animation: slideDown 0.3s ease-out;
        }

        .pwa-update-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pwa-update-notification button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        #pwa-update-btn {
          background: white;
          color: #667eea;
        }

        #pwa-update-dismiss {
          background: transparent;
          color: white;
          border: 1px solid white;
        }

        .pwa-update-notification button:hover {
          opacity: 0.9;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // رویدادها
    document.getElementById('pwa-update-btn').onclick = () => {
      this.applyUpdate();
    };

    document.getElementById('pwa-update-dismiss').onclick = () => {
      notification.remove();
    };
  }

  /**
   * اعمال آپدیت
   */
  applyUpdate() {
    if (!this.registration || !this.registration.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  /**
   * مدیریت Online/Offline
   */
  setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      console.log('Back online');
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      this.showOfflineNotification();
    });
  }

  /**
   * نمایش پیام آنلاین
   */
  showOnlineNotification() {
    this.showToast('🌐 اتصال برقرار شد', 'success');
  }

  /**
   * نمایش پیام آفلاین
   */
  showOfflineNotification() {
    this.showToast('📡 اتصال قطع شد - حالت آفلاین', 'warning');
  }

  /**
   * نمایش Toast
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `pwa-toast pwa-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // استایل
    if (!document.getElementById('pwa-toast-style')) {
      const style = document.createElement('style');
      style.id = 'pwa-toast-style';
      style.textContent = `
        .pwa-toast {
          position: fixed;
          bottom: 80px;
          right: 20px;
          padding: 12px 20px;
          background: #333;
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1002;
          animation: slideInRight 0.3s ease-out;
        }

        .pwa-toast-success { background: #10b981; }
        .pwa-toast-warning { background: #f59e0b; }
        .pwa-toast-error { background: #ef4444; }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * تبدیل VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * ردیابی نصب
   */
  trackInstall() {
    // ارسال به سیستم تحلیل
    console.log('PWA install tracked');
  }
}

// ایجاد نمونه global
if (typeof window !== 'undefined') {
  window.pwaManager = new PWAManager();
}

// Export برای استفاده در ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAManager;
}
