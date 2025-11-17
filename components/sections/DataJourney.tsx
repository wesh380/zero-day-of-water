'use client';

import { motion } from 'framer-motion';
import { Database, Filter, Sparkles, BarChart3, Brain, CheckCircle } from 'lucide-react';

const journeySteps = [
  {
    icon: Database,
    title: 'جمع‌آوری',
    description: 'دریافت داده از 1000+ نقطه سنجش',
    details: ['IoT sensors', 'Smart meters', 'SCADA systems'],
    color: '#3B82F6'
  },
  {
    icon: Filter,
    title: 'پاکسازی',
    description: 'حذف نویز و اعتبارسنجی خودکار',
    details: ['Auto-validation', 'Anomaly detection', 'Quality check'],
    color: '#8B5CF6'
  },
  {
    icon: Sparkles,
    title: 'استانداردسازی',
    description: 'یکسان‌سازی فرمت و metadata',
    details: ['Unified schema', 'Metadata tagging', 'Format conversion'],
    color: '#EC4899'
  },
  {
    icon: Brain,
    title: 'تحلیل هوشمند',
    description: 'ML/AI برای پیش‌بینی و الگویابی',
    details: ['Predictive models', 'Pattern recognition', 'AI insights'],
    color: '#F59E0B'
  },
  {
    icon: BarChart3,
    title: 'گزارش‌گیری',
    description: 'داشبوردهای تعاملی و real-time',
    details: ['Live dashboards', 'Custom reports', 'Interactive viz'],
    color: '#10B981'
  },
  {
    icon: CheckCircle,
    title: 'تصمیم‌گیری',
    description: 'تبدیل داده به اکشن استراتژیک',
    details: ['Action items', 'Recommendations', 'Policy making'],
    color: '#06B6D4'
  }
];

export default function DataJourney() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_12%,rgba(59,130,246,.2)_12.5%,rgba(59,130,246,.2)_13%,transparent_13.5%)] bg-[length:40px_40px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-black text-gray-900 mb-3">
            سفر داده از
            {' '}
            <span className="text-cyan-600">
              خام تا ارزش
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            فرآیند شش مرحله‌ای تبدیل داده به دانش قابل اقدام
          </p>
        </motion.div>

        {/* Journey Flow */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-blue-600 -translate-y-1/2 hidden lg:block rounded-full shadow-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Step Number */}
                  <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-2xl z-10 shadow-lg border-4 border-white"
                    style={{
                      backgroundColor: step.color
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="relative bg-white backdrop-blur-xl border-2 border-gray-300 rounded-2xl p-6 pt-10 h-full shadow-md hover:shadow-2xl transition-all hover:border-gray-400"
                  >
                    {/* Icon */}
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-lg"
                      style={{ backgroundColor: `${step.color}25`, border: `3px solid ${step.color}50` }}
                    >
                      <Icon
                        className="w-12 h-12"
                        style={{ color: step.color }}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-700 text-base text-center mb-4">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: step.color }}
                          />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: `${step.color}10`
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
