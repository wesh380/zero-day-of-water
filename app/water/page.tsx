"use client"

import React, { useState } from 'react';
import { Droplet, AlertTriangle, DollarSign, TrendingUp, BarChart3, Home } from 'lucide-react';
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
            <span className="text-gray-900 font-medium">آب</span>
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

const waterDashboards: DashboardCardType[] = [
  {
    id: 'water-crisis',
    title: 'داشبورد بحران آب',
    description: 'پایش هفتگی وضعیت بحرانی و هشدارهای کمبود آب',
    icon: <AlertTriangle className="w-6 h-6" />,
    category: 'monitoring',
    priority: 'primary',
    quickStats: {
      updateFrequency: 'هر 15 دقیقه',
      coverage: '29 شهرستان خراسان رضوی',
      access: 'عمومی'
    },
    ctaLabel: 'نمایش وضعیت بحرانی',
    ctaLink: '/dash/pages/water/water-crisis/water-crisis.html',
    accentColor: 'red',
    badge: 'فعال',
    badgeVariant: 'warning'
  },
  {
    id: 'water-consumption',
    title: 'داشبورد مصرف آب',
    description: 'تحلیل الگوهای مصرف و روندهای استفاده از منابع آبی',
    icon: <Droplet className="w-6 h-6" />,
    category: 'analytical',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'روزانه',
      coverage: 'استان خراسان رضوی',
      access: 'عمومی'
    },
    ctaLabel: 'نمایش داده‌های مصرف',
    ctaLink: '#',
    accentColor: 'blue'
  },
  {
    id: 'water-pricing',
    title: 'قیمت‌گذاری و تعرفه‌های آب',
    description: 'بررسی ساختار تعرفه‌ها و هزینه‌های مصرف آب',
    icon: <DollarSign className="w-6 h-6" />,
    category: 'operational',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'ماهانه',
      coverage: 'سراسر استان',
      access: 'عمومی'
    },
    ctaLabel: 'تحلیل هزینه‌ها',
    ctaLink: '/dash/pages/water/bills-tariffs/bills-tariffs.html',
    accentColor: 'green'
  },
  {
    id: 'dam-monitoring',
    title: 'پایش سدها و مخازن',
    description: 'نظارت بر سطح آب سدها و ظرفیت ذخیره‌سازی',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'monitoring',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'هفتگی',
      coverage: 'سدهای اصلی استان',
      access: 'عمومی'
    },
    ctaLabel: 'مشاهده وضعیت سدها',
    ctaLink: '/dash/pages/water/dam-monitoring/dam-monitoring.html',
    accentColor: 'cyan'
  },
  {
    id: 'water-prediction',
    title: 'پیش‌بینی و برنامه‌ریزی',
    description: 'مدل‌های پیش‌بینی مصرف و برنامه‌ریزی منابع آبی',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'analytical',
    priority: 'secondary',
    quickStats: {
      updateFrequency: 'فصلی',
      coverage: 'استان خراسان رضوی',
      access: 'عمومی'
    },
    ctaLabel: 'نمایش پیش‌بینی‌ها',
    ctaLink: '/dash/pages/water/future-prediction/future-prediction.html',
    accentColor: 'purple',
    badge: 'جدید',
    badgeVariant: 'new'
  },
];

export default function WaterHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>('all');

  const filteredDashboards = selectedCategory === 'all'
    ? waterDashboards
    : waterDashboards.filter(d => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden" dir="rtl">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-sky-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-200/80 rounded-2xl mb-6 shadow-lg">
              <Droplet className="w-10 h-10 text-sky-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              پیکره داشبوردهای کنترل
              <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent"> آب</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              مجموعه جامع ابزارهای نظارت، تحلیل و مدیریت منابع آبی استان خراسان رضوی
              <br />
              با داده‌های لحظه‌ای و گزارش‌های تخصصی برای تصمیم‌گیری آگاهانه
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
                    ? "bg-sky-600 text-white border-sky-600 shadow-lg scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-sky-400 hover:text-sky-600 hover:shadow-md"
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
                utilityType="water"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-sky-200 p-8 text-center">
            <p className="text-gray-700 leading-relaxed">
              تمامی داشبوردها با استفاده از داده‌های رسمی و معتبر سازمان‌های ذی‌ربط تهیه شده‌اند.
              <br />
              برای اطلاعات بیشتر یا گزارش مشکل، با تیم پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
