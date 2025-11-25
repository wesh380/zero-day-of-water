import Link from "next/link"
import { Metadata } from "next"
import { Flame, Leaf, ShieldCheck } from "lucide-react"

// Routing fix: creating a real Next.js route for /gas/ prevents 404s while still linking to
// the existing static dashboards in docs/gas. This matches the hybrid deployment where
// Netlify serves docs/ (publish in netlify.toml) and the Next static export is copied there
// during `npm run build`.

export const metadata: Metadata = {
  title: "داشبورد گاز خراسان رضوی | WESH360",
  description:
    "هاب رسمی داشبوردهای گاز خراسان رضوی با دسترسی مستقیم به صفحات استاتیک مصرف انرژی و شدت کربن.",
  alternates: { canonical: "https://wesh360.ir/gas/" },
}

const gasDashboards = [
  {
    href: "/gas/energy.html",
    title: "مصرف و مدیریت گاز",
    description: "پایش مصرف گاز طبیعی و روندهای بهینه‌سازی برای مشترکین استان.",
    icon: <Flame className="w-6 h-6 text-orange-500" aria-hidden />, // Option A hub pointing to static HTML
  },
  {
    href: "/gas/fuel-carbon.html",
    title: "سوخت و شدت کربن",
    description: "محاسبه شدت کربن سوخت‌ها و گزارش اثرات زیست‌محیطی.",
    icon: <Leaf className="w-6 h-6 text-emerald-500" aria-hidden />,
  },
]

export default function GasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-100 text-slate-900">
      <section className="border-b border-emerald-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-slate-600" aria-label="مسیر صفحه">
            <Link href="/" className="transition-colors hover:text-emerald-600">
              خانه
            </Link>
            <span aria-hidden className="text-slate-400">/</span>
            <span className="font-semibold text-slate-900">گاز</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-emerald-600" aria-hidden />
              <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">هاب داشبوردهای گاز</h1>
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-700">
              برای جلوگیری از خطای ۴۰۴، مسیر /gas/ اکنون یک صفحه استاتیک در Next.js است که کاربران را به داشبوردهای استاتیک
              موجود در docs/gas متصل می‌کند.
            </p>
            <div className="rounded-xl bg-emerald-50/80 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
              لینک‌ها زیر همچنان به فایل‌های HTML فعلی اشاره می‌کنند تا فرآیند انتشار Netlify (publish=docs) تغییر نکند و
              صفحه‌های energy.html و fuel-carbon.html بدون وقفه کار کنند.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
        {gasDashboards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100">
                {item.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              مشاهده داشبورد
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">راهنمای صحت‌سنجی</h3>
          <ul className="mt-3 list-disc space-y-1 pe-5 text-sm text-slate-700">
            <li>/gas/ باید بدون خطا لود شود و کارت‌های زیر را نمایش دهد.</li>
            <li>لینک‌های /gas/energy.html و /gas/fuel-carbon.html باید مانند قبل در دسترس باشند.</li>
            <li>سایت همچنان از docs/ سرو می‌شود و فایل‌های استاتیک حفظ شده‌اند.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
