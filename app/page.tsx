"use client"

import React, { useState, useEffect } from 'react'
import { Menu, X, Phone, Zap, Droplet, Droplets, ChevronDown, TrendingUp, Clock, Users, ChevronLeft, LayoutDashboard, Calculator, BarChart3, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedCounter from "@/components/ui/AnimatedCounter"
import ValueDrivenHero from "@/components/hero/ValueDrivenHero"
import GovernancePrinciples from "@/components/sections/GovernancePrinciples"
import DataJourney from "@/components/sections/DataJourney"
import FAQ from "@/components/sections/FAQ"

const Breadcrumbs = () => {
  return (
    <nav aria-label="breadcrumb" className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 py-2 px-4">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              itemProp="item"
              aria-label="صفحه اصلی"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span itemProp="name">خانه</span>
            </a>
            <meta itemProp="position" content="1" />
          </li>
          <li aria-current="page" className="flex items-center gap-2">
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">پلتفرم داده</span>
          </li>
        </ol>
      </div>
    </nav>
  );
};

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
                    alt="لوگوی WESH360 - سیستم مدیریت هوشمند آب و انرژی"
                    className="w-16 h-16 object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300 group-hover:scale-105"
                    width={64}
                    height={64}
                    loading="eager"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg" aria-hidden="true"></div>
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
              aria-label={mobileOpen ? "بستن منوی موبایل" : "باز کردن منوی موبایل"}
              aria-expanded={mobileOpen}
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

        /* Stats Cards Animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-up {
          0%, 100% { transform: translateY(0px); opacity: 0.1; }
          50% { transform: translateY(-15px); opacity: 0.3; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.8); }
        }

        @keyframes chart-grow {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }

        @keyframes trend-pulse {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-3px) rotate(45deg); }
        }

        @keyframes grid-fade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }

        .animate-float-delay-1 {
          animation: float-slow 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .animate-float-delay-2 {
          animation: float-slow 4s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-delay-3 {
          animation: float-slow 3.2s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        .animate-float-up {
          animation: float-up 2.5s ease-in-out infinite;
        }

        .animate-float-up-delay-1 {
          animation: float-up 3s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .animate-float-up-delay-2 {
          animation: float-up 2.8s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .animate-float-up-delay-3 {
          animation: float-up 3.2s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-chart-grow {
          animation: chart-grow 2s ease-in-out infinite;
        }

        .animate-trend-pulse {
          animation: trend-pulse 2s ease-in-out infinite;
        }

        .animate-grid-fade {
          animation: grid-fade 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OptimizedNavigation />
      <Breadcrumbs />
      <main>
        <ValueDrivenHero />
        <GovernancePrinciples />
        <DataJourney />

        {/* Stats Section */}
        <section id="stats" className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-balance text-blue-600">
              آمار این سایت در یک نگاه
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Card 1 - ماشین‌حساب (Small) */}
            <div
              className="group rounded-3xl bg-orange-50 border-2 border-orange-400 p-6 text-center hover:bg-orange-100 hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              role="article"
              aria-label="آمار ماشین‌حساب‌ها: 8 ماشین‌حساب هوشمند"
              tabIndex={0}
            >
              {/* Floating Math Symbols Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-4 left-4 text-3xl font-bold text-orange-600 animate-float-slow">÷</div>
                <div className="absolute top-6 right-6 text-2xl font-bold text-orange-600 animate-float-delay-1">×</div>
                <div className="absolute bottom-8 left-6 text-2xl font-bold text-orange-600 animate-float-delay-2">+</div>
                <div className="absolute bottom-4 right-8 text-3xl font-bold text-orange-600 animate-float-delay-3">=</div>
              </div>

              <div className="mb-4 relative z-10">
                <Calculator className="w-6 h-6 text-orange-500 mb-3 mx-auto" />
                <AnimatedCounter
                  end={8}
                  duration={1800}
                  suffix=""
                  className="text-3xl md:text-4xl font-extrabold text-orange-700 mb-1 tracking-tight"
                />
                <p className="text-lg font-semibold text-orange-900 mt-1 leading-tight">
                  ماشین‌حساب
                </p>
                <p className="text-sm text-orange-700/70 mt-1 leading-relaxed">
                  Smart Calculators
                </p>
              </div>
            </div>

            {/* Card 2 - داشبورد (Standard) */}
            <div
              className="group rounded-3xl bg-blue-50 border-2 border-blue-400 p-6 text-center hover:bg-blue-100 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              role="article"
              aria-label="آمار داشبوردها: 12 داشبورد تخصصی تحلیلی"
              tabIndex={0}
            >
              {/* Grid Pattern Background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="grid grid-cols-4 grid-rows-4 gap-2 h-full p-4">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-blue-400 rounded animate-grid-fade" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
              </div>

              <div className="mb-4 relative z-10">
                <BarChart3 className="w-6 h-6 text-blue-500 mb-3 mx-auto" />
                <AnimatedCounter
                  end={12}
                  duration={2000}
                  suffix=""
                  className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-1 tracking-tight"
                />
                <p className="text-lg font-semibold text-blue-900 mt-1 leading-tight">
                  داشبورد تخصصی
                </p>
                <p className="text-sm text-blue-700/70 mt-1 leading-relaxed">
                  Specialized Analytics
                </p>
              </div>
            </div>

            {/* Card 3 - جمعیت (HERO) */}
            <div
              className="md:col-span-2 xl:col-span-1 group rounded-3xl bg-green-100 border-3 border-green-500 p-6 md:p-8 text-center hover:bg-green-200 shadow-xl hover:shadow-2xl shadow-green-300/40 hover:shadow-green-300/70 transition-all duration-300 hover:scale-[1.01] cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              role="article"
              aria-label="آمار جمعیت تحت پوشش: 3.5 میلیون نفر"
              tabIndex={0}
            >
              {/* Floating User Icons Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-6 left-8 animate-float-slow">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="absolute top-10 right-10 animate-float-delay-1">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="absolute bottom-12 left-12 animate-float-delay-2">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="absolute bottom-8 right-14 animate-float-delay-3">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>

              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10">
                <Users className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                <div className="flex items-baseline justify-center gap-2 mb-2 leading-none">
                  <AnimatedCounter
                    end={3.5}
                    duration={2500}
                    decimals={1}
                    suffix=""
                    className="text-5xl md:text-6xl lg:text-7xl font-black text-green-700 tracking-tight"
                  />
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-green-700">میلیون</span>
                </div>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-900 mt-2 leading-tight">
                  جمعیت تحت پوشش
                </p>
                <p className="text-sm md:text-base text-green-700/80 mt-1 font-medium leading-relaxed">
                  Population Served
                </p>
              </div>
            </div>

            {/* Card 4 - کاربران روزانه (Standard) */}
            <div
              className="group rounded-3xl bg-purple-50 border-2 border-purple-400 p-6 text-center hover:bg-purple-100 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              role="article"
              aria-label="آمار کاربران فعال: بیش از 50 کاربر فعال روزانه"
              tabIndex={0}
            >
              {/* Floating Arrows Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-4 left-6 text-3xl animate-float-up">↗</div>
                <div className="absolute top-8 right-8 text-2xl animate-float-up-delay-1">↑</div>
                <div className="absolute bottom-10 left-10 text-xl animate-float-up-delay-2">✨</div>
                <div className="absolute bottom-6 right-6 text-3xl animate-float-up-delay-3">↗</div>
              </div>

              <div className="mb-4 relative z-10">
                <TrendingUp className="w-6 h-6 text-purple-500 mb-3 mx-auto" />
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <AnimatedCounter
                    end={50}
                    duration={2000}
                    suffix="+"
                    className="text-4xl md:text-5xl font-extrabold text-purple-700 tracking-tight"
                  />
                </div>
                <p className="text-lg font-semibold text-purple-900 mt-1 leading-tight">
                  کاربر فعال روزانه
                </p>
                <p className="text-sm text-purple-700/70 mt-1 leading-relaxed">
                  Daily Active Users
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Map Section */}
      <section id="features" className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-8">
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

      {/* FAQ Section */}
      <FAQ />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="/assets/img/logo/wesh360.svg"
                    alt="لوگوی WESH360"
                    className="w-6 h-6"
                    width={24}
                    height={24}
                    loading="lazy"
                  />
                  <span className="text-xl font-semibold">WESH360</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  پلتفرم مدیریت هوشمند آب و انرژی در خراسان رضوی. ما با رعایت امنیت سایبری و حکمرانی داده، داشبوردهای تعاملی برای آگاهی‌بخشی و هم‌افزایی ارائه می‌دهیم.
                </p>
              </div>

              {/* Links Section 1 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">داشبوردها</h3>
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
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">منابع</h3>
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
