# 🗺️ نقشه آمایش انرژی - بهبودها و پیشنهادات

## ✅ بهبودهای اعمال شده

### 1. **رفع مشکلات اساسی**
- ✅ حذف آیکون‌های خراب (112 Point feature فیلتر شدند)
- ✅ رفع خطای Leaflet `_leaflet_events`
- ✅ بهبود visibility مرزها با style های واضح‌تر

### 2. **بهبود نمایش مرزها**
```javascript
// مرز استان: قرمز، کلفت، واضح
color: '#ef4444'  // قرمز روشن
weight: 5         // خیلی کلفت
opacity: 1        // کاملاً مات
fillOpacity: 0.03 // fill بسیار کم‌رنگ

// مرزهای شهرستان‌ها: خاکستری، متوسط
color: '#94a3b8'  // خاکستری روشن‌تر
weight: 2         // متوسط
opacity: 0.8      // نسبتاً واضح
```

### 3. **UI Enhancements جدید**

#### **Legend (راهنمای نقشه)**
- نمایش در پایین سمت راست
- قابلیت باز/بسته شدن
- نمایش تعداد دقیق سایت‌ها
- شامل نکات استفاده

#### **Info Panel (پنل اطلاعات)**
- نمایش در بالا سمت راست
- نمایش جزئیات سایت‌های انرژی
- به‌روزرسانی هنگام کلیک

#### **Tooltips**
- Polygon tooltips: نمایش نام شهرستان‌ها
- Marker tooltips: جزئیات سایت‌های انرژی
- Custom styling با فونت فارسی

#### **Control Buttons**
- 🔲 Fullscreen: نمایش تمام صفحه
- ↺ Reset View: بازگشت به نمای کلی

#### **Welcome Tour**
- راهنمای اولیه برای کاربران جدید
- قابلیت غیرفعال کردن با localStorage
- نمایش خودکار در اولین بازدید

---

## 🎯 پیشنهادات بهبود آینده

### **1. فیلترها و جستجو**

```javascript
// اضافه کردن فیلتر ظرفیت
const capacityFilter = L.control({ position: 'topright' });
capacityFilter.onAdd = function() {
  const div = L.DomUtil.create('div', 'capacity-filter');
  div.innerHTML = `
    <label>فیلتر ظرفیت (MW):</label>
    <input type="range" min="0" max="100" value="0">
    <span id="capacity-value">0</span> MW
  `;
  return div;
};

// Search box برای جستجوی شهرستان‌ها
const searchBox = L.control({ position: 'topleft' });
searchBox.onAdd = function() {
  const div = L.DomUtil.create('div', 'search-box');
  div.innerHTML = `
    <input type="text" placeholder="جستجوی شهرستان...">
    <button>🔍</button>
  `;
  return div;
};
```

### **2. Clustering برای نقاط**

```javascript
// استفاده از MarkerClusterGroup برای بهبود performance
import 'leaflet.markercluster';

const windCluster = L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: 'marker-cluster-wind',
      iconSize: [40, 40]
    });
  }
});

windCluster.addLayer(windMarkers);
map.addLayer(windCluster);
```

### **3. نمودارها و آمار**

```javascript
// اضافه کردن Chart.js برای نمایش آمار
const statsPanel = L.control({ position: 'bottomleft' });
statsPanel.onAdd = function() {
  const div = L.DomUtil.create('div', 'stats-panel');
  div.innerHTML = `
    <canvas id="energy-chart"></canvas>
    <div class="stats-summary">
      <div>کل ظرفیت بادی: <strong>${totalWindCapacity} MW</strong></div>
      <div>کل ظرفیت خورشیدی: <strong>${totalSolarCapacity} MW</strong></div>
      <div>تعداد سدها: <strong>${damsCount}</strong></div>
    </div>
  `;
  return div;
};
```

### **4. Heatmap Layer**

```javascript
// اضافه کردن heatmap برای چگالی سایت‌ها
import 'leaflet.heat';

const heatData = windSites.map(site => [
  site.geometry.coordinates[1],
  site.geometry.coordinates[0],
  site.properties.capacity_mw / 100
]);

const heat = L.heatLayer(heatData, {
  radius: 25,
  blur: 35,
  maxZoom: 10,
  gradient: {
    0.0: 'blue',
    0.5: 'yellow',
    1.0: 'red'
  }
});

map.addLayer(heat);
```

### **5. Export و Share**

```javascript
// دکمه export به PNG
const exportBtn = L.control({ position: 'topleft' });
exportBtn.onAdd = function() {
  const btn = L.DomUtil.create('button', 'map-control-btn');
  btn.innerHTML = '📸';
  btn.title = 'ذخیره تصویر نقشه';

  btn.onclick = () => {
    html2canvas(document.getElementById('map')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'amaayesh-map.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return btn;
};

// دکمه share
const shareBtn = L.control({ position: 'topleft' });
shareBtn.onAdd = function() {
  const btn = L.DomUtil.create('button', 'map-control-btn');
  btn.innerHTML = '🔗';
  btn.title = 'اشتراک‌گذاری نقشه';

  btn.onclick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('لینک نقشه کپی شد!');
  };

  return btn;
};
```

### **6. Routing و مسیریابی**

```javascript
// اضافه کردن routing بین سایت‌ها
import 'leaflet-routing-machine';

const routing = L.Routing.control({
  waypoints: [
    L.latLng(36.3, 59.5),
    L.latLng(35.5, 59.9)
  ],
  routeWhileDragging: true,
  language: 'fa'
}).addTo(map);
```

### **7. 3D View**

```javascript
// استفاده از Mapbox GL JS برای 3D
import mapboxgl from 'mapbox-gl';

const map3D = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [59.6, 36.3],
  zoom: 7,
  pitch: 60,
  bearing: -17.6
});

// اضافه کردن 3D extrusion برای ظرفیت
map3D.addLayer({
  id: 'wind-3d',
  type: 'fill-extrusion',
  source: 'wind-sites',
  paint: {
    'fill-extrusion-color': '#0ea5e9',
    'fill-extrusion-height': ['get', 'capacity_mw'],
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': 0.8
  }
});
```

### **8. Real-time Data**

```javascript
// اتصال به API برای داده‌های real-time
const updateRealTimeData = async () => {
  const response = await fetch('/api/energy-sites/realtime');
  const data = await response.json();

  // به‌روزرسانی markers
  data.forEach(site => {
    const marker = markers[site.id];
    if (marker) {
      marker.setIcon(createDynamicIcon(site.currentProduction));
      marker.getPopup().setContent(createPopupContent(site));
    }
  });
};

setInterval(updateRealTimeData, 60000); // هر دقیقه
```

### **9. بهبود Performance**

```javascript
// استفاده از Canvas Renderer برای layers بزرگ
const canvasRenderer = L.canvas({ padding: 0.5 });

const counties = L.geoJSON(countiesData, {
  renderer: canvasRenderer,
  style: { weight: 1, color: '#94a3b8' }
});

// Lazy loading برای markers
const visibleMarkers = [];
map.on('moveend', () => {
  const bounds = map.getBounds();
  markers.forEach(marker => {
    if (bounds.contains(marker.getLatLng())) {
      if (!visibleMarkers.includes(marker)) {
        map.addLayer(marker);
        visibleMarkers.push(marker);
      }
    } else {
      map.removeLayer(marker);
      visibleMarkers.splice(visibleMarkers.indexOf(marker), 1);
    }
  });
});
```

### **10. Accessibility (دسترسی‌پذیری)**

```javascript
// اضافه کردن keyboard navigation
map.on('keydown', (e) => {
  const step = 0.1;
  const center = map.getCenter();

  switch(e.originalEvent.key) {
    case 'ArrowUp':
      map.panTo([center.lat + step, center.lng]);
      break;
    case 'ArrowDown':
      map.panTo([center.lat - step, center.lng]);
      break;
    case 'ArrowLeft':
      map.panTo([center.lat, center.lng - step]);
      break;
    case 'ArrowRight':
      map.panTo([center.lat, center.lng + step]);
      break;
    case '+':
      map.zoomIn();
      break;
    case '-':
      map.zoomOut();
      break;
  }
});

// Screen reader support
markers.forEach(marker => {
  marker.options.alt = `سایت ${marker.properties.name_fa}`;
  marker.options.title = marker.properties.name_fa;
  marker.getElement().setAttribute('role', 'button');
  marker.getElement().setAttribute('aria-label', marker.properties.name_fa);
});
```

---

## 📊 راهنماهای پیشنهادی

### **1. راهنمای کیبورد**
```
Arrow Keys: حرکت نقشه
+ / -: زوم
Space: باز/بسته کردن popup
Enter: کلیک روی marker انتخاب شده
Tab: جابجایی بین markers
```

### **2. راهنمای لایه‌ها**
- 🔴 **مرز استان**: قرمز، کلفت - مرز اصلی خراسان رضوی
- ⚪ **مرزهای شهرستان‌ها**: خاکستری، نازک - تقسیمات داخلی
- 💨 **سایت‌های بادی**: آبی - پتانسیل انرژی بادی
- ☀️ **سایت‌های خورشیدی**: زرد - پتانسیل انرژی خورشیدی
- 💧 **سدها**: آبی تیره - منابع آبی و پتانسیل هیدروالکتریک

### **3. راهنمای تعامل**
- **کلیک**: مشاهده جزئیات سایت
- **Scroll**: زوم in/out
- **Drag**: حرکت نقشه
- **Hover**: نمایش tooltip با نام

---

## 🔧 نصب کتابخانه‌های پیشنهادی

```bash
# برای Clustering
npm install leaflet.markercluster

# برای Heatmap
npm install leaflet.heat

# برای Routing
npm install leaflet-routing-machine

# برای Export
npm install html2canvas

# برای Charts
npm install chart.js

# برای 3D
npm install mapbox-gl
```

---

## 📝 چک‌لیست بهبودهای بعدی

- [ ] اضافه کردن فیلتر ظرفیت
- [ ] پیاده‌سازی search box
- [ ] اضافه کردن clustering
- [ ] نمایش نمودارهای آماری
- [ ] اضافه کردن heatmap layer
- [ ] پیاده‌سازی export to PNG/PDF
- [ ] اضافه کردن share functionality
- [ ] پیاده‌سازی routing
- [ ] بهبود performance با lazy loading
- [ ] افزایش accessibility
- [ ] اضافه کردن dark mode
- [ ] پیاده‌سازی offline support (PWA)
- [ ] اضافه کردن multi-language support
- [ ] Real-time data integration

---

## 🎨 رنگ‌های استفاده شده

```css
/* مرزها */
--province-border: #ef4444;  /* قرمز */
--county-border: #94a3b8;    /* خاکستری */

/* نقاط */
--wind: #38bdf8;     /* آبی روشن */
--solar: #fbbf24;    /* زرد */
--dams: #60a5fa;     /* آبی */

/* UI Elements */
--primary: #0ea5e9;  /* آبی اصلی */
--dark: #0f172a;     /* تیره */
--light: #f1f5f9;    /* روشن */
```

---

## 📞 پشتیبانی

برای سوالات یا پیشنهادات:
- 📧 Email: support@wesh360.ir
- 🌐 Website: https://wesh360.ir
- 📱 Telegram: @wesh360

---

**تاریخ آخرین به‌روزرسانی:** 2025-01-15
**نسخه:** 2.0.0
