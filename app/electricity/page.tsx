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
    href: "/electricity/quality.html",
    title: "کیفیت شبکه و توزیع برق",
    description: "نمایش شاخص‌های قابلیت اطمینان، آمار خاموشی‌ها و پروفایل کیفیت توزیع برق در استان.",
    cta: "ورود به داشبورد کیفیت برق",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" aria-hidden />,
  },
  {
    href: "/electricity/peak.html",
    title: "پایش و مدیریت پیک مصرف",
    description:
      "تحلیل پیک روزانه و ساعتی، شناسایی دوره‌های اوج بار و ارائه‌ی پیشنهادهای مدیریت بار برای کاهش هزینه و ریسک خاموشی.",
    cta: "ورود به داشبورد پیک مصرف",
    icon: <BatteryCharging className="w-6 h-6 text-amber-500" aria-hidden />,
  },
  {
    href: "/electricity/power-tariff.html",
    title: "محاسبه و شبیه‌سازی تعرفه برق",
    description:
      "محاسبه مبلغ قبض و شبیه‌سازی سناریوهای مختلف تعرفه بر اساس الگوی مصرف فعلی برای تصمیم‌گیری بهتر.",
    cta: "ورود به ابزار محاسبه تعرفه",
    icon: <Wallet className="w-6 h-6 text-emerald-500" aria-hidden />,
  },
]

export default function ElectricityPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-slate-600" aria-label="مسیر صفحه">
            <Link href="/" className="transition-colors hover:text-amber-600">
              خانه
            </Link>
            <span aria-hidden className="text-slate-600">
              /
            </span>
            <span className="font-semibold text-slate-900">برق</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Gauge className="h-10 w-10 text-blue-600" aria-hidden />
              <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                هاب داشبوردهای برق خراسان رضوی
              </h1>
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-700">
              از این صفحه می‌توانید به همه‌ی داشبوردهای تحلیلی برق استان دسترسی پیدا کنید؛ از کیفیت شبکه و خاموشی‌ها تا
              مدیریت پیک مصرف و محاسبه‌ی تعرفه.
            </p>
            <div className="rounded-xl bg-blue-50/70 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
              برای شروع، یکی از کارت‌های زیر را انتخاب کنید. هر کارت شما را به یک داشبورد تعاملی جداگانه می‌برد.
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
              {item.cta}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">راهنمای دسترسی و نسخه‌ی ساده داشبوردها</h3>
          <ul className="mt-3 list-disc space-y-1 pe-5 text-sm text-slate-700">
            <li>اگر در بارگذاری داشبوردها مشکل داشتید، می‌توانید نسخه‌ی ساده‌ی HTML را هم ببینید.</li>
            <li>
              <Link href="/electricity/quality.html" className="text-amber-600 hover:text-amber-700">
                نسخه ساده کیفیت برق
              </Link>
            </li>
            <li>
              <Link href="/electricity/peak.html" className="text-amber-600 hover:text-amber-700">
                نسخه ساده پیک مصرف برق
              </Link>
            </li>
            <li>
              <Link href="/electricity/power-tariff.html" className="text-amber-600 hover:text-amber-700">
                نسخه ساده محاسبه تعرفه برق
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
