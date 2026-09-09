'use client';

import Link from 'next/link';
import heroContent from '@/data/json/hero.json';

interface HeroSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
    button2Text?: string;
    button2Link?: string;
    imageUrl?: string;
    displayImage?: string;
    displayImageAlt?: string;
    heading?: { brand?: string; highlight?: string; subtext?: string };
    paragraph?: { text?: string; highlight?: string };
    stats?: Array<{ value?: string; label?: string }>;
  };
}

export default function HeroSection({ data }: HeroSectionProps) {
  const subtitle = data?.subtitle || heroContent.subtitle;
  const imageUrl = data?.imageUrl || heroContent.imageUrl;
  const displayImage = data?.displayImage || heroContent.displayImage;
  const displayImageAlt = data?.displayImageAlt || heroContent.displayImageAlt;
  const heading = { ...heroContent.heading, ...data?.heading };
  const paragraph = { ...heroContent.paragraph, ...data?.paragraph };
  const highlightText =
    paragraph.highlight && paragraph.text.includes(paragraph.highlight) ? paragraph.highlight : '';
  const stats = data?.stats?.length ? data.stats : heroContent.stats;
  const buttonText = data?.buttonText || heroContent.buttonText;
  const buttonLink = data?.buttonLink || heroContent.buttonLink;
  const button2Text = data?.button2Text || heroContent.button2Text;
  const button2Link = data?.button2Link || heroContent.button2Link;

  return (
    <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] overflow-hidden pt-16 transition-colors">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#1e3a5f] dark:bg-teal-500 opacity-[0.07] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-teal-400 opacity-[0.07] rounded-full blur-3xl"></div>
      </div>

      {imageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6">
              <span className="bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium">
                {subtitle}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-navy dark:text-slate-50">{heading.brand}</span>
              <span className="gradient-text">{heading.highlight}</span>
              <br />
              <span className="text-navy dark:text-slate-50">{heading.subtext}</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl">
              {highlightText ? (
                paragraph.text.split(highlightText).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="font-semibold text-navy dark:text-teal-400">{highlightText}</span>
                    )}
                  </span>
                ))
              ) : (
                paragraph.text
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={buttonLink} className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-3.5 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {buttonText}
              </Link>
              <Link href={button2Link} className="inline-flex items-center justify-center gap-2 bg-white dark:bg-transparent text-navy dark:text-slate-200 font-semibold px-8 py-3.5 rounded-lg transition-all border-2 border-navy dark:border-slate-400 hover:bg-navy hover:text-white dark:hover:bg-white/10 dark:hover:border-slate-200 dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {button2Text}
              </Link>
            </div>

            <div className="mt-12 flex gap-10">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-navy dark:text-teal-400">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative w-full h-[350px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1e293b] dark:to-[#334155] transition-colors border border-slate-200 dark:border-slate-700">
              <img src={displayImage} alt={displayImageAlt} className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
