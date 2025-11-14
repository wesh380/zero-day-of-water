import type React from "react"
import type { Metadata } from "next"

import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "WESH360 | مدیریت هوشمند آب، برق و گاز خراسان رضوی - داشبورد تحلیلی و پایش مصرف",
  description:
    "پلتفرم رسمی مدیریت آب و انرژی خراسان رضوی - دسترسی به آمار و گزارش‌های تخصصی، داشبورد تحلیلی، پایش لحظه‌ای مصرف و ماشین‌حساب‌های هوشمند انرژی",
  keywords: [
    "آب خراسان رضوی",
    "انرژی خراسان رضوی",
    "برق مشهد",
    "گاز مشهد",
    "داشبورد انرژی",
    "مدیریت مصرف آب",
    "صرفه‌جویی انرژی",
    "WESH360",
    "خانه هم‌افزایی انرژی و آب",
    "پایش مصرف",
    "تحلیل داده انرژی",
    "حکمرانی داده"
  ],
  authors: [{ name: "خانه هم‌افزایی انرژی و آب خراسان رضوی" }],
  creator: "WESH360",
  publisher: "خانه هم‌افزایی انرژی و آب خراسان رضوی",
  formatDetection: {
    telephone: true,
    email: true,
  },
  generator: "v0.app",
  metadataBase: new URL("https://wesh360.ir"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://wesh360.ir/",
    title: "WESH360 - مدیریت هوشمند آب و انرژی خراسان رضوی",
    description: "داشبوردهای تعاملی برای پایش و مدیریت آب، برق و گاز در خراسان رضوی",
    images: [
      {
        url: "https://wesh360.ir/assets/img/hero/social-share-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "WESH360 - داشبورد مدیریت انرژی و آب",
      },
    ],
    locale: "fa_IR",
    siteName: "WESH360",
  },
  twitter: {
    card: "summary_large_image",
    title: "WESH360 - مدیریت هوشمند آب و انرژی",
    description: "داشبوردهای تعاملی برای پایش و مدیریت آب، برق و گاز",
    images: ["https://wesh360.ir/assets/img/hero/social-share-1200x630.jpg"],
  },
  verification: {
    google: "google-site-verification-code", // به‌روزرسانی شود
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentOrganization",
        "@id": "https://wesh360.ir/#organization",
        name: "خانه هم‌افزایی انرژی و آب خراسان رضوی",
        alternateName: "WESH360",
        url: "https://wesh360.ir",
        logo: {
          "@type": "ImageObject",
          url: "https://wesh360.ir/assets/img/logo/wesh360.svg",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+98-51-38434143",
          contactType: "customer service",
          areaServed: "IR-30",
          availableLanguage: ["fa"],
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "خراسان رضوی",
          containedIn: {
            "@type": "Country",
            name: "ایران",
          },
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://wesh360.ir/#website",
        url: "https://wesh360.ir",
        name: "WESH360 - مدیریت هوشمند آب و انرژی",
        description: "پلتفرم رسمی مدیریت آب و انرژی خراسان رضوی",
        publisher: {
          "@id": "https://wesh360.ir/#organization",
        },
        inLanguage: "fa-IR",
      },
      {
        "@type": "WebPage",
        "@id": "https://wesh360.ir/#webpage",
        url: "https://wesh360.ir",
        name: "WESH360 | مدیریت هوشمند آب و انرژی خراسان رضوی",
        isPartOf: {
          "@id": "https://wesh360.ir/#website",
        },
        about: {
          "@id": "https://wesh360.ir/#organization",
        },
        description: "پلتفرم رسمی مدیریت آب و انرژی خراسان رضوی - دسترسی به آمار و گزارش‌های تخصصی",
        inLanguage: "fa-IR",
      },
      {
        "@type": "Service",
        "@id": "https://wesh360.ir/#service",
        serviceType: "Energy and Water Management Platform",
        provider: {
          "@id": "https://wesh360.ir/#organization",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "خراسان رضوی",
        },
        audience: {
          "@type": "Audience",
          audienceType: "residents and businesses in Razavi Khorasan",
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/img/logo/wesh360.svg" />
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/assets/img/logo/icons/icon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/logo/icons/icon-180.png" />
        <meta name="theme-color" content="#0ea5e9" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <Suspense fallback={null}>{children}</Suspense>
        {/* Statsfa Website Analytics Start */}
        <Script
          data-host="https://statsfa.com"
          data-dnt="true"
          src="https://statsfa.com/js/script.js"
          id="ZwSg9rf6GA"
          strategy="afterInteractive"
        />
        {/* Statsfa Website Analytics End */}
      </body>
    </html>
  )
}
