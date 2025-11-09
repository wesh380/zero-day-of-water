# 🎨 WESH360 CSS Architecture - مستندات

## 📁 ساختار فایل‌ها

```
docs/assets/css/
├── design-tokens.css      # ⭐ متغیرهای مرکزی (جدید)
├── base.css              # استایل‌های پایه
├── color-system.css      # سیستم رنگ و تم
├── ui-enhancements.css   # کامپوننت‌های UI پیشرفته
├── header.css           # هدر سایت
├── landing.css          # صفحه اصلی
├── responsive-baseline.css  # Responsive utilities
└── ...

css-dist/                 # 📦 فایل‌های بهینه شده (auto-generated)
├── design-tokens.css    # Minified
├── ui-enhancements.css  # Minified + Autoprefixed
└── ...
```

## 🚀 تغییرات اخیر (Phase 1 Optimization)

### ✅ آنچه انجام شد:

1. **یکپارچه‌سازی Variables**
   - ایجاد `design-tokens.css` مرکزی
   - حذف 16 متغیر تکراری از `ui-enhancements.css`
   - کاهش 77 خط کد تکراری

2. **نصب ابزارهای بهینه‌سازی**
   - PostCSS + cssnano
   - Autoprefixer
   - postcss-import

3. **Minification**
   - کاهش ~26% حجم کل CSS
   - تخمین -29% با Gzip

4. **بهبود معماری**
   - @import های relative path
   - Build pipeline خودکار
   - Watch mode برای development

## 📖 نحوه استفاده

### برای توسعه‌دهندگان:

#### 1. ویرایش فایل‌های CSS:
```bash
# فایل‌های اصلی را در docs/assets/css/ ویرایش کنید
vim docs/assets/css/ui-enhancements.css
```

#### 2. بهینه‌سازی:
```bash
# یکباره
npm run optimize:css

# یا watch mode
npm run optimize:css:watch
```

#### 3. استفاده از متغیرها:
```css
/* ✅ درست - استفاده از design tokens */
.my-component {
  background: var(--color-bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

/* ❌ نادرست - hardcoded values */
.my-component {
  background: #f0f4f8;
  padding: 1rem;
  border-radius: 0.75rem;
}
```

## 🎯 Design Tokens موجود

### رنگ‌ها:
- `--color-bg-*` : Background colors
- `--color-text-*` : Text colors
- `--color-border-*` : Border colors
- `--color-accent-*` : Accent colors
- `--color-success/warning/error/info` : Semantic colors

### Spacing:
- `--space-1` تا `--space-8` : 0.25rem تا 3rem

### Typography:
- `--font-body`, `--font-h1`, `--font-h2`, `--font-h3`

### Shadows:
- `--shadow-sm/md/lg/xl`

### Transitions:
- `--transition-fast/base/slow`

### Border Radius:
- `--radius-sm/md/lg/xl/2xl/full`

## ⚙️ PostCSS Pipeline

```javascript
postcss.config.js:
1. postcss-import  → Resolve @imports
2. autoprefixer    → Add vendor prefixes
3. cssnano         → Minify & optimize
```

## 📊 نتایج بهینه‌سازی

| فایل | قبل | بعد | کاهش |
|------|-----|-----|-------|
| color-system.css | 9.5KB | 6.7KB | -30% |
| landing.css | 6.5KB | 5.4KB | -17% |
| design-tokens.css | - | 4.7KB | (جدید) |
| **جمع کل** | ~190KB | ~140KB | **-26%** |

**با Gzip**: ~45KB → ~32KB (**-29%**)

## 🔧 Scripts موجود

```json
{
  "optimize:css": "بهینه‌سازی تمام CSS files",
  "optimize:css:watch": "Watch mode برای development",
  "minify:css": "Minify با پیام success"
}
```

## 🎨 استایل‌گذاری تم

### Light Theme (default):
```css
:root {
  --color-bg-primary: #f0f4f8;
  --color-text-primary: #1e293b;
}
```

### Dark Theme:
```css
[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f1f5f9;
}
```

تغییر تم با JavaScript:
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

## ⚠️ نکات مهم

1. **همیشه از design tokens استفاده کنید**
2. **فایل‌های css-dist/ را commit نکنید** (auto-generated)
3. **قبل از commit، `npm run optimize:css` را اجرا کنید**
4. **@import ها باید relative path باشند** (نه absolute)

## 🐛 مشکلات رایج

### خطای "Failed to find"
```
❌ @import url("/assets/css/tokens.css");
✅ @import url("./tokens.css");
```

### Styles اعمال نمی‌شود
```bash
# Cache browser را پاک کنید
Ctrl + Shift + R (hard refresh)
```

### Variables کار نمی‌کند
```html
<!-- design-tokens.css را import کنید -->
<link rel="stylesheet" href="/assets/css/design-tokens.css">
```

## 📝 Changelog

### 2025-11-05 - Phase 1 Optimization
- ✅ ایجاد design-tokens.css
- ✅ حذف duplicates از ui-enhancements.css
- ✅ نصب PostCSS pipeline
- ✅ کاهش 26% حجم CSS

## 🔜 مراحل بعدی (Roadmap)

- [x] Critical CSS inline
- [x] CSS splitting (core/features/pages)
- [ ] HTTP/2 Server Push
- [ ] Automated visual regression tests
- [ ] CSS-in-JS (اختیاری)

---

## 🎨 Design System 2.0 (نوامبر 2025)

### ✅ بهبودهای جدید:

1. **کاهش 93% رنگ‌ها**
   - از 161 رنگ منحصربه‌فرد به 12 رنگ پایه
   - پالت Water Theme یکپارچه
   - Gradient های اختصاصی

2. **کاهش 70% سایزهای فونت**
   - از 27 سایز به 10 سایز استاندارد
   - Type Scale منطقی (ratio 1.25)
   - Responsive typography

3. **Dark Mode کامل**
   - تمام رنگ‌ها در Dark Mode بهینه شده
   - Automatic color switching
   - High contrast mode support

4. **Typography پیشرفته**
   - 10 سایز استاندارد (xs تا 5xl)
   - Font weights (300-700)
   - Line heights (tight/normal/relaxed)

5. **Spacing System**
   - 8px Grid System
   - 9 سطح spacing (4px تا 96px)

### 📖 مستندات کامل

👉 **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** - راهنمای جامع Design System

این فایل شامل:
- پالت رنگی کامل
- Typography Scale
- مثال‌های کد
- Migration Guide
- Best Practices

---

## 📊 نتایج نهایی بهینه‌سازی

| معیار | قبل | بعد | بهبود |
|-------|-----|-----|-------|
| تعداد رنگ‌ها | 161 | 12 | **-93%** |
| سایزهای فونت | 27 | 10 | **-70%** |
| حجم CSS | ~190KB | ~140KB | **-26%** |
| با Gzip | ~45KB | ~32KB | **-29%** |
| Consistency | ❌ | ✅ | **100%** |

---

## 🤝 مشارکت

برای اضافه کردن استایل جدید:
1. متغیر جدید را به `design-tokens.css` اضافه کنید
2. از متغیر در فایل مربوطه استفاده کنید
3. `npm run optimize:css` را اجرا کنید
4. تست کنید در Light/Dark theme
5. Commit و Push

**توجه**: همیشه از CSS Variables استفاده کنید، نه hardcoded values!

---

**نگهدارنده**: WESH360 Team
**آخرین به‌روزرسانی**: 1404/08/19 (2025-11-09) - Design System 2.0
