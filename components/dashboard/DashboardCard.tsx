"use client"

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { DashboardCard as DashboardCardType } from '@/types/dashboard';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  "group relative rounded-3xl border-2 p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      priority: {
        primary: "md:col-span-2 lg:col-span-1 p-8 border-3",
        secondary: "border-2",
      },
      utility: {
        water: "bg-sky-50 border-sky-400 hover:bg-sky-100 hover:shadow-xl hover:shadow-sky-200/50 focus-visible:ring-sky-500",
        electricity: "bg-amber-50 border-amber-400 hover:bg-amber-100 hover:shadow-xl hover:shadow-amber-200/50 focus-visible:ring-amber-500",
        gas: "bg-orange-50 border-orange-400 hover:bg-orange-100 hover:shadow-xl hover:shadow-orange-200/50 focus-visible:ring-orange-500",
      },
    },
    defaultVariants: {
      priority: "secondary",
      utility: "water",
    },
  }
);

const badgeVariants = cva(
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
  {
    variants: {
      variant: {
        new: "bg-green-500 text-white",
        beta: "bg-yellow-500 text-gray-900",
        updated: "bg-blue-500 text-white",
        warning: "bg-red-500 text-white",
      },
    },
    defaultVariants: {
      variant: "new",
    },
  }
);

interface DashboardCardComponentProps extends VariantProps<typeof cardVariants> {
  card: DashboardCardType;
  utilityType: 'water' | 'electricity' | 'gas';
}

export default function DashboardCard({ card, utilityType, priority }: DashboardCardComponentProps) {
  const {
    title,
    description,
    icon,
    quickStats,
    ctaLabel,
    ctaLink,
    badge,
    badgeVariant,
  } = card;

  return (
    <motion.a
      href={ctaLink}
      className={cn(cardVariants({ priority, utility: utilityType }))}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      role="article"
      aria-label={`${title}: ${description}`}
      tabIndex={0}
    >
      {/* Background Gradient Effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
        utilityType === 'water' && "bg-gradient-to-br from-sky-400/20 to-blue-400/20",
        utilityType === 'electricity' && "bg-gradient-to-br from-amber-400/20 to-yellow-400/20",
        utilityType === 'gas' && "bg-gradient-to-br from-orange-400/20 to-red-400/20"
      )}></div>

      {/* Accent Glow on Hover */}
      <div className={cn(
        "absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity",
        utilityType === 'water' && "bg-sky-500",
        utilityType === 'electricity' && "bg-amber-500",
        utilityType === 'gas' && "bg-orange-500"
      )}></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
              utilityType === 'water' && "bg-sky-200/80 text-sky-700",
              utilityType === 'electricity' && "bg-amber-200/80 text-amber-700",
              utilityType === 'gas' && "bg-orange-200/80 text-orange-700"
            )}>
              {icon}
            </div>
            <h3 className={cn(
              "text-lg md:text-xl font-bold leading-tight",
              utilityType === 'water' && "text-sky-900",
              utilityType === 'electricity' && "text-amber-900",
              utilityType === 'gas' && "text-orange-900"
            )}>
              {title}
            </h3>
          </div>

          {badge && (
            <span className={cn(badgeVariants({ variant: badgeVariant }))}>
              {badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm md:text-base mb-4 leading-relaxed",
          utilityType === 'water' && "text-sky-800",
          utilityType === 'electricity' && "text-amber-800",
          utilityType === 'gas' && "text-orange-800"
        )}>
          {description}
        </p>

        {/* Quick Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className={cn(
              "font-semibold",
              utilityType === 'water' && "text-sky-700",
              utilityType === 'electricity' && "text-amber-700",
              utilityType === 'gas' && "text-orange-700"
            )}>
              • آخرین بروزرسانی:
            </span>
            <span className={cn(
              utilityType === 'water' && "text-sky-600",
              utilityType === 'electricity' && "text-amber-600",
              utilityType === 'gas' && "text-orange-600"
            )}>
              {quickStats.updateFrequency}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className={cn(
              "font-semibold",
              utilityType === 'water' && "text-sky-700",
              utilityType === 'electricity' && "text-amber-700",
              utilityType === 'gas' && "text-orange-700"
            )}>
              • پوشش:
            </span>
            <span className={cn(
              utilityType === 'water' && "text-sky-600",
              utilityType === 'electricity' && "text-amber-600",
              utilityType === 'gas' && "text-orange-600"
            )}>
              {quickStats.coverage}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className={cn(
              "font-semibold",
              utilityType === 'water' && "text-sky-700",
              utilityType === 'electricity' && "text-amber-700",
              utilityType === 'gas' && "text-orange-700"
            )}>
              • دسترسی:
            </span>
            <span className={cn(
              utilityType === 'water' && "text-sky-600",
              utilityType === 'electricity' && "text-amber-600",
              utilityType === 'gas' && "text-orange-600"
            )}>
              {quickStats.access}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all group-hover:gap-3 shadow-md hover:shadow-lg",
          utilityType === 'water' && "bg-sky-600 hover:bg-sky-700",
          utilityType === 'electricity' && "bg-amber-600 hover:bg-amber-700",
          utilityType === 'gas' && "bg-orange-600 hover:bg-orange-700"
        )}>
          <span>{ctaLabel}</span>
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </motion.a>
  );
}
