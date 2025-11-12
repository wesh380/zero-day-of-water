"use client"

import { Droplet, Zap, Flame, Leaf, Lock, Plus, Minus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "سطح دشواری فیزیکی تور چقدر است؟",
      answer:
        "پلتفرم WESH360 نیاز به درک اساسی کاربر ندارد. رابط کاربری به‌صورت ساده و متناسب با تمام سنین طراحی شده است. شما می‌توانید در هر زمان از داشبوردها استفاده کنید و داده‌ها بلادرنگ به‌روز می‌شوند.",
    },
    {
      question: "در بسته WESH360 چه چیزی شامل است؟",
      answer:
        "بسته ما شامل دسترسی کامل به داشبوردهای تعاملی، تحلیل مصرف انرژی و آب، ماشین‌حساب‌های تخصصی و گزارش‌های پایش لحظه‌ای است. تمام خدمات اساسی رایگان و برای تمام کاربران در دسترس هستند.",
    },
    {
      question: "آیا استفاده از WESH360 ایمن است؟",
      answer:
        "امنیت داده، خط قرمز ما است. تمام اطلاعات با رمزگذاری مطابق با استانداردهای بین‌المللی محافظت می‌شوند. ما صرفاً داده‌های عمومی و غیرشخصی را نمایش می‌دهیم و تاخیر ایمن ۴۸–۷۲ ساعت برای داده‌های حساس اعمال می‌کنیم.",
    },
    {
      question: "چگونه می‌توانم شروع کنم؟",
      answer:
        "ورود بسیار آسان است. فقط یکی از داشبوردها را انتخاب کنید و شروع به کاوش کنید. بدون نیاز به ثبت‌نام یا اطلاعات حساس، شما می‌توانید از تمام ابزارهای پایه استفاده کنید و داده‌های خود را تحلیل کنید.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Image with Overlay */}

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <Droplet className="w-5 h-5" />
            <span className="font-medium text-balance">WESH360</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {["داشبوردها", "ماشین‌حساب", "پژوهش", "سوالات", "ارتباط"].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full hover:bg-primary/30 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full hover:bg-primary/30 transition-colors"
            >
              ورود
            </a>
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-6">
              شروع کنید
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
          {/* Badge */}
          <div className="mb-6 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <span className="text-sm font-medium">پلتفرم مدیریت هوشمند آب و انرژی</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-balance">
            داده‌های آب و انرژی،
            <span className="block text-primary"> برای همه قابل فهم</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-foreground/90 max-w-4xl mb-12 leading-relaxed text-pretty">
            پلتفرم هوشمند مدیریت منابع آب و انرژی خراسان رضوی
            <br />
            برای شهروندان، کشاورزان و تصمیم‌گیران
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8 py-4 text-lg"
            >
              🚀 شروع کنید - رایگان است
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-primary/20 ring-1 ring-primary/30 backdrop-blur border-0 text-foreground hover:bg-primary/30 rounded-full px-8 py-4 text-lg"
            >
              چگونه کار می‌کند؟ ↓
            </Button>
          </div>

          {/* Footer Note */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">بیش از 3,500 کاربر فعال در خراسان رضوی</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Water Data */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Droplet className="w-12 h-12 text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">500M+</div>
                <p className="text-muted-foreground leading-relaxed">متر مکعب<br />داده آب</p>
              </div>
            </div>

            {/* Dams & Sources */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">15+</div>
                <p className="text-muted-foreground leading-relaxed">سد و منبع<br />تحت پوشش</p>
              </div>
            </div>

            {/* Monitoring Points */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Flame className="w-12 h-12 text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">1000+</div>
                <p className="text-muted-foreground leading-relaxed">نقطه<br />مانیتورینگ</p>
              </div>
            </div>

            {/* Real-time Data */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Leaf className="w-12 h-12 text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground leading-relaxed">داده<br />Real-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">مسیر پیش رو</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                از انتخاب داشبورد تا تحلیل داده‌های آب و انرژی، یک سفر ساده و قدرتمند
              </p>
            </div>

            {/* Journey Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Phase 1: Selection */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">۰۱.</div>
                  <h3 className="text-xl font-semibold mb-4">انتخاب و مقدمات</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    یک داشبورد را انتخاب کنید و داخل وارد شوید. بدون نیاز به تکمیل فرم‌های پیچیده، شما می‌توانید فوری از تمام ابزارها استفاده کنید.
                  </p>
                </div>
              </div>

              {/* Phase 2: Data Exploration */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">۰۲.</div>
                  <h3 className="text-xl font-semibold mb-4">کاوش داده‌ها</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    نمودارها و آمارهای بلادرنگ را بررسی کنید. داده‌های تصفیه‌شده و تجمیع‌شده تمام آنچه برای درک وضعیت لازم است را نشان می‌دهند.
                  </p>
                </div>
              </div>

              {/* Phase 3: Analysis */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">۰۳.</div>
                  <h3 className="text-xl font-semibold mb-4">تحلیل و مقایسه</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    اطلاعات خود را با استانداردهای جهانی مقایسه کنید. ماشین‌حساب‌های تخصصی و نکات آموزشی به شما کمک می‌کند.
                  </p>
                </div>
              </div>

              {/* Phase 4: Decision Making */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">۰۴.</div>
                  <h3 className="text-xl font-semibold mb-4">تصمیم‌گیری هوشمند</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    بر اساس داده‌ها و نکات ارائه‌شده، تصمیمات بهتری برای مصرف پایدار آب و انرژی بگیرید.
                  </p>
                </div>
              </div>
            </div>

            {/* Check Availability Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-12 py-4 text-lg font-semibold"
              >
                داشبوردها را ببینید
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left Column - Title and Description */}
              <div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                  سوالات متداول
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                  همه‌چیزی که درباره WESH360 باید بدانید، از نحوه استفاده تا امنیت داده‌های شما
                </p>
              </div>

              {/* Right Column - FAQ Accordion */}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">تماس با تیم ما</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left Column - Contact Form */}
              <div className="rounded-2xl bg-secondary text-foreground p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">ارسال پیام</h3>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      نام
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="نام کامل شما"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      پیام
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      placeholder="درباره علاقه‌های خود درباره WESH360 بنویسید..."
                    />
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 font-normal text-base">
                    ارسال پیام
                  </Button>
                </form>
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-8">
                <div>
                  <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                    برای سوالاتی درباره همکاری‌های فنی، رویدادها یا سوال‌های فنی، لطفاً با ما تماس بگیرید. ما در یک روز کاری پاسخ می‌دهیم.
                  </p>
                </div>

                {/* Profile Card */}
                <div className="rounded-2xl bg-secondary text-foreground p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="/assets/img/logo/wesh360.svg"
                      alt="WESH360"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-semibold">تیم WESH360</h4>
                      <p className="text-muted-foreground">پشتیبانی و توسعه</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    ایمیل
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur-2xl p-12">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Droplet className="w-6 h-6" />
                  <span className="text-xl font-semibold">WESH360</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  پلتفرم رسمی مدیریت هوشمند آب و انرژی خراسان رضوی. ما متعهد به شفافیت، امنیت داده‌ها و توانمندسازی شهروندان هستیم.
                </p>
              </div>

              {/* Dashboards Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">داشبوردها</h3>
                <ul className="space-y-3">
                  {["آب", "برق", "گاز", "محیط‌زیست"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">درباره ما</h3>
                <ul className="space-y-3">
                  {["مأموریت", "استانداردهای ایمنی", "تیم", "محافظت‌اطلاعات"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">منابع</h3>
                <ul className="space-y-3">
                  {["مرکز کمک", "تماس با ما", "سوالات", "شرایط و قوانین"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="border-t border-border pt-12 mb-12">
              <div className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">دریافت به‌روزرسانی‌های WESH360</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    className="flex-1 px-4 py-3 rounded-lg bg-primary/20 ring-1 ring-primary/30 backdrop-blur border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                  <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-6 h-[50px]">
                    اشتراک
                  </Button>
                </div>
              </div>
            </div>

            {/* Sub-footer */}
            <div className="border-t border-border pt-8">
              <p className="text-muted-foreground text-sm text-center">© 2025 WESH360 - مدیریت هوشمند آب و انرژی</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
