'use client';

import { useState } from 'react';
import faqContent from '@/data/json/faq.json';

interface FAQItem {
  title?: string;
  description?: string;
}

interface FAQSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    items?: FAQItem[];
  };
}

export default function FAQSection({ data }: FAQSectionProps) {
  const items = data?.items && data.items.length > 0 ? data.items : faqContent.items;
  const title = data?.title || faqContent.title;
  const subtitle = data?.subtitle || faqContent.subtitle;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="py-16 bg-slate-50 dark:bg-[#111827] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{subtitle}</p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-teal-500/40 dark:border-teal-400/40 shadow-card'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-navy dark:text-slate-50">{item.title}</span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-teal-600 dark:text-teal-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
