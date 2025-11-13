import type React from "react"
import type { Metadata } from "next"

import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "WESH360 | مدیریت هوشمند آب، برق و گاز خراسان رضوی - داشبورد تحلیلی و پایش مصرف",
  description:
    "داشبورد مدیریت هوشمند آب، برق و گاز خراسان رضوی | پایش لحظه‌ای، تحلیل مصرف، ماشین‌حساب‌های تخصصی و راهکارهای بهینه‌سازی انرژی برای مشهد و استان",
  generator: "v0.app",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/img/logo/wesh360.svg" />
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/assets/img/logo/icons/icon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/logo/icons/icon-180.png" />
        <meta name="theme-color" content="#0ea5e9" />
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
