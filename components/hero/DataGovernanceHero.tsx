'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Database, ShieldCheck, TrendingUp, Network, Zap, Droplet, Flame, Gauge } from 'lucide-react';

const dataFlowNodes = [
  {
    icon: Droplet,
    label: 'آب',
    color: '#3B82F6',
    stat: '500M متر مکعب',
    quality: 95
  },
  {
    icon: Zap,
    label: 'برق',
    color: '#F59E0B',
    stat: '1250 MW پیک',
    quality: 92
  },
  {
    icon: Flame,
    label: 'گاز',
    color: '#EF4444',
    stat: '31 شهر',
    quality: 88
  },
  {
    icon: Gauge,
    label: 'نفت',
    color: '#10B981',
    stat: '+1000 نقطه',
    quality: 90
  },
];

export default function DataGovernanceHero() {
  const [activeNode, setActiveNode] = useState(0);
  const { scrollYProgress } = useScroll();

  // Parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % dataFlowNodes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Solid Background for readability */}
      <div className="absolute inset-0 bg-slate-900" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center"
      >
        {/* Top Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-8 mb-12"
        >
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">127 کاربر آنلاین</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">حکمرانی داده فعال</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">+24% بهره‌وری</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-6 py-2 mb-6"
          >
            <Network className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">
              پلتفرم حکمرانی داده منابع انرژی
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-black mb-6"
          >
            <span className="text-white">از داده خام تا</span>
            <br />
            <span className="text-cyan-400">
              تصمیم هوشمند
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            تبدیل داده‌های پراکنده آب، برق، گاز و نفت به دانش استراتژیک
            <br />
            با استانداردهای حکمرانی داده و هوش مصنوعی
          </motion.p>
        </div>

        {/* Data Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360]
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
              className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center shadow-2xl shadow-blue-500/50"
            >
              <Database className="w-16 h-16 text-white" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl" />
          </div>

          {/* Resource Nodes */}
          <div className="relative h-96 w-full">
            {dataFlowNodes.map((node, index) => {
              const angle = (index * 360) / dataFlowNodes.length;
              const radius = 180;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              const Icon = node.icon;
              const isActive = activeNode === index;

              return (
                <motion.div
                  key={index}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    x: x - 60,
                    y: y - 60,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Connection Line */}
                  <motion.svg
                    className="absolute left-1/2 top-1/2 pointer-events-none"
                    style={{
                      width: radius * 2,
                      height: radius * 2,
                      marginLeft: -radius,
                      marginTop: -radius,
                    }}
                  >
                    <motion.line
                      x1={radius}
                      y1={radius}
                      x2={radius - x}
                      y2={radius - y}
                      stroke={node.color}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: isActive ? 1 : 0.3,
                        opacity: isActive ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.svg>

                  {/* Node */}
                  <motion.div
                    className="relative w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border-2 flex flex-col items-center justify-center cursor-pointer group"
                    style={{
                      borderColor: isActive ? node.color : 'rgba(255,255,255,0.1)',
                      backgroundColor: isActive ? `${node.color}15` : 'rgba(255,255,255,0.05)',
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setActiveNode(index)}
                  >
                    <Icon
                      className="w-8 h-8 mb-2"
                      style={{ color: node.color }}
                    />
                    <span className="text-white text-sm font-bold">
                      {node.label}
                    </span>

                    {/* Quality Indicator */}
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-white bg-black/60 px-2 py-1 rounded-full whitespace-nowrap"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -10 }}
                    >
                      کیفیت: {node.quality}%
                    </motion.div>

                    {/* Stat Badge */}
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-black/70 px-3 py-1 rounded-full whitespace-nowrap"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                    >
                      {node.stat}
                    </motion.div>

                    {/* Pulse Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ backgroundColor: node.color }}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-full font-bold text-white shadow-lg shadow-blue-500/50 transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            کاوش در داده‌های حاکمیتی
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-bold text-white hover:bg-white/20 transition-colors"
          >
            نقشه آمایش انرژی →
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-100"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>ISO 27001 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span>GDPR Compatible</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span>Real-time Analytics</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
