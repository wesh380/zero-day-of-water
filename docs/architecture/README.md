# WESH360 System Architecture Documentation

این دایرکتوری شامل مستندات معماری سیستم WESH360 است.

## 📄 فایل‌ها

### 1. `ARCHITECTURE.md`
مستندات کامل معماری سیستم با دیاگرام‌های Mermaid که در GitHub به خوبی رندر می‌شوند.

**مشاهده:** فایل را مستقیماً در GitHub باز کنید تا دیاگرام‌ها رندر شوند.

### 2. `system_architecture.py`
اسکریپت Python برای تولید دیاگرام معماری با استفاده از کتابخانه `diagrams`.

**پیش‌نیازها:**
- Python 3.7+
- Graphviz
- کتابخانه diagrams

### 3. `Dockerfile`
فایل Docker برای اجرای راحت اسکریپت Python بدون نیاز به نصب دستی dependencies.

## 🚀 روش‌های استفاده

### روش 1: مشاهده در GitHub (توصیه می‌شود)
ساده‌ترین روش این است که فایل `ARCHITECTURE.md` را مستقیماً در GitHub باز کنید. دیاگرام‌های Mermaid به صورت خودکار رندر می‌شوند.

[مشاهده معماری سیستم →](./ARCHITECTURE.md)

---

### روش 2: استفاده از Docker

اگر می‌خواهید دیاگرام PNG تولید کنید، از Docker استفاده کنید:

```bash
# Build Docker image
cd docs/architecture
docker build -t wesh360-architecture .

# Run و تولید دیاگرام
docker run --rm -v $(pwd):/app wesh360-architecture

# فایل wesh360_architecture.png تولید می‌شود
```

---

### روش 3: نصب دستی

#### macOS
```bash
# نصب Graphviz
brew install graphviz

# نصب Python package
pip install diagrams

# اجرای اسکریپت
python system_architecture.py
```

#### Ubuntu/Debian
```bash
# نصب Graphviz
sudo apt-get update
sudo apt-get install graphviz

# نصب Python package
pip install diagrams

# اجرای اسکریپت
python system_architecture.py
```

#### Windows (با Chocolatey)
```powershell
# نصب Graphviz
choco install graphviz

# نصب Python package
pip install diagrams

# اجرای اسکریپت
python system_architecture.py
```

---

## 📊 خروجی

اجرای موفق اسکریپت Python یک فایل `wesh360_architecture.png` تولید می‌کند که شامل دیاگرام کامل معماری سیستم است.

---

## 🔍 محتوای دیاگرام

دیاگرام معماری شامل موارد زیر است:

- ✅ **Frontend Layer**: Netlify CDN, Static Assets, Netlify Functions
- ✅ **Backend Layer**: FastAPI, Rate Limiter, Job Queue, Worker
- ✅ **External Services**: Google Gemini AI, Maps APIs
- ✅ **Data Layer**: JSON & GeoJSON data sources
- ✅ **Security**: CORS, HMAC Signature Validation, Rate Limiting
- ✅ **Monitoring**: Prometheus Metrics
- ✅ **CI/CD**: GitHub Actions deployment flow

---

## 📝 به‌روزرسانی دیاگرام

برای به‌روزرسانی دیاگرام:

1. فایل `system_architecture.py` را ویرایش کنید
2. اسکریپت را اجرا کنید (با یکی از روش‌های بالا)
3. دیاگرام جدید تولید می‌شود

---

## 🤝 مشارکت

برای اضافه کردن جزئیات بیشتر یا اصلاح دیاگرام:

1. فایل Python را ویرایش کنید
2. Pull Request ایجاد کنید
3. دیاگرام به‌روزرسانی شده را attach کنید

---

## 📚 منابع

- [Diagrams Documentation](https://diagrams.mingrammer.com/)
- [Graphviz Installation](https://graphviz.org/download/)
- [Mermaid Documentation](https://mermaid.js.org/)

---

تاریخ آخرین به‌روزرسانی: 2025-11-07
