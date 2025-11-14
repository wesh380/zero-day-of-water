'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  FileCheck,
  Target,
  Lock,
  GitBranch,
  Eye,
  Workflow
} from 'lucide-react';

const principles = [
  {
    icon: Shield,
    title: 'امنیت و حریم خصوصی',
    description: 'رمزنگاری end-to-end و کنترل دسترسی چندلایه',
    metrics: ['256-bit encryption', 'RBAC', '2FA'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileCheck,
    title: 'کیفیت داده',
    description: 'اعتبارسنجی، پاکسازی و استانداردسازی خودکار',
    metrics: ['95% accuracy', 'Auto-validation', 'Clean pipeline'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'مالکیت و مسئولیت',
    description: 'تعریف واضح نقش‌ها و Data Stewardship',
    metrics: ['Clear ownership', 'Accountability', 'Audit trail'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: GitBranch,
    title: 'یکپارچگی و استاندارد',
    description: 'یکسان‌سازی فرمت‌ها و metadata management',
    metrics: ['Unified schema', 'Metadata catalog', 'Standards'],
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Eye,
    title: 'شفافیت و ردیابی',
    description: 'Data lineage و تاریخچه کامل تغییرات',
    metrics: ['Full lineage', 'Change history', 'Transparency'],
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Lock,
    title: 'انطباق با قوانین',
    description: 'Compliance خودکار با استانداردهای ملی و بین‌المللی',
    metrics: ['GDPR ready', 'ISO compliant', 'Legal ready'],
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: Target,
    title: 'هدف‌مندی کسب‌وکار',
    description: 'تراز داده با اهداف استراتژیک سازمان',
    metrics: ['Business aligned', 'KPI driven', 'ROI focused'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Workflow,
    title: 'خودکارسازی فرآیند',
    description: 'Data pipeline و governance workflow خودکار',
    metrics: ['Auto workflows', 'Smart alerts', '24/7 monitoring'],
    color: 'from-teal-500 to-green-500'
  }
];

export default function GovernancePrinciples() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 mb-3 sm:mb-4">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-blue-700 text-xs sm:text-sm font-bold">
              Data Governance Framework
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 sm:mb-3 px-4">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
              هشت ستون
            </span>
            {' '}حکمرانی داده
          </h2>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            چارچوب جامع برای مدیریت، کنترل و بهره‌برداری بهینه از دارایی‌های داده
          </p>
        </motion.div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative h-full bg-white backdrop-blur-xl border-2 border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden transition-all duration-300 group-hover:border-gray-400 group-hover:shadow-xl group-hover:shadow-gray-200">
                  {/* Gradient Overlay */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${principle.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Icon */}
                  <div className={`inline-flex p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${principle.color} mb-3 sm:mb-4`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {principle.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed font-medium">
                    {principle.description}
                  </p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {principle.metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="text-xs sm:text-sm bg-gray-100 border-2 border-gray-300 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-gray-800 font-semibold"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-gray-400 font-bold text-base sm:text-lg"
                  >
                    →
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12 md:mt-16"
        >
          <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full font-bold text-white text-sm sm:text-base shadow-lg shadow-blue-500/30 overflow-hidden active:scale-95 transition-transform">
            <span className="relative z-10">بیشتر بدانید →</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
