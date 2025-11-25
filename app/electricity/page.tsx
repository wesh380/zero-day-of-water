import Link from "next/link"
import { Metadata } from "next"
import { BatteryCharging, Gauge, ShieldCheck, Wallet } from "lucide-react"

// Deployment note: Netlify publishes the prebuilt docs/ folder (see netlify.toml publish)
// after running `npm run build`, which triggers `next build` with `output: 'export'` and
// scripts/copy-next-to-docs.js to move the static export into docs/. Production is therefore
// a hybrid: the long-lived HTML dashboards in docs/ stay intact while the Next.js app router
// pages are statically exported beside them.

export const metadata: Metadata = {
  title: "داشبورد برق خراسان رضوی | WESH360",
  description:
    "مرکز داشبوردهای برق خراسان رضوی - دسترسی سریع به تحلیل پیک مصرف، کیفیت توزیع و محاسبه تعرفه در کنار داشبوردهای استاتیک موجود.",
  alternates: { canonical: "https://wesh360.ir/electricity/" },
}

const electricityDashboards = [
  {
    href: "/electricity/peak.html",
    title: "مدیریت پیک مصرف",
    description: "تحلیل پیک روزانه و ساعتی و هشدارهای مدیریت بار برای کاهش هزینه.",
    icon: <BatteryCharging className="w-6 h-6 text-amber-500" aria-hidden />, // Option A: real route that links to static HTML
  },
  {
    href: "/electricity/quality.html",
    title: "کیفیت توزیع برق",
    description: "شاخص‌های قابلیت اطمینان، آمار خاموشی و پروفایل کیفیت توزیع.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" aria-hidden />,
  },
  {
    href: "/electricity/power-tariff.html",
    title: "محاسبه تعرفه برق",
    description: "محاسبه تعرفه و تحلیل هزینه بر اساس الگوی مصرف فعلی.",
    icon: <Wallet className="w-6 h-6 text-emerald-500" aria-hidden />,
  },
]

export default function ElectricityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-slate-600" aria-label="مسیر صفحه">
            <Link href="/" className="transition-colors hover:text-amber-600">
              خانه
            </Link>
            <span aria-hidden className="text-slate-400">
              /
            </span>
            <span className="font-semibold text-slate-900">برق</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Gauge className="h-10 w-10 text-blue-600" aria-hidden />
              <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                داشبوردهای برق خراسان رضوی
              </h1>
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-700">
              این صفحه مسیریابی رسمی /electricity/ است تا خطای ۴۰۴ برطرف شود و کاربران بتوانند از همین‌جا به
              داشبوردهای استاتیک موجود برسند. لینک‌های زیر همان فایل‌های HTML موجود در docs/electricity هستند.
            </p>
            <div className="rounded-xl bg-blue-50/70 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
              مسیر فعلی با رویکرد <strong>Option A</strong> ساخته شده است: یک روت واقعی در Next.js که به داشبوردهای استاتیک
              متصل می‌شود؛ بنابراین URLهای /electricity/ و زیرصفحات HTML همچنان بدون تغییر در Netlify سرو می‌شوند.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
        {electricityDashboards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200">
                {item.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
              مشاهده داشبورد
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">راهنمای صحت‌سنجی</h3>
          <ul className="mt-3 list-disc space-y-1 pe-5 text-sm text-slate-700">
            <li>باز کردن /electricity/ باید دیگر صفحه ۴۰۴ نباشد و همین هاب را نمایش دهد.</li>
            <li>لینک‌ها به /electricity/peak.html، /electricity/quality.html و /electricity/power-tariff.html باید فعال باشند.</li>
            <li>فایل‌های HTML استاتیک در docs/electricity بدون تغییر باقی می‌مانند و توسط Netlify از publish=docs سرو می‌شوند.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
