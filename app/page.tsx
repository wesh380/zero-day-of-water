"use client"

import { Droplet, Zap, Flame, Leaf, ChevronLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <img src="/assets/img/logo/wesh360.svg" alt="WESH360" className="w-5 h-5" />
            <span className="font-medium text-balance">WESH360</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "داشبوردها", href: "/dashboards/" },
              { label: "ماشین‌حساب", href: "/calculators/" },
              { label: "پژوهش", href: "/research/" },
              { label: "ارتباط", href: "/contact/" },
              { label: "سیاست امنیت", href: "/security/" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full hover:bg-primary/30 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
          {/* Badge */}
          <div className="mb-6 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <span className="text-sm font-medium">بیش از 3,500 کاربر فعال در خراسان رضوی</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-balance">
            داده‌های آب و انرژی،
            <br />
            <span className="font-bold">برای همه قابل فهم</span>
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
              asChild
            >
              <a href="#features">شروع کنید - رایگان است</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-primary/20 ring-1 ring-primary/30 backdrop-blur border-0 text-foreground hover:bg-primary/30 rounded-full px-8 py-4 text-lg"
              asChild
            >
              <a href="#stats">چگونه کار می‌کند؟</a>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">امنیت داده، خط قرمز ماست</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              وضعیت آب و انرژی خراسان رضوی در یک نگاه
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">💧</div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">500M+</div>
                <p className="text-muted-foreground leading-relaxed">
                  متر مکعب
                  <br />
                  داده آب
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">⚡</div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">15+</div>
                <p className="text-muted-foreground leading-relaxed">
                  سد و منبع
                  <br />
                  تحت پوشش
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">📊</div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">1000+</div>
                <p className="text-muted-foreground leading-relaxed">
                  نقطه
                  <br />
                  مانیتورینگ
                </p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">🔄</div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground leading-relaxed">
                  داده
                  <br />
                  Real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                داشبوردهای تعاملی
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                پایش لحظه‌ای و مدیریت هوشمند منابع آب، برق و انرژی
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Water Card */}
              <a
                href="/water/hub"
                className="group rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
                    <Droplet className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold">آب</h3>
                      <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-700 rounded-full">
                        فعال
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      داشبورد مدیریت و پایش منابع آب
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">مشاهده داشبورد</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </a>

              {/* Electricity Card */}
              <a
                href="/electricity/"
                className="group rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-yellow-500/20 ring-1 ring-yellow-500/30">
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold">برق</h3>
                      <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-700 rounded-full">
                        فعال
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      تحلیل پیک، کیفیت و مدیریت مصرف
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">مشاهده داشبورد</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </a>

              {/* Gas Card */}
              <a
                href="/gas/"
                className="group rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold">گاز و فرآورده‌های نفتی</h3>
                      <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-700 rounded-full">
                        فعال
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">پایش توزیع و شدت کربن</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">مشاهده داشبورد</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </a>

              {/* Environment Card */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 opacity-75">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-green-500/20 ring-1 ring-green-500/30">
                    <Leaf className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold">محیط زیست و پسماند</h3>
                      <span className="px-3 py-1 text-xs font-medium bg-gray-500/20 text-gray-700 rounded-full">
                        به‌زودی
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      پایش آلودگی، کیفیت هوا/آب، مدیریت پسماند
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Link */}
            <div className="text-center pt-8 border-t border-border">
              <a
                href="./amaayesh/index.html"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white transition-colors"
              >
                <span>نقشه آمایش انرژی خراسان رضوی</span>
                <ChevronLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <img src="/assets/img/logo/wesh360.svg" alt="WESH360" className="w-6 h-6" />
                  <span className="text-xl font-semibold">WESH360</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  پلتفرم مدیریت هوشمند آب و انرژی در خراسان رضوی. ما با رعایت امنیت سایبری و حکمرانی
                  داده، داشبوردهای تعاملی برای آگاهی‌بخشی و هم‌افزایی ارائه می‌دهیم.
                </p>
              </div>

              {/* Links Section 1 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">داشبوردها</h3>
                <ul className="space-y-3">
                  {["آب", "برق", "گاز و فرآورده‌های نفتی", "محیط زیست"].map((item) => (
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

              {/* Links Section 2 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">منابع</h3>
                <ul className="space-y-3">
                  {["پژوهش", "ماشین‌حساب", "ارتباط با ما", "سیاست امنیت"].map((item) => (
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

            {/* Sub-footer */}
            <div className="border-t border-border pt-8">
              <p className="text-muted-foreground text-sm text-center">
                © 2025 WESH360 | مدیریت هوشمند آب و انرژی خراسان رضوی
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
