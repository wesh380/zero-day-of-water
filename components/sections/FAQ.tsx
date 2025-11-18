'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'WESH360 چیست و چه خدماتی ارائه می‌دهد؟',
    answer: 'WESH360 پلتفرم رسمی مدیریت هوشمند آب و انرژی خراسان رضوی است که داشبوردهای تحلیلی، ماشین‌حساب‌های تخصصی و گزارش‌های آماری در حوزه آب، برق، گاز و فرآورده‌های نفتی ارائه می‌دهد.',
  },
  {
    question: 'چگونه می‌توانم به داده‌های پلتفرم دسترسی پیدا کنم؟',
    answer: 'با مراجعه به بخش داشبوردها می‌توانید به آمار و گزارش‌های تخصصی در حوزه‌های مختلف انرژی و آب دسترسی داشته باشید. برای داده‌های پژوهشی نیز می‌توانید از بخش درخواست داده پژوهشی استفاده کنید.',
  },
  {
    question: 'آیا استفاده از این پلتفرم رایگان است؟',
    answer: 'بله، دسترسی به داشبوردها و ماشین‌حساب‌های عمومی کاملاً رایگان است. برای دسترسی به داده‌های تخصصی پژوهشی می‌توانید درخواست خود را ثبت نمایید.',
  },
  {
    question: 'داده‌های پلتفرم از چه منابعی جمع‌آوری می‌شوند؟',
    answer: 'تمام داده‌ها از منابع رسمی سازمان‌های آب و انرژی استان خراسان رضوی با رعایت اصول حکمرانی داده و امنیت اطلاعات جمع‌آوری و پردازش می‌شوند.',
  },
  {
    question: 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟',
    answer: 'می‌توانید از طریق شماره تلفن 051-38434143، کانال تلگرام @wesh360 یا فرم تماس با ما در ارتباط باشید. تیم پشتیبانی در روزهای کاری پاسخگوی شما خواهد بود.',
  },
  {
    question: 'آیا امکان دریافت گزارش سفارشی وجود دارد؟',
    answer: 'بله، برای محققان و سازمان‌ها امکان درخواست گزارش‌های سفارشی و داده‌های تخصصی از طریق بخش درخواست داده پژوهشی فراهم است.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // JSON-LD for FAQ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section id="faq" className="relative z-10 py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              سوالات متداول
            </h2>
            <p className="text-gray-600 text-lg">
              پاسخ سوالات رایج درباره پلتفرم WESH360
            </p>
          </div>

          <div className="space-y-4" role="list" aria-label="لیست سوالات متداول">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
                role="listitem"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-right hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-bold text-gray-900 flex-1 pl-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <motion.div
                  id={`faq-answer-${index}`}
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              سوال دیگری دارید؟
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              تماس با پشتیبانی
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
