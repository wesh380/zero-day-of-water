# 🔍 Debug Hero Box Issue - دستورالعمل

## مشکل:
Hero Box برای چند ثانیه نمایش داده میشه، بعد خودش محو میشه.

---

## 🧪 مرحله 1: Debug Script (پیدا کردن دلیل)

### اضافه کردن به HTML:
```html
<!-- قبل از </body> -->
<script src="/assets/debug-herobox.js"></script>
```

### یا اجرا در Console:
1. صفحه رو باز کن
2. Console رو باز کن (F12)
3. این فایل رو اجرا کن:
   ```bash
   # در terminal:
   cat docs/assets/debug-herobox.js
   ```
4. کد رو کپی کن و در Console paste کن

### چی باید ببینی:
```
🔍 DEBUG: Hero Box Monitoring Started
✅ heroBox found: <div...>
📸 Initial state (after 100ms): { opacity: "1", ... }
```

### اگر مشکل دارهِ، این logs میاد:
```
🔄 Class changed: { old: "hero-box", new: "hero-box fading-out", ... }
⚠️ FADING-OUT class was added!
📊 Opacity changed: { from: "1", to: "0", ... }
❌ HERO BOX IS NOW INVISIBLE!
```

**نتیجه این logs رو copy کن و بفرست!** 📋

---

## 🔧 مرحله 2: Force Script (حل موقت)

اگر می‌خوای Box همیشه visible بمونه (حل موقت):

### اضافه کردن به HTML:
```html
<!-- قبل از </body> -->
<script src="/assets/force-herobox-visible.js"></script>
```

### چی کار می‌کنه:
- هر 100ms opacity رو چک می‌کنه
- اگر opacity != 1، به 1 برمی‌گردونه
- اگر class `fading-out` اضافه بشه، حذفش می‌کنه
- Inline styles اضافه می‌کنه با !important

### نتیجه:
```
🔧 Force Hero Box Visible - Loaded
✅ Hero Box is now protected and will stay visible!
```

---

## 📊 مراحل Debug:

### 1. Initial Check (همین الان):
```javascript
// در Console اجرا کن:
const heroBox = document.getElementById('heroBox');
console.log('Classes:', heroBox.classList);
console.log('Opacity:', window.getComputedStyle(heroBox).opacity);
console.log('Scroll Y:', window.pageYOffset);
console.log('Window Height:', window.innerHeight);
console.log('Fade Start:', window.innerHeight * 1.0);
```

### 2. After 3 Seconds:
```javascript
// 3 ثانیه صبر کن، بعد اجرا کن:
setTimeout(() => {
  const heroBox = document.getElementById('heroBox');
  console.log('After 3s - Classes:', heroBox.classList);
  console.log('After 3s - Opacity:', window.getComputedStyle(heroBox).opacity);
}, 3000);
```

### 3. Monitor Scroll:
```javascript
// scroll رو monitor کن:
let count = 0;
window.addEventListener('scroll', () => {
  count++;
  const heroBox = document.getElementById('heroBox');
  console.log(`Scroll #${count}:`, {
    scrollY: window.pageYOffset,
    opacity: window.getComputedStyle(heroBox).opacity,
    classes: Array.from(heroBox.classList)
  });
});
```

---

## 🎯 چیزهایی که باید چک بشه:

### 1. آیا scroll میشه؟
```javascript
console.log('Scroll Y:', window.pageYOffset);
// اگر > 0 بود، یعنی صفحه scroll شده
```

### 2. آیا class fading-out اضافه میشه؟
```javascript
const heroBox = document.getElementById('heroBox');
console.log('Has fading-out?', heroBox.classList.contains('fading-out'));
```

### 3. آیا opacity تغییر می‌کنه؟
```javascript
const heroBox = document.getElementById('heroBox');
console.log('Computed opacity:', window.getComputedStyle(heroBox).opacity);
console.log('Inline opacity:', heroBox.style.opacity);
```

### 4. آیا fadeInScale animation مشکل داره؟
```javascript
const heroBox = document.getElementById('heroBox');
console.log('Animation:', window.getComputedStyle(heroBox).animation);
```

---

## 🚀 Quick Fix (فوری):

اگر می‌خوای فوری مشکل حل بشه، این رو در Console اجرا کن:

```javascript
const heroBox = document.getElementById('heroBox');

// Force visible
heroBox.style.cssText = `
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  z-index: 20 !important;
`;

// Remove fading-out
heroBox.classList.remove('fading-out');

// Monitor and fix
setInterval(() => {
  if (window.getComputedStyle(heroBox).opacity !== '1') {
    heroBox.style.opacity = '1';
    console.log('Fixed opacity!');
  }
  heroBox.classList.remove('fading-out');
}, 100);

console.log('✅ Hero Box forced to stay visible!');
```

---

## 📝 نتیجه رو بفرست:

لطفاً این اطلاعات رو بفرست:

1. **Console logs** از debug script
2. **Screenshot** از hero box (وقتی visible است و وقتی invisible است)
3. **این اطلاعات:**
   ```javascript
   console.log({
     scrollY: window.pageYOffset,
     windowHeight: window.innerHeight,
     fadeStart: window.innerHeight * 1.0,
     boxClasses: Array.from(document.getElementById('heroBox').classList),
     boxOpacity: window.getComputedStyle(document.getElementById('heroBox')).opacity
   });
   ```

---

## 🎯 دلایل احتمالی:

1. ✅ **Guard condition کار نمی‌کنه** - scrolled >= boxFadeStart چک نمیشه
2. ✅ **Scroll اتفاق میفته** - شاید یک auto-scroll هست
3. ✅ **CSS animation مشکل داره** - fadeInScale بعد از اتمام opacity رو 0 می‌کنه
4. ✅ **JavaScript دیگه ای** - ui-enhancements.js یا micro-interactions.js
5. ✅ **Intersection Observer** - بخش 5 از parallax.js

---

**الان debug script رو اضافه کن و نتیجه رو بفرست!** 🔍
