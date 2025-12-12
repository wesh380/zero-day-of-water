import { Metadata } from "next"

import SolarGuideContent from "./SolarGuideContent"

export const metadata: Metadata = {
  title: "راهنمای ظرفیت‌های نیروگاه خورشیدی | WESH360",
  description:
    "نمایش ساخت‌یافته ظرفیت‌های رایج نیروگاه خورشیدی و هدایت به سامانه مهرسان ساتبا برای ادامه مسیر رسمی.",
  alternates: { canonical: "https://wesh360.ir/solar/" },
}

export default function SolarGuidePage() {
  return <SolarGuideContent />
}
