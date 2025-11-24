import { ReactNode } from 'react';

/**
 * Dashboard card category types for filtering and organization
 */
export type DashboardCategory =
  | 'operational'      // آگاهی و اطلاع رسانی
  | 'analytical'       // تحلیل و گزارش
  | 'monitoring'       // پایش هفتگی
  | 'all';             // همه داشبوردها

/**
 * Dashboard card priority level determines visual hierarchy
 */
export type DashboardPriority = 'primary' | 'secondary';

/**
 * Utility resource type
 */
export type UtilityType = 'water' | 'electricity' | 'gas';

/**
 * Quick stats preview information for dashboard cards
 */
export interface QuickStats {
  /** بروزرسانی - Update frequency (e.g., "هر 15 دقیقه", "روزانه") */
  updateFrequency: string;

  /** پوشش - Geographic or data scope (e.g., "29 شهرستان خراسان رضوی") */
  coverage: string;

  /** دسترسی - Access level (e.g., "عمومی", "محدود") */
  access: string;
}

/**
 * Main dashboard card interface
 */
export interface DashboardCard {
  /** Unique identifier */
  id: string;

  /** Dashboard title in Persian */
  title: string;

  /** Brief description (1 line max) */
  description: string;

  /** Icon component or emoji */
  icon: ReactNode;

  /** Category for filtering */
  category: DashboardCategory;

  /** Visual priority level */
  priority: DashboardPriority;

  /** Quick stats preview */
  quickStats: QuickStats;

  /** Call-to-action button label */
  ctaLabel: string;

  /** Dashboard link/route */
  ctaLink: string;

  /** Accent color (Tailwind class or hex) */
  accentColor: string;

  /** Optional badge text (e.g., "جدید", "آزمایشی") */
  badge?: string;

  /** Optional badge color variant */
  badgeVariant?: 'new' | 'beta' | 'updated' | 'warning';
}

/**
 * Hub page configuration
 */
export interface HubPageConfig {
  /** Page title */
  title: string;

  /** Subtitle/description (2 lines max) */
  subtitle: string;

  /** Hero icon */
  icon: ReactNode;

  /** Utility type */
  utilityType: UtilityType;

  /** Available dashboard cards */
  dashboards: DashboardCard[];

  /** Theme color (Tailwind class) */
  themeColor: string;

  /** Breadcrumb path */
  breadcrumb: {
    label: string;
    href: string;
  }[];
}

/**
 * Category filter item
 */
export interface CategoryFilter {
  id: DashboardCategory;
  label: string;
  count?: number;
}
