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
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-6 py-2 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">
              Data Governance Framework
            </span>
          </div>

          <h2 className="text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              هشت ستون
            </span>
            {' '}حکمرانی داده
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            چارچوب جامع برای مدیریت، کنترل و بهره‌برداری بهینه از دارایی‌های داده
          </p>
        </motion.div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10">
                  {/* Gradient Overlay */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${principle.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${principle.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {principle.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {principle.description}
                  </p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-2">
                    {principle.metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-300"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-6 right-6 text-white/50"
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
          className="text-center mt-16"
        >
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 overflow-hidden">
            <span className="relative z-10">بیشتر بدانید →</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
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
