'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Droplet, Zap, Flame, Droplets, Database, ShieldCheck, TrendingUp, Network, Eye, Clock, Users, Target, BarChart3, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Value Propositions واقعی - نه داده فیک
const resources = [
  {
    id: 'water',
    icon: Droplet,
    name: 'آب',
    color: '#3B82F6',
    gradient: 'from-blue-600 to-cyan-600',
    gradientColors: { from: '#2563eb', to: '#0891b2' },
    glow: 'rgba(59, 130, 246, 0.4)',
    problem: 'بحران آب خراسان رضوی',
    solution: 'مدیریت هوشمند مصرف',
    impact: 'کاهش اتلاف',
    link: '/water/hub',
    features: [
      { icon: Eye, text: 'پایش لحظه‌ای مصرف' },
      { icon: AlertTriangle, text: 'هشدار نشت و اتلاف' },
      { icon: BarChart3, text: 'تحلیل الگوی مصرف' }
    ]
  },
  {
    id: 'electricity',
    icon: Zap,
    name: 'برق',
    color: '#F59E0B',
    gradient: 'from-orange-600 to-red-700',
    gradientColors: { from: '#ea580c', to: '#b91c1c' },
    glow: 'rgba(245, 158, 11, 0.4)',
    problem: 'پیک‌بار و خاموشی',
    solution: 'پیش‌بینی و توزیع بهینه',
    impact: 'کاهش قطعی',
    link: '/electricity/',
    features: [
      { icon: Target, text: 'پیش‌بینی پیک‌بار' },
      { icon: TrendingUp, text: 'بهینه‌سازی توزیع' },
      { icon: Clock, text: 'مدیریت بار شبکه' }
    ]
  },
  {
    id: 'gas',
    icon: Flame,
    name: 'گاز',
    color: '#EF4444',
    gradient: 'from-red-600 to-pink-600',
    gradientColors: { from: '#dc2626', to: '#db2777' },
    glow: 'rgba(239, 68, 68, 0.4)',
    problem: 'کمبود در فصل سرما',
    solution: 'مدیریت تقاضا و عرضه',
    impact: 'توزیع عادلانه',
    link: '/gas/',
    features: [
      { icon: Users, text: 'اولویت‌بندی مصرف' },
      { icon: Eye, text: 'نظارت فشار شبکه' },
      { icon: Lightbulb, text: 'راهکار صرفه‌جویی' }
    ]
  },
  {
    id: 'oil',
    icon: Droplets,
    name: 'فرآورده‌های نفتی',
    color: '#10B981',
    gradient: 'from-green-600 to-emerald-600',
    gradientColors: { from: '#16a34a', to: '#059669' },
    glow: 'rgba(16, 185, 129, 0.4)',
    problem: 'پایش کیفیت و توزیع',
    solution: 'شفافیت در زنجیره تأمین',
    impact: 'کاهش تقلب',
    link: '/gas/',
    features: [
      { icon: ShieldCheck, text: 'تضمین کیفیت' },
      { icon: Eye, text: 'ردیابی زنجیره' },
      { icon: CheckCircle2, text: 'گزارش استاندارد' }
    ]
  }
];

const ctaTexts: Record<(typeof resources)[number]['id'], string> = {
  electricity: 'ورود به داشبورد برق',
  water: 'ورود به داشبورد آب',
  gas: 'ورود به داشبورد گاز',
  oil: 'ورود به داشبورد فرآورده‌های نفتی'
};

// Data Governance Pillars - واقعی
const governancePillars = [
  {
    icon: ShieldCheck,
    title: 'امنیت و حریم خصوصی',
    description: 'حفاظت از داده‌های حساس با رمزنگاری',
    value: 'اطمینان از محرمانگی',
    color: '#1E40AF', // blue-800 for better contrast (6.3:1)
    lightColor: '#3B82F6' // for backgrounds and icons
  },
  {
    icon: Database,
    title: 'یکپارچگی داده',
    description: 'استانداردسازی و یکسان‌سازی منابع',
    value: 'حذف تناقض‌ها',
    color: '#6D28D9', // purple-700 for better contrast (5.3:1)
    lightColor: '#8B5CF6' // for backgrounds and icons
  },
  {
    icon: Eye,
    title: 'شفافیت و ردیابی',
    description: 'مسیر کامل داده از منبع تا گزارش',
    value: 'قابلیت ممیزی',
    color: '#B45309', // amber-700 for better contrast (5.4:1)
    lightColor: '#F59E0B' // for backgrounds and icons
  },
  {
    icon: TrendingUp,
    title: 'تحلیل هوشمند',
    description: 'الگویابی و پیش‌بینی با هوش مصنوعی',
    value: 'تصمیم‌گیری آگاهانه',
    color: '#047857', // green-700 for better contrast (5.6:1)
    lightColor: '#10B981' // for backgrounds and icons
  }
];

export default function ValueDrivenHero() {
  const [activeResource, setActiveResource] = useState(0);
  const [hoveredResource, setHoveredResource] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveResource((prev) => (prev + 1) % resources.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentResource = resources[activeResource];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <motion.div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 50%, ${currentResource.glow}, transparent 70%)` }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {resources.map((resource, idx) => (
          <motion.div
            key={idx}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: resource.color, opacity: 0.3 }}
            initial={{
              x: `${20 + idx * 20}%`,
              y: '100%',
            }}
            animate={{
              y: ['-20%', '100%'],
            }}
            transition={{
              duration: 8 + idx * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: idx * 1.5,
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center py-12"
      >
        {/* Top Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full px-4 py-2 shadow-sm" role="status" aria-label="وضعیت سیستم">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-gray-800 text-sm font-medium">سیستم فعال</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full px-4 py-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-green-600" aria-label="آیکون حکمرانی داده" />
            <span className="text-gray-800 text-sm font-medium">حکمرانی داده</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full px-4 py-2 shadow-sm">
            <Network className="w-4 h-4 text-blue-600" aria-label="آیکون پوشش استانی" />
            <span className="text-gray-800 text-sm font-medium">پوشش استانی</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-6 py-3 mb-6"
            role="complementary"
            aria-label="نشان رسمی سازمان"
          >
            <Database className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="text-blue-700 font-medium">
              درگاه رسمی داده‌های خانه هم‌افزایی انرژی و آب خراسان رضوی
            </span>
          </motion.div>

          {/* Main Headline - Problem/Solution Focused */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-4">
              <span className="text-gray-900">چالش‌های </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeResource}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                  style={{
                    color: currentResource.color
                  }}
                >
                  {currentResource.name}
                </motion.span>
              </AnimatePresence>
              <br />
              <span className="text-gray-900">را با </span>
              <span className="text-orange-700 font-black">
                داده حل کنید
              </span>
            </h1>

            {/* Dynamic Problem/Solution */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeResource}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl max-w-4xl mx-auto"
              >
                <p className="mb-3 text-gray-700">
                  <span className="text-red-600 font-bold">مشکل:</span> {currentResource.problem}
                </p>
                <p className="mb-3 text-gray-700">
                  <span className="text-green-600 font-bold">راه‌حل:</span> {currentResource.solution}
                </p>
                <p className="text-gray-700">
                  <span className="text-cyan-600 font-bold">تأثیر:</span> {currentResource.impact}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Resource Value Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mb-12"
        >
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const isActive = activeResource === index;
            const isHovered = hoveredResource === index;

            return (
              <div key={resource.id} aria-label={`کارت ${resource.name}: ${resource.problem} - راه‌حل: ${resource.solution}`}>
                <motion.div
                  onHoverStart={() => setHoveredResource(index)}
                  onHoverEnd={() => setHoveredResource(null)}
                  onClick={() => setActiveResource(index)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer group"
                  role="article"
                >
                <motion.div
                  className="relative h-full bg-white backdrop-blur-xl rounded-2xl p-6 border-3 transition-all duration-300"
                  style={{
                    borderColor: isActive || isHovered ? resource.color : '#e5e7eb',
                    borderWidth: isActive || isHovered ? '3px' : '2px'
                  }}
                  animate={{
                    boxShadow: isActive
                      ? `0 0 40px ${resource.glow}, 0 10px 30px rgba(0,0,0,0.1)`
                      : isHovered
                      ? `0 0 20px ${resource.glow}`
                      : '0 4px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Gradient Background */}
                  <div
                    className="absolute inset-0 rounded-2xl transition-opacity"
                    style={{
                      background: `radial-gradient(circle at top right, ${resource.color}30, transparent)`,
                      opacity: isActive || isHovered ? 1 : 0.3
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="inline-flex p-4 rounded-xl mb-4"
                      style={{ backgroundColor: resource.color }}
                      animate={{
                        rotate: isActive ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                      aria-hidden="true"
                    >
                      <Icon className="w-7 h-7 text-white" aria-label={`آیکون ${resource.name}`} />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl font-black text-gray-900 mb-3">
                      {resource.name}
                    </h2>

                    {/* Features List */}
                    <div className="space-y-2">
                      {resource.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: isActive ? idx * 0.1 : 0 }}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <FeatureIcon
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: resource.color }}
                            />
                            <span>{feature.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6">
                      <Button
                        asChild
                        className="w-full text-sm font-bold text-white shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: resource.color }}
                      >
                        <Link href={resource.link} aria-label={`ورود به داشبورد ${resource.name}`}>
                          {ctaTexts[resource.id]}
                        </Link>
                      </Button>
                    </div>

                    {/* Hover Action */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: resource.color }}>
                        <span>مشاهده جزئیات</span>
                        <span>←</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Active Pulse */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `2px solid ${resource.color}` }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Data Governance Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              چرا <span className="text-blue-700">حکمرانی داده</span>؟
            </h2>
            <p className="text-gray-600">
              چهار ستون بنیادی برای تصمیم‌گیری مبتنی بر داده
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {governancePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all group overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${pillar.lightColor || pillar.color}, transparent)`
                    }}
                  />

                  <div className="relative z-10">
                    <Icon
                      className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform"
                      style={{ color: pillar.lightColor || pillar.color }}
                      aria-label={`آیکون ${pillar.title}`}
                    />
                    <h3 className="text-gray-900 font-bold mb-2">{pillar.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{pillar.description}</p>
                    <p className="text-xs font-bold" style={{ color: pillar.color }}>
                      ↳ {pillar.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="/dashboards/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-white text-lg shadow-xl shadow-blue-500/30 transition-colors flex items-center gap-3"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            aria-label="دسترسی به داشبورد آمار و گزارش‌های تخصصی"
          >
            <BarChart3 className="w-6 h-6" aria-hidden="true" />
            مشاهده آمار و گزارش‌ها
          </motion.a>

          <motion.a
            href="/research/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white backdrop-blur-xl border-3 border-green-400 rounded-full font-bold text-gray-900 text-lg hover:bg-green-50 transition-all flex items-center gap-3 shadow-xl shadow-green-400/30 hover:shadow-2xl hover:shadow-green-400/40"
            aria-label="دریافت راهنمای استفاده از پلتفرم و درخواست داده پژوهشی"
          >
            <Database className="w-6 h-6 text-green-600" aria-hidden="true" />
            <span>راهنمای استفاده از پلتفرم</span>
          </motion.a>
        </motion.div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm font-medium text-gray-700"
          role="list"
          aria-label="ویژگی‌های کلیدی پلتفرم"
        >
          <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-full px-4 py-2.5" role="listitem">
            <CheckCircle2 className="w-6 h-6 text-green-600" aria-hidden="true" />
            <span className="text-green-800">امنیت تضمین شده</span>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-200 rounded-full px-4 py-2.5" role="listitem">
            <CheckCircle2 className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <span className="text-blue-800">استانداردهای بین‌المللی</span>
          </div>
          <div className="flex items-center gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-full px-4 py-2.5" role="listitem">
            <CheckCircle2 className="w-6 h-6 text-yellow-600" aria-hidden="true" />
            <span className="text-yellow-800">پایش لحظه‌ای</span>
          </div>
          <div className="flex items-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-full px-4 py-2.5" role="listitem">
            <CheckCircle2 className="w-6 h-6 text-purple-600" aria-hidden="true" />
            <span className="text-purple-800">تحلیل هوشمند</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-gray-500 text-xs font-medium">ادامه مطلب</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-gray-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
