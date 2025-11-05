# راهنمای بهبودهای بصری WESH360

این سند راهنمای کامل استفاده از سیستم‌های جدید طراحی شده برای WESH360 است.

## 📦 فایل‌های اضافه شده

### CSS Files
- `/assets/css/icons.css` - سیستم آیکون‌های SVG
- `/assets/css/data-cards.css` - کامپوننت‌های Data Cards حرفه‌ای
- `/assets/css/micro-interactions.css` - انیمیشن‌ها و Micro-interactions

### JavaScript Files
- `/assets/js/icons.js` - کتابخانه آیکون‌های SVG
- `/assets/js/micro-interactions.js` - سیستم انیمیشن‌های تعاملی

## 🎨 1. سیستم آیکون SVG

### آیکون‌های موجود

```javascript
// آیکون‌های اصلی
WESH360Icons.water        // آیکون آب (قطره)
WESH360Icons.electricity  // آیکون برق (رعد و برق)
WESH360Icons.gas          // آیکون گاز (شعله)
WESH360Icons.environment  // آیکون محیط زیست (برگ)

// آیکون‌های وضعیت
WESH360Icons.arrowUp      // فلش بالا (افزایش)
WESH360Icons.arrowDown    // فلش پایین (کاهش)
WESH360Icons.check        // تیک (موفقیت)
WESH360Icons.alert        // هشدار
WESH360Icons.x            // خطا/بستن
WESH360Icons.info         // اطلاعات

// آیکون‌های دیگر
WESH360Icons.chart        // نمودار
WESH360Icons.calendar     // تقویم
WESH360Icons.users        // کاربران
WESH360Icons.settings     // تنظیمات
WESH360Icons.sun          // خورشید (انرژی تجدیدپذیر)
WESH360Icons.badge        // نشان (امنیت)
```

### نحوه استفاده

#### استفاده مستقیم در HTML

```html
<!-- آیکون آب -->
<svg class="icon icon-water icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
</svg>

<!-- آیکون برق -->
<svg class="icon icon-electricity icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
</svg>
```

#### استفاده در JavaScript

```javascript
// ایجاد آیکون از نام
const waterIcon = createIcon('water', 'icon-bounce');

// اضافه کردن به DOM
document.getElementById('my-container').innerHTML = waterIcon;
```

### کلاس‌های اندازه

```css
.icon-sm   /* 1rem × 1rem */
.icon-md   /* 1.5rem × 1.5rem */
.icon-lg   /* 2rem × 2rem */
.icon-xl   /* 3rem × 3rem */
.icon-2xl  /* 4rem × 4rem */
```

### انیمیشن‌های آیکون

```html
<!-- آیکون با پالس -->
<svg class="icon icon-animated">...</svg>

<!-- آیکون با bounce روی hover -->
<svg class="icon icon-bounce">...</svg>

<!-- آیکون با چرخش -->
<svg class="icon icon-rotate">...</svg>
```

## 🎴 2. Data Cards حرفه‌ای

### ساختار پایه

```html
<a href="/path" class="data-card water">
  <!-- Header -->
  <div class="data-card-header">
    <div class="data-card-icon-wrapper water">
      <svg class="icon icon-water icon-xl">...</svg>
    </div>
    <span class="data-card-badge badge-public">فعال</span>
  </div>

  <!-- Body -->
  <div class="data-card-body">
    <h3 class="data-card-title">آب</h3>
    <p class="data-card-description">داشبورد مدیریت و پایش منابع آب</p>
  </div>
</a>
```

### Card با مقدار و روند

```html
<div class="data-card electricity">
  <div class="data-card-header">
    <div class="data-card-icon-wrapper electricity">
      <svg class="icon icon-electricity icon-xl">...</svg>
    </div>
    <span class="data-card-badge badge-public">Public</span>
  </div>

  <div class="data-card-body">
    <h3 class="data-card-title">مصرف برق</h3>

    <!-- Value -->
    <div class="data-card-value">
      <span class="value">12.5</span>
      <span class="unit">MW</span>
    </div>

    <!-- Trend -->
    <div class="data-card-trend trend-up">
      <svg class="icon icon-sm">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
      <span>3.2% نسبت به دیروز</span>
    </div>
  </div>

  <!-- Footer با Sparkline -->
  <div class="data-card-footer">
    <div class="data-card-sparkline">
      <canvas id="sparkline-chart"></canvas>
    </div>
  </div>
</div>
```

### Badge Types

```html
<span class="data-card-badge badge-public">فعال</span>
<span class="data-card-badge badge-internal">داخلی</span>
<span class="data-card-badge badge-soon">به‌زودی</span>
```

### Utility Classes

```css
.data-card.water        /* کارت آب */
.data-card.electricity  /* کارت برق */
.data-card.gas         /* کارت گاز */
.data-card.environment /* کارت محیط زیست */
```

### Card با Stats

```html
<div class="data-card-footer">
  <div class="data-card-stats">
    <div class="data-card-stat">
      <div class="data-card-stat-label">میانگین</div>
      <div class="data-card-stat-value">45.2</div>
    </div>
    <div class="data-card-stat">
      <div class="data-card-stat-label">پیک</div>
      <div class="data-card-stat-value">67.8</div>
    </div>
  </div>
</div>
```

## ✨ 3. Micro-interactions

### Hover Effects

تمام Card ها و Button ها به صورت خودکار hover effect دارند:

```html
<!-- به صورت خودکار hover effect دارد -->
<div class="data-card">...</div>
<button class="btn">کلیک کنید</button>
```

### Fade-in Animations

```html
<!-- Fade in on scroll -->
<div class="card fade-in">محتوا</div>

<!-- Fade in با تاخیر -->
<div class="card fade-in-delay-1">محتوا 1</div>
<div class="card fade-in-delay-2">محتوا 2</div>
<div class="card fade-in-delay-3">محتوا 3</div>
```

### Loading States

```html
<!-- Skeleton Loading -->
<div class="skeleton" style="width: 200px; height: 20px;"></div>

<!-- Spinner -->
<div class="spinner"></div>

<!-- Pulse Loading -->
<div class="loading">در حال بارگذاری...</div>
```

### Slide Animations

```html
<div class="slide-in-right">از راست می‌آید</div>
<div class="slide-in-left">از چپ می‌آید</div>
```

### Progress Bar

```html
<div class="progress-bar">
  <div class="progress-bar-fill animated" data-progress="75" style="width: 0%"></div>
</div>

<!-- به صورت خودکار تا 75% پر می‌شود -->
```

### Counter Animation

```html
<span class="counter" data-target="1234" data-duration="1000">0</span>

<!-- به صورت خودکار از 0 تا 1234 شمارش می‌کند -->
```

### Tooltip

```html
<button data-tooltip="این یک راهنما است">
  نگه دارید
</button>
```

### Ripple Effect

```html
<button class="btn ripple">کلیک کنید</button>
```

### Shake Effect (برای خطاها)

```javascript
// در JavaScript
const element = document.querySelector('.form-field');
WESH360Animations.shakeElement(element);
```

## 🎨 4. رنگ‌های تخصصی انرژی

### CSS Variables جدید

```css
/* آب */
--energy-water-primary: #0077BE
--energy-water-light: #4A9FD8
--energy-water-dark: #005A8F
--energy-water-bg: rgba(0, 119, 190, 0.1)

/* برق */
--energy-electricity-primary: #FDB913
--energy-electricity-light: #FFCE56
--energy-electricity-dark: #D49A0A
--energy-electricity-bg: rgba(253, 185, 19, 0.1)

/* گاز */
--energy-gas-primary: #FF6B35
--energy-gas-light: #FF8C64
--energy-gas-dark: #E64F1F
--energy-gas-bg: rgba(255, 107, 53, 0.1)

/* انرژی تجدیدپذیر */
--energy-renewable-primary: #00A86B
--energy-renewable-light: #2DC992
--energy-renewable-dark: #008556
--energy-renewable-bg: rgba(0, 168, 107, 0.1)
```

### نحوه استفاده

```css
.my-water-element {
  background: var(--energy-water-bg);
  color: var(--energy-water-primary);
  border: 2px solid var(--energy-water-light);
}

.my-electricity-button:hover {
  background: var(--energy-electricity-primary);
  color: white;
}
```

## 📱 Responsive Design

همه کامپوننت‌ها به صورت خودکار Responsive هستند:

- **Desktop**: همه ویژگی‌ها فعال
- **Tablet**: اندازه‌های کمی کوچکتر
- **Mobile**: Layout عمودی، آیکون‌ها کوچکتر

## ♿ Accessibility

### دسترسی‌پذیری خودکار:
- ✅ Support برای `prefers-reduced-motion`
- ✅ Focus indicators واضح
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ High contrast mode support

### غیرفعال کردن انیمیشن‌ها:

```css
/* به صورت خودکار برای کاربرانی که reduced motion می‌خواهند */
@media (prefers-reduced-motion: reduce) {
  /* همه انیمیشن‌ها غیرفعال می‌شوند */
}
```

## 🚀 JavaScript API

### Functions موجود

```javascript
// انیمیشن شمارنده
WESH360Animations.animateCounter(element, target, duration);

// Shake کردن المان
WESH360Animations.shakeElement(element);

// نمایش Skeleton
WESH360Animations.showSkeleton(container);
```

### مثال کامل

```javascript
// انیمیشن شمارنده
const counter = document.querySelector('.my-counter');
WESH360Animations.animateCounter(counter, 1234, 2000);

// Shake برای خطا
const errorField = document.querySelector('.error-field');
WESH360Animations.shakeElement(errorField);

// نمایش Skeleton در حین بارگذاری
const container = document.querySelector('.data-container');
const skeleton = WESH360Animations.showSkeleton(container);

// بعد از بارگذاری، skeleton را حذف کنید
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    skeleton.remove();
    container.innerHTML = renderData(data);
  });
```

## 🎯 Best Practices

1. **همیشه از CSS Variables استفاده کنید** برای یکپارچگی رنگ‌ها
2. **آیکون‌های SVG را ترجیح دهید** به جای ایموجی
3. **از Data Cards استفاده کنید** برای نمایش داده‌های مهم
4. **Accessibility را فراموش نکنید** - همیشه ARIA attributes اضافه کنید
5. **Loading states را نشان دهید** - همیشه از skeleton یا spinner استفاده کنید

## 📝 نمونه‌های کامل

### نمونه 1: Card با Counter

```html
<div class="data-card water">
  <div class="data-card-header">
    <div class="data-card-icon-wrapper water">
      <svg class="icon icon-water icon-xl" viewBox="0 0 24 24">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    </div>
    <span class="data-card-badge badge-public">فعال</span>
  </div>

  <div class="data-card-body">
    <h3 class="data-card-title">مصرف آب امروز</h3>
    <div class="data-card-value">
      <span class="value counter" data-target="12500" data-duration="2000">0</span>
      <span class="unit">لیتر</span>
    </div>

    <div class="data-card-trend trend-down">
      <svg class="icon icon-sm" viewBox="0 0 24 24">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
      <span>5% کمتر از دیروز</span>
    </div>
  </div>

  <div class="data-card-footer">
    <div class="progress-bar">
      <div class="progress-bar-fill" data-progress="65"></div>
    </div>
  </div>
</div>
```

### نمونه 2: Grid of Cards با Stagger Animation

```html
<section class="cards-section">
  <div class="data-card water stagger-item fade-in">
    <!-- محتوای card -->
  </div>
  <div class="data-card electricity stagger-item fade-in">
    <!-- محتوای card -->
  </div>
  <div class="data-card gas stagger-item fade-in">
    <!-- محتوای card -->
  </div>
</section>
```

## 🐛 رفع مشکلات رایج

### مشکل 1: آیکون‌ها نمایش داده نمی‌شوند
**راه حل**: اطمینان حاصل کنید که `/assets/js/icons.js` لود شده است.

### مشکل 2: انیمیشن‌ها کار نمی‌کنند
**راه حل**: بررسی کنید که `/assets/js/micro-interactions.js` لود شده و console خطایی ندارد.

### مشکل 3: Cards به درستی نمایش داده نمی‌شوند
**راه حل**: مطمئن شوید `/assets/css/data-cards.css` لود شده است.

## 📞 پشتیبانی

برای سوالات یا گزارش باگ:
- مراجعه به Issues در GitHub
- بررسی Console برای خطاها
- تست در مرورگرهای مختلف

---

**نسخه**: 1.0.0
**تاریخ**: 2025
**نویسنده**: WESH360 Development Team
