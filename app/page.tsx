"use client"

import React, { useState, useEffect } from 'react'
import { Menu, X, Phone, Zap, Droplet, Droplets, ChevronDown, TrendingUp, Clock, Users, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedCounter from "@/components/ui/AnimatedCounter"
import ValueDrivenHero from "@/components/hero/ValueDrivenHero"
import GovernancePrinciples from "@/components/sections/GovernancePrinciples"
import DataJourney from "@/components/sections/DataJourney"

const OptimizedNavigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Top Bar - اطلاعات رسمی */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* عنوان رسمی */}
            <div className="flex items-center gap-2">
              <span className="font-medium">
                درگاه رسمی داده‌های خانه هم‌افزایی انرژی و آب خراسان رضوی
              </span>
            </div>
          </div>

          {/* تماس */}
          <a href="tel:05138434143" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="hidden md:inline font-medium">051-38434143</span>
            <span className="md:hidden">تماس</span>
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 font-tahoma ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-2xl border-b border-white/20'
            : 'bg-white/70 backdrop-blur-lg border-b border-gray-100/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* Logo و Tagline */}
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src="/page/landing/logo2.webp"
                    alt="WESH360 Logo"
                    className="w-16 h-16 object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    WESH360
                    <span className="text-blue-600">🏠</span>
                  </div>
                  <div className="text-[10px] text-gray-500 -mt-1 font-medium">
                    صرفه‌جویی هوشمند آب و انرژی
                  </div>
                </div>
              </a>

              {/* Trust Badge */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50/80 backdrop-blur-md rounded-full border border-green-200/50 shadow-sm hover:shadow-md transition-all">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  <strong className="font-bold">+3,500</strong> کاربر فعال
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">

              {/* منوی اصلی با آیکون */}
              <a
                href="/dashboards/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-blue-50/80 backdrop-blur-sm transition-all group hover:shadow-md"
              >
                <div className="w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-blue-200/90 transition-all shadow-sm">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  داشبوردها
                </span>
              </a>

              <a
                href="/calculators/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-purple-50/80 backdrop-blur-sm transition-all group hover:shadow-md"
              >
                <div className="w-8 h-8 bg-purple-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-purple-200/90 transition-all shadow-sm">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  محاسبه‌گر
                </span>
              </a>

              <a
                href="/research/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-green-50/80 backdrop-blur-sm transition-all group hover:shadow-md"
              >
                <div className="w-8 h-8 bg-green-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-green-200/90 transition-all shadow-sm">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                  درخواست داده پژوهشی
                </span>
              </a>

              {/* دکمه ارتباط با منوی کشویی */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition-all hover:shadow-md">
                  <span className="font-medium text-gray-700">ارتباط با ما</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <a href="tel:05138434143" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">تماس تلفنی</div>
                      <div className="text-xs text-gray-500">051-38434143</div>
                    </div>
                  </a>
                  <a href="https://t.me/wesh360" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100">
                    <div className="w-5 h-5 text-blue-500">📱</div>
                    <div>
                      <div className="font-medium text-gray-900">تلگرام</div>
                      <div className="text-xs text-gray-500">پشتیبانی آنلاین</div>
                    </div>
                  </a>
                  <a href="/contact/" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors rounded-b-2xl">
                    <div className="w-5 h-5 text-gray-600">✉️</div>
                    <div>
                      <div className="font-medium text-gray-900">فرم تماس</div>
                      <div className="text-xs text-gray-500">پاسخ در 24 ساعت</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* دکمه CTA اصلی */}
              <a
                href="/dashboards/"
                className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group border border-blue-400/30"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <TrendingUp className="w-5 h-5 relative z-10 drop-shadow-md" />
                <span className="relative z-10 drop-shadow-md">مشاهده آمار و گزارش‌ها</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 animate-slideDown shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <a href="/dashboards/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">داشبوردها</span>
              </a>
              <a href="/calculators/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">محاسبه‌گر</span>
              </a>
              <a href="/research/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors">
                <Droplets className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">درخواست داده پژوهشی</span>
              </a>
              <a href="tel:05138434143" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">تماس با ما</span>
              </a>

              <a
                href="/dashboards/"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-full font-bold mt-4"
              >
                <TrendingUp className="w-5 h-5" />
                مشاهده آمار و گزارش‌ها
              </a>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OptimizedNavigation />
      <ValueDrivenHero />
      <GovernancePrinciples />
      <DataJourney />

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
            <div className="rounded-2xl bg-card border-2 border-blue-200 backdrop-blur p-8 text-center hover:border-blue-400 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
                  <Droplet className="w-10 h-10 text-white" />
                </div>
                <AnimatedCounter
                  end={500}
                  duration={2500}
                  suffix="M+"
                  className="text-5xl md:text-6xl font-bold text-primary mb-2"
                />
                <p className="text-gray-700 font-medium text-base leading-relaxed">
                  متر مکعب
                  <br />
                  داده آب
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="rounded-2xl bg-card border-2 border-yellow-200 backdrop-blur p-8 text-center hover:border-yellow-400 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg mb-4">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <AnimatedCounter
                  end={15}
                  duration={2000}
                  suffix="+"
                  className="text-5xl md:text-6xl font-bold text-primary mb-2"
                />
                <p className="text-gray-700 font-medium text-base leading-relaxed">
                  سد و منبع
                  <br />
                  تحت پوشش
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="rounded-2xl bg-card border-2 border-purple-200 backdrop-blur p-8 text-center hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <AnimatedCounter
                  end={1000}
                  duration={2500}
                  suffix="+"
                  className="text-5xl md:text-6xl font-bold text-primary mb-2"
                />
                <p className="text-gray-700 font-medium text-base leading-relaxed">
                  نقطه
                  <br />
                  مانیتورینگ
                </p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="rounded-2xl bg-card border-2 border-green-200 backdrop-blur p-8 text-center hover:border-green-400 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg mb-4">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">24/7</div>
                <p className="text-gray-700 font-medium text-base leading-relaxed">
                  داده
                  <br />
                  Real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Map Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            <div className="text-center">
              <a
                href="./amaayesh/index.html"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white transition-colors shadow-lg hover:shadow-xl"
              >
                <span className="px-3 py-1 text-xs font-bold bg-yellow-500 text-gray-900 rounded-full">
                  آزمایشی
                </span>
                <span className="text-lg font-semibold">نقشه آمایش انرژی خراسان رضوی</span>
                <ChevronLeft className="w-5 h-5" />
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
