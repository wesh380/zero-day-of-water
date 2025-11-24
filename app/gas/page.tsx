"use client"

import React from 'react';
import { Flame, Book, Database, FileText, Calendar, Bell, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
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
            <span className="text-gray-900 font-medium">گاز</span>
          </li>
        </ol>
      </div>
    </nav>
  );
};

interface ContentOptionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaLabel: string;
  ctaLink: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  hoverBgColor: string;
}

const contentOptions: ContentOptionCard[] = [
  {
    id: 'guide',
    title: 'راهنمای استفاده از داشبوردهای مشابه',
    description: 'دسترسی به راهنمای کامل استفاده از داشبوردهای آب و برق که ساختار مشابهی با داشبوردهای گاز خواهند داشت',
    icon: <Book className="w-6 h-6" />,
    ctaLabel: 'مشاهده راهنما',
    ctaLink: '/water',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    hoverBgColor: 'hover:bg-blue-50',
  },
  {
    id: 'raw-data',
    title: 'دسترسی به داده‌های خام گاز',
    description: 'دریافت و بررسی داده‌های خام مصرف گاز و فرآورده‌های نفتی برای تحلیل‌های تخصصی و پژوهشی',
    icon: <Database className="w-6 h-6" />,
    ctaLabel: 'مشاهده داده‌های خام',
    ctaLink: '#',
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    hoverBgColor: 'hover:bg-purple-50',
  },
  {
    id: 'request',
    title: 'درخواست اولویت‌بندی داشبورد خاص',
    description: 'فرم درخواست برای اولویت‌بندی و توسعه داشبورد خاص متناسب با نیاز شما در حوزه گاز و فرآورده‌های نفتی',
    icon: <FileText className="w-6 h-6" />,
    ctaLabel: 'ارسال درخواست',
    ctaLink: '#',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-300',
    hoverBgColor: 'hover:bg-green-50',
  },
  {
    id: 'timeline',
    title: 'برنامه زمانبندی راه‌اندازی',
    description: 'مشاهده تایم‌لاین و برنامه زمانی تقریبی راه‌اندازی داشبوردهای گاز در فصل‌های آینده',
    icon: <Calendar className="w-6 h-6" />,
    ctaLabel: 'مشاهده برنامه',
    ctaLink: '#timeline',
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-300',
    hoverBgColor: 'hover:bg-orange-50',
  },
];

const timelinePhases = [
  {
    phase: 'فاز 1',
    quarter: 'زمستان 1404',
    title: 'جمع‌آوری و پردازش داده',
    status: 'در حال انجام',
    statusColor: 'bg-blue-500',
  },
  {
    phase: 'فاز 2',
    quarter: 'بهار 1405',
    title: 'طراحی داشبوردهای اولیه',
    status: 'برنامه‌ریزی شده',
    statusColor: 'bg-amber-500',
  },
  {
    phase: 'فاز 3',
    quarter: 'تابستان 1405',
    title: 'راه‌اندازی نسخه آزمایشی',
    status: 'آینده',
    statusColor: 'bg-gray-400',
  },
  {
    phase: 'فاز 4',
    quarter: 'پاییز 1405',
    title: 'عرضه عمومی',
    status: 'آینده',
    statusColor: 'bg-gray-400',
  },
];

export default function GasHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden" dir="rtl">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-200/80 rounded-2xl mb-6 shadow-lg">
              <Flame className="w-10 h-10 text-orange-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              داشبوردهای کنترل
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> گاز </span>
              در حال توسعه
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              داشبوردهای جامع مدیریت و نظارت بر گاز و فرآورده‌های نفتی در دست ساخت است
              <br />
              در حال حاضر می‌توانید از گزینه‌های زیر استفاده کنید
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100 border-2 border-orange-300 rounded-full">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-800 font-bold">در دست توسعه</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Options Cards */}
      <section className="px-6 pb-16" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentOptions.map((option, index) => (
              <motion.a
                key={option.id}
                href={option.ctaLink}
                className={cn(
                  "group relative rounded-3xl border-2 bg-white/80 backdrop-blur-sm p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer",
                  option.borderColor,
                  option.hoverBgColor
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                    option.iconBgColor,
                    option.iconColor
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {option.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                <button className={cn(
                  "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all group-hover:gap-3 shadow-md hover:shadow-lg",
                  option.iconColor.replace('text-', 'bg-').replace('-600', '-500'),
                  option.iconColor.replace('text-', 'hover:bg-').replace('-600', '-600')
                )}>
                  <span>{option.ctaLabel}</span>
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </button>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="px-6 pb-16" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-orange-200 p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                برنامه زمانی راه‌اندازی
              </h2>
              <p className="text-gray-700 text-lg">
                تایم‌لاین تقریبی توسعه و راه‌اندازی داشبوردهای گاز
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {timelinePhases.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        phase.statusColor
                      )}></div>
                      <span className="text-sm font-bold text-gray-500">
                        {phase.phase}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-orange-600 font-semibold mb-2">
                      {phase.quarter}
                    </p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {phase.status}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < timelinePhases.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notification Signup */}
      <section className="px-6 pb-16" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Bell className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              اطلاع از راه‌اندازی
            </h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              برای دریافت اطلاعیه زمان راه‌اندازی داشبوردهای گاز،
              <br />
              با تیم پشتیبانی تماس بگیرید یا از طریق کانال تلگرام ما عضو شوید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:05138434143"
                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                تماس: 051-38434143
              </a>
              <a
                href="https://t.me/wesh360"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/30 transition-all"
              >
                عضویت در تلگرام
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="px-6 pb-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200 p-8 text-center">
            <p className="text-gray-700 leading-relaxed">
              توسعه داشبوردهای گاز با همکاری شرکت گاز استان خراسان رضوی در حال انجام است.
              <br />
              از صبر و همراهی شما سپاسگزاریم.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
