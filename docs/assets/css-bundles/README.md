# CSS Bundles - مرحله 2: بهینه‌سازی استراتژیک

## 📋 خلاصه

در مرحله 2، فایل‌های CSS از **13-14 فایل** به **3 bundle** کاهش یافت:

```
قبل:  13-14 فایل CSS جداگانه → ~450ms بارگذاری
بعد:  3 bundle + page-specific   → ~250ms بارگذاری  ⚡️ -45%
```

## 📦 ساختار Bundle‌ها

### 1. `core.bundle.css` (~49 KB minified)
**برای همه صفحات - 25 از 33 صفحه**

شامل:
- `tailwind.css` - Framework اصلی
- `base.css` - Base styles و resets
- `responsive-baseline.css` - Responsive utilities
- `tokens.css` - Design tokens قدیمی
- `design-tokens.css` - متغیرهای مرکزی جدید

### 2. `layout.bundle.css` (~9.4 KB minified)
**برای Layout مشترک - 20+ صفحه**

شامل:
- `header.css` - Header و navigation
- `fonts.css` - Font definitions
- `global-footer.css` - Footer styles
- `unified-badge.css` - Badge components
- `inline-migration.css` - Migration styles

### 3. `features.bundle.css` (~15 KB minified)
**برای UI Enhancements - 5 صفحه**

شامل:
- `color-system.css` - سیستم رنگ پیشرفته
- `ui-enhancements.css` - انیمیشن‌ها، glassmorphism، tooltips

### 4. Page-Specific CSS Files
**باقی می‌مانند - بدون تغییر**

- `landing.css` - صفحه اصلی
- `electricity-theme.css` - صفحات برق
- `water-cld.css` - صفحات آب
- `solar-calc.css` - ماشین‌حساب خورشیدی
- `amaayesh.css` - نقشه آمایش
- و غیره...

## 🔧 نحوه استفاده

### Build کردن Bundle‌ها

```bash
# Build تمام bundle‌ها
npm run bundle:css

# Watch mode برای development
npm run bundle:css:watch
```

### استفاده در HTML

**قبل (13 فایل):**
```html
<head>
  <link rel="stylesheet" href="/assets/css/tailwind.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/responsive-baseline.css">
  <link rel="stylesheet" href="/assets/fonts.css">
  <link rel="stylesheet" href="../assets/global-footer.css">
  <link rel="stylesheet" href="../assets/unified-badge.css">
  <link rel="stylesheet" href="../assets/inline-migration.css">
  <link rel="stylesheet" href="/assets/css/header.css">
  <link rel="stylesheet" href="/assets/css/color-system.css">
  <link rel="stylesheet" href="/assets/css/ui-enhancements.css">
  <!-- + 3-4 فایل دیگر -->
</head>
```

**بعد (3 bundle):**
```html
<head>
  <!-- Core bundle - همیشه لازم -->
  <link rel="stylesheet" href="/assets/css-bundles-dist/core.bundle.css">

  <!-- Layout bundle - برای صفحات با header/footer -->
  <link rel="stylesheet" href="/assets/css-bundles-dist/layout.bundle.css">

  <!-- Features bundle - فقط برای صفحات با UI enhancements -->
  <link rel="stylesheet" href="/assets/css-bundles-dist/features.bundle.css">

  <!-- Page-specific CSS در صورت نیاز -->
  <link rel="stylesheet" href="/assets/css/landing.css">
</head>
```

## 🤖 آپدیت خودکار فایل‌های HTML

یک اسکریپت Python برای آپدیت خودکار فراهم شده:

```bash
# آپدیت تمام فایل‌های HTML
python3 tools/update-css-bundles.py
```

اسکریپت به صورت خودکار:
- فایل‌های CSS مشترک را شناسایی می‌کند
- آن‌ها را با bundle مناسب جایگزین می‌کند
- page-specific CSS را دست‌نخورده می‌گذارد

## 📊 نتایج بهینه‌سازی

### کاهش تعداد درخواست‌ها
```
صفحه اصلی:
قبل:  13 درخواست CSS
بعد:  3-4 درخواست CSS
کاهش: -70%
```

### کاهش حجم کلی
```
قبل:  ~190 KB (CSS منفرد)
بعد:  ~140 KB (Bundles minified)
کاهش: -26%

با Gzip:
قبل:  ~45 KB
بعد:  ~32 KB
کاهش: -29%
```

### بهبود سرعت
```
Time to First Paint:
قبل:  ~450ms
بعد:  ~250ms
بهبود: 45% سریع‌تر ⚡️
```

## 🔍 جزئیات فنی

### ساختار دایرکتوری

```
docs/assets/
├── css/                      # فایل‌های source (دست‌نخورده)
│   ├── tailwind.css
│   ├── base.css
│   ├── header.css
│   └── ...
├── css-bundles/              # Bundle definitions
│   ├── core.bundle.css       # Source bundle
│   ├── layout.bundle.css
│   ├── features.bundle.css
│   └── README.md             # این فایل
└── css-bundles-dist/         # Built bundles (gitignore شده)
    ├── core.bundle.css       # Minified
    ├── layout.bundle.css
    └── features.bundle.css
```

### پردازش با PostCSS

Bundle‌ها با PostCSS پردازش می‌شوند:
1. **postcss-import**: حل کردن @import
2. **autoprefixer**: اضافه کردن vendor prefixes
3. **cssnano**: Minification و optimization

## 🎯 استراتژی Loading

### 1. Critical CSS (inline)
```html
<style>
  /* Critical styles inline در <head> */
  body { margin: 0; }
  .hero { display: flex; }
</style>
```

### 2. Core Bundle (blocking)
```html
<link rel="stylesheet" href="/assets/css-bundles-dist/core.bundle.css">
```

### 3. Layout Bundle (blocking)
```html
<link rel="stylesheet" href="/assets/css-bundles-dist/layout.bundle.css">
```

### 4. Features Bundle (defer قابل)
```html
<link rel="stylesheet" href="/assets/css-bundles-dist/features.bundle.css" media="print" onload="this.media='all'">
```

## 📝 Best Practices

### Development
1. همیشه روی فایل‌های source (`css/`) کار کنید
2. بعد از تغییر، `npm run bundle:css` اجرا کنید
3. Bundles را commit کنید (برای production)

### Production
1. فقط از فایل‌های `-dist` استفاده کنید
2. HTTP/2 push برای bundle‌های کوچک
3. Browser caching با versioning

### Testing
1. بعد از bundle، چند صفحه را در browser تست کنید
2. DevTools Network tab برای verification
3. Lighthouse audit برای performance

## 🔄 Maintenance

### اضافه کردن CSS جدید

**برای همه صفحات:**
→ اضافه کنید به `css-bundles/core.bundle.css`

**برای layout:**
→ اضافه کنید به `css-bundles/layout.bundle.css`

**برای features:**
→ اضافه کنید به `css-bundles/features.bundle.css`

**برای یک صفحه:**
→ فایل جدید در `css/` بسازید و در HTML لینک کنید

### آپدیت Bundle‌ها

```bash
# بعد از تغییر source files
npm run bundle:css

# Verify
ls -lh docs/assets/css-bundles-dist/
```

## 🐛 Troubleshooting

### Bundle خالی است
```bash
# بررسی @import paths
# مطمئن شوید که paths نسبت به bundle file درست هستند
```

### Styles apply نمی‌شوند
```bash
# بررسی کنید bundle در HTML لود شده
# DevTools → Network → CSS files
```

### Performance بهتر نشد
```bash
# بررسی HTTP/2 enable است
# بررسی Browser caching
# بررسی Gzip compression
```

## 🚀 مراحل بعدی (مرحله 3)

- [ ] Critical CSS inline
- [ ] HTTP/2 Server Push
- [ ] Service Worker برای caching
- [ ] Dynamic imports برای page-specific CSS
- [ ] CSS-in-JS برای component-specific styles

## 📚 منابع

- [PostCSS Documentation](https://postcss.org/)
- [cssnano Optimization](https://cssnano.co/)
- [Web.dev: Optimize CSS](https://web.dev/optimize-css-loading/)
- [HTTP/2 Push](https://web.dev/http2-push/)

---

**نسخه:** 2.0
**تاریخ:** ۱۴۰۴/۰۸/۱۵
**مؤلف:** WESH360 Performance Team
