"use client"

import React, { useState } from 'react';
import { Zap, Activity, TrendingUp, Clock, BarChart3, AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { DashboardCard as DashboardCardType, CategoryFilter, DashboardCategory } from '@/types/dashboard';
import { cn } from '@/lib/utils';

const Breadcrumbs = () => {
  return (
    <nav aria-label="breadcrumb" className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 py-2 px-4" dir="rtl">
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
            <span className="text-gray-900 font-medium">برق</span>
          </li>
        </ol>
      </div>
    </nav>
  );
};

const categoryFilters: CategoryFilter[] = [
  { id: 'all', label: 'همه داشبوردها' },
  { id: 'operational', label: 'آگاهی و اطلاع رسانی' },
  { id: 'analytical', label: 'تحلیل و گزارش' },
  { id: 'monitoring', label: 'پایش هفتگی' },
];

const electricityDashboards: DashboardCardType[] = [
  {
    id: 'reliability-quality',
    title: 'شاخص‌های قابلیت اطمینان، خاموشی، و پروفایل کیفیت',
    description: 'تحلیل جامع عملکرد شبکه و شاخص‌های کیفیت برق',
    icon: <Activity className="w-6 h-6" />,
    category: 'analytical',
    priority: 'primary',
    quickStats: {
      updateFrequency: 'ماهانه',
      coverage: '29 شهرستان خراسان رضوی',
      access: 'عمومی'
    },
    ctaLabel: 'مشاهده شاخص‌ها',
    ctaLink: '/dash/pages/electricity/electricity.html',
    accentColor: 'amber',
    badge: 'فعال',
    badgeVariant: 'warning'
  },
  {
    id: 'trends-analysis',
    title: 'روندها، همبستگی‌ها و تحلیل شاخص‌ها',
    description: 'بررسی روندهای زمانی و تحلیل ارتباط شاخص‌های مختلف',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'analytical',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'دوره زمانی: 1400-1403',
      coverage: 'سراسر استان',
      access: 'عمومی'
    },
    ctaLabel: 'تحلیل روندها',
    ctaLink: '/dash/pages/electricity/electricity.html#trends',
    accentColor: 'orange'
  },
  {
    id: 'peak-management',
    title: 'پیک روزانه، ساعتی، هشدار، پیک و مدیریت بار',
    description: 'پایش بار شبکه و مدیریت مصرف در ساعات اوج',
    icon: <Zap className="w-6 h-6" />,
    category: 'monitoring',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'هر ساعت',
      coverage: 'شبکه برق استان',
      access: 'عمومی'
    },
    ctaLabel: 'بررسی وضعیت پیک',
    ctaLink: '/dash/pages/electricity/electricity.html#peak',
    accentColor: 'red',
    badge: 'زنده',
    badgeVariant: 'warning'
  },
  {
    id: 'outage-monitoring',
    title: 'پایش خاموشی‌ها و اختلالات',
    description: 'رصد و تحلیل رویدادهای خاموشی و کیفیت تامین برق',
    icon: <AlertCircle className="w-6 h-6" />,
    category: 'monitoring',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'لحظه‌ای',
      coverage: '29 شهرستان',
      access: 'عمومی'
    },
    ctaLabel: 'نمایش گزارش خاموشی',
    ctaLink: '/dash/pages/electricity/electricity.html#outages',
    accentColor: 'amber'
  },
  {
    id: 'consumption-patterns',
    title: 'الگوهای مصرف و پیش‌بینی',
    description: 'تحلیل الگوهای مصرف برق و پیش‌بینی نیاز آتی',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'analytical',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'هفتگی',
      coverage: 'بخش‌های مختلف مصرف',
      access: 'عمومی'
    },
    ctaLabel: 'مشاهده الگوهای مصرف',
    ctaLink: '/dash/pages/electricity/electricity.html#patterns',
    accentColor: 'yellow'
  },
  {
    id: 'historical-data',
    title: 'داده‌های تاریخی و مقایسه‌ای',
    description: 'مقایسه شاخص‌های برق در بازه‌های زمانی مختلف',
    icon: <Clock className="w-6 h-6" />,
    category: 'operational',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'سالانه',
      coverage: 'دوره 1400-1403',
      access: 'عمومی'
    },
    ctaLabel: 'مشاهده داده‌های تاریخی',
    ctaLink: '/dash/pages/electricity/electricity.html#historical',
    accentColor: 'blue',
    badge: 'آرشیو',
    badgeVariant: 'beta'
  },
];

export default function ElectricityHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>('all');

  const filteredDashboards = selectedCategory === 'all'
    ? electricityDashboards
    : electricityDashboards.filter(d => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden" dir="rtl">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-200/80 rounded-2xl mb-6 shadow-lg">
              <Zap className="w-10 h-10 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              پیکره داشبوردهای کنترل
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent"> برق</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              ابزارهای پیشرفته نظارت و تحلیل شبکه برق استان خراسان رضوی
              <br />
              شامل شاخص‌های قابلیت اطمینان، کیفیت، و مدیریت بار لحظه‌ای
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-6 pb-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedCategory(filter.id)}
                className={cn(
                  "px-6 py-3 rounded-full font-semibold transition-all duration-300 border-2",
                  selectedCategory === filter.id
                    ? "bg-amber-600 text-white border-amber-600 shadow-lg scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:text-amber-600 hover:shadow-md"
                )}
                aria-pressed={selectedCategory === filter.id}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="px-6 pb-16" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                card={dashboard}
                utilityType="electricity"
                priority={dashboard.priority}
              />
            ))}
          </div>

          {filteredDashboards.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                هیچ داشبوردی در این دسته‌بندی یافت نشد
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Info */}
      <section className="px-6 pb-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-amber-200 p-8 text-center">
            <p className="text-gray-700 leading-relaxed">
              داده‌های این داشبوردها از شرکت توزیع نیروی برق خراسان رضوی تامین می‌شود.
              <br />
              برای اطلاعات بیشتر یا گزارش مشکل، با تیم پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
