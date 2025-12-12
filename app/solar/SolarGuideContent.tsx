"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, ChevronLeft, Info, MapPinned, Sparkles, TrendingUp } from "lucide-react"

const capacityGroups = [
  {
    title: "نیروگاه‌های کوچک",
    color: "from-amber-50 via-orange-50 to-amber-100",
    border: "border-amber-200",
    items: [
      {
        capacity: "۵ کیلووات",
        summary: {
          investment: "۱۸۰ میلیون تومان",
          annualIncome: "حدود ۴۲ میلیون تومان",
          space: "۴۰ تا ۵۰ مترمربع",
        },
        details: {
          permitTime: "حدود دو هفته",
          executionTime: "حدود سه روز",
          contract: "۲۰ ساله (ماده ۶۱)",
          note: "مناسب پشت‌بام منازل، مغازه‌ها و فضاهای خیلی محدود",
        },
      },
      {
        capacity: "۲۰ کیلووات",
        summary: {
          investment: "۶۵۰ تا ۷۵۰ میلیون تومان",
          annualIncome: "حدود ۱۷۰ میلیون تومان",
          space: "حدود ۲۰۰ مترمربع",
        },
        details: {
          permitTime: "حدود دو هفته",
          executionTime: "حدود یک هفته",
          contract: "۲۰ ساله (ماده ۶۱)",
          note: "مناسب کارگاه‌ها، سوله‌های کوچک و زمین‌های شهری",
        },
      },
      {
        capacity: "۵۰ کیلووات",
        summary: {
          investment: "۱٫۵ میلیارد تومان",
          annualIncome: "حدود ۳۵۰ میلیون تومان",
          space: "حدود ۵۰۰ مترمربع",
        },
        details: {
          permitTime: "حدود یک ماه",
          executionTime: "حدود دو هفته",
          contract: "۲۰ ساله (ماده ۶۱)",
          note: "مناسب واحدهای تجاری و زمین‌های کوچک شخصی",
        },
      },
    ],
  },
  {
    title: "نیروگاه‌های متوسط",
    color: "from-emerald-50 via-green-50 to-emerald-100",
    border: "border-emerald-200",
    items: [
      {
        capacity: "۱۰۰ کیلووات",
        summary: {
          investment: "۳ میلیارد تومان",
          annualIncome: "۷۰۰ تا ۸۰۰ میلیون تومان",
          space: "حدود ۱۲۰۰ مترمربع",
        },
        details: {
          permitTime: "حدود یک ماه",
          executionTime: "حدود یک ماه",
          contract: "۲۰ ساله (ماده ۶۱)",
          note: "مناسب واحدهای صنعتی کوچک و زمین‌های نیمه‌صنعتی",
        },
      },
      {
        capacity: "۲۰۰ کیلووات",
        summary: {
          investment: "۶ میلیارد تومان",
          annualIncome: "۱٫۴ تا ۱٫۶ میلیارد تومان",
          space: "حدود ۲۵۰۰ مترمربع",
        },
        details: {
          permitTime: "حدود یک ماه",
          executionTime: "حدود یک ماه",
          contract: "۲۰ ساله (ماده ۶۱)",
          note: "مناسب واحدهای صنعتی، کشاورزی و شهرک‌ها",
        },
      },
      {
        capacity: "۵۰۰ کیلووات",
        summary: {
          investment: "۲۱۰ هزار دلار",
          annualIncome: "۳٫۵ تا ۴ میلیارد تومان",
          space: "حدود ۷۰۰۰ مترمربع",
        },
        details: {
          permitTime: "حدود چهار ماه",
          executionTime: "حدود سه ماه",
          contract: "۲۰ ساله (ماده ۶۱ – تابلو سبز)",
          note: "مناسب زمین‌های بزرگ‌تر و پروژه‌های نیمه‌سرمایه‌گذاری",
        },
      },
    ],
  },
  {
    title: "نیروگاه‌های بزرگ",
    color: "from-blue-50 via-indigo-50 to-blue-100",
    border: "border-blue-200",
    items: [
      {
        capacity: "۱ مگاوات",
        summary: {
          investment: "۴۱۰ هزار دلار",
          annualIncome: "۷ تا ۸٫۵ میلیارد تومان",
          space: "حدود ۱٫۵ هکتار",
        },
        details: {
          permitTime: "حدود چهار ماه",
          executionTime: "حدود چهار ماه",
          contract: "۲۰ ساله (ماده ۶۱ – تابلو سبز)",
          note: "شروع پروژه‌های جدی سرمایه‌گذاری خورشیدی",
        },
      },
      {
        capacity: "۵ مگاوات",
        summary: {
          investment: "۲ میلیون دلار",
          annualIncome: "۳۰ تا ۴۲ میلیارد تومان",
          space: "حدود ۷٫۵ هکتار",
        },
        details: {
          permitTime: "حدود چهار ماه",
          executionTime: "حدود شش ماه",
          contract: "۲۰ ساله (ماده ۶۱ – تابلو سبز)",
          note: "پروژه سرمایه‌گذاری با نیاز به زمین و پیگیری ساختاریافته",
        },
      },
      {
        capacity: "۱۰ مگاوات",
        summary: {
          investment: "۴ میلیون دلار",
          annualIncome: "۶۰ تا ۸۵ میلیارد تومان",
          space: "حدود ۱۵ هکتار",
        },
        details: {
          permitTime: "حدود چهار ماه",
          executionTime: "حدود شش ماه",
          contract: "۲۰ ساله (ماده ۶۱ – تابلو سبز)",
          note: "پروژه بزرگ مقیاس و مناسب سرمایه‌گذاران حرفه‌ای",
        },
      },
    ],
  },
]

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-800">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function DesktopCards() {
  return (
    <div className="hidden gap-6 lg:grid">
      {capacityGroups.map((group) => (
        <section
          key={group.title}
          className={`rounded-3xl border ${group.border} bg-gradient-to-br ${group.color} p-6 shadow-sm lg:p-8`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">گروه ظرفیت</p>
              <h2 className="text-2xl font-black text-slate-900">{group.title}</h2>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700">نمای دسکتاپ</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <article
                key={item.capacity}
                className="flex h-full flex-col justify-between rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-slate-900">{item.capacity}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">اطلاعات خلاصه</span>
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>سرمایه‌گذاری</span>
                      <span className="font-bold text-amber-700">{item.summary.investment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>درآمد سالانه</span>
                      <span className="font-bold text-emerald-700">{item.summary.annualIncome}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>مساحت موردنیاز</span>
                      <span className="font-semibold text-slate-800">{item.summary.space}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50/70 p-3 text-sm text-slate-800">
                  <p className="flex items-center gap-2 text-slate-700">
                    <Info className="h-4 w-4 text-blue-600" aria-hidden />
                    جزئیات اجرای رایج
                  </p>
                  <ul className="mt-2 space-y-1 pe-5 text-slate-700">
                    <li>زمان صدور مجوز: {item.details.permitTime}</li>
                    <li>زمان اجرا: {item.details.executionTime}</li>
                    <li>نوع قرارداد: {item.details.contract}</li>
                    <li className="font-medium text-slate-900">{item.details.note}</li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function MobileSheet({
  selected,
  onClose,
}: {
  selected: (typeof capacityGroups[number]["items"])[number] | null
  onClose: () => void
}) {
  if (!selected) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-slate-900/50 backdrop-blur-sm lg:hidden" role="dialog" aria-modal>
      <button className="flex flex-1 items-start p-4 text-white/70" onClick={onClose} aria-label="بستن جزئیات">
        بستن
      </button>
      <div className="relative rounded-t-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 flex items-center gap-1 text-sm text-slate-600"
          aria-label="بازگشت"
        >
          <ChevronLeft className="h-5 w-5" />
          برگشت
        </button>
        <h3 className="text-2xl font-black text-slate-900">{selected.capacity}</h3>
        <p className="mt-3 text-sm text-slate-600">خلاصه شرایط و جزئیات اجرا</p>

        <div className="mt-4 grid gap-2">
          <DetailItem label="سرمایه‌گذاری" value={selected.summary.investment} />
          <DetailItem label="درآمد سالانه" value={selected.summary.annualIncome} />
          <DetailItem label="مساحت موردنیاز" value={selected.summary.space} />
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
          <p className="mb-2 flex items-center gap-2 text-slate-700">
            <Info className="h-4 w-4 text-blue-600" aria-hidden />
            جزئیات تکمیلی
          </p>
          <ul className="space-y-1 pe-4">
            <li>زمان صدور مجوز: {selected.details.permitTime}</li>
            <li>زمان اجرا: {selected.details.executionTime}</li>
            <li>نوع قرارداد: {selected.details.contract}</li>
            <li className="font-semibold text-slate-900">{selected.details.note}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function MobileCarousel({ onSelect }: { onSelect: (item: (typeof capacityGroups[number]["items"])[number]) => void }) {
  return (
    <div className="lg:hidden space-y-6">
      {capacityGroups.map((group) => (
        <section key={group.title} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs text-slate-500">گروه ظرفیت</p>
              <h2 className="text-lg font-black text-slate-900">{group.title}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">اسلاید افقی</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4">
            {group.items.map((item) => (
              <article
                key={item.capacity}
                className="w-72 shrink-0 snap-start rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900">{item.capacity}</h3>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">خلاصه</span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>سرمایه‌گذاری</span>
                    <span className="font-bold text-amber-700">{item.summary.investment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>درآمد سالانه</span>
                    <span className="font-bold text-emerald-700">{item.summary.annualIncome}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>مساحت موردنیاز</span>
                    <span className="font-semibold text-slate-800">{item.summary.space}</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(item)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  aria-label={`جزئیات ${item.capacity}`}
                >
                  دیدن جزئیات
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function SolarGuideContent() {
  const [selectedItem, setSelectedItem] = useState<(typeof capacityGroups[number]["items"])[number] | null>(null)

  const heroHighlights = useMemo(
    () => [
      {
        label: "بدون محاسبه یا وعده‌دهی",
        text: "فقط مسیر رسمی و اطلاعات خلاصه ظرفیت‌ها ارائه می‌شود.",
      },
      {
        label: "نمای موبایل و دسکتاپ",
        text: "کارت‌های اسلایدی برای موبایل و چیدمان شبکه‌ای برای دسکتاپ.",
      },
      {
        label: "ورود رسمی",
        text: "ادامه مراحل فقط از طریق سامانه مهرسان ساتبا انجام می‌شود.",
      },
    ],
    [],
  )

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600" aria-label="مسیر صفحه">
            <Link href="/" className="transition-colors hover:text-amber-600">
              خانه
            </Link>
            <span aria-hidden className="text-slate-400">
              /
            </span>
            <span className="font-semibold text-slate-900">راهنمای نیروگاه خورشیدی</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-amber-600" aria-hidden />
                <div>
                  <h1 className="text-3xl font-black leading-tight sm:text-4xl">اول ببین چه ظرفیتی به کارت می‌خوره</h1>
                  <p className="mt-1 text-lg text-slate-700">خلاصه شرایط رایج برای ظرفیت‌های مختلف نیروگاه خورشیدی</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-inner">
                <MapPinned className="h-5 w-5" aria-hidden />
                این صفحه فقط برای راهنمایی مسیر رسمی ساتباست.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700 shadow-sm"
                >
                  <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden />
                  <div>
                    <div className="font-bold text-slate-900">{item.label}</div>
                    <p className="leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <MobileCarousel onSelect={setSelectedItem} />
        <DesktopCards />
      </section>

      <section className="border-t border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">ادامه مسیر از اینجاست</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
              اگر یکی از این ظرفیت‌ها به شرایطت می‌خورد، ثبت درخواست و ادامه مراحل به‌صورت رسمی از طریق سامانه ساتبا انجام می‌شود.
            </p>
            <p className="text-xs text-slate-500">هیچ محاسبه یا تحلیل ریسکی در این صفحه انجام نمی‌شود.</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <a
              href="https://mehrsun.satba.gov.ir/"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              رفتن به سامانه مهرسان (ساتبا)
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <span className="text-xs text-slate-500">وارد سامانه رسمی ساتبا می‌شوید.</span>
          </div>
        </div>
      </section>

      <MobileSheet selected={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  )
}
