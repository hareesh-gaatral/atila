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
  const buttonText = data?.buttonText || heroContent.buttonText;
  const buttonLink = data?.buttonLink || heroContent.buttonLink;
  const button2Text = data?.button2Text || heroContent.button2Text;
  const button2Link = data?.button2Link || heroContent.button2Link;

  return (
    <section className="relative min-h-[64vh] flex items-center bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#080e1e] dark:via-[#0c1830] dark:to-[#080e1e] overflow-hidden pt-20 pb-12 transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-10 w-[420px] h-[420px] bg-gradient-to-br from-teal-400/20 to-cyan-500/10 dark:from-teal-500/15 dark:to-cyan-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-10 w-[360px] h-[360px] bg-gradient-to-tr from-[#1e3a5f]/15 to-teal-400/15 dark:from-teal-600/10 dark:to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.06]" />
      </div>

      {imageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/25 dark:border-teal-400/25 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm shadow-xs mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              {subtitle}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5 text-slate-900 dark:text-white">
              <span>{heading.brand}</span>
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 dark:from-teal-400 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent">
                {heading.highlight}
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-100">{heading.subtext}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-7 leading-relaxed max-w-xl">
              {highlightText ? (
                paragraph.text.split(highlightText).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="font-semibold text-slate-900 dark:text-teal-400">{highlightText}</span>
                    )}
                  </span>
                ))
              ) : (
                paragraph.text
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href={buttonLink}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {buttonText}
              </Link>
              <Link
                href={button2Link}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold px-7 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-teal-500/50 dark:hover:border-teal-400/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-xs"
              >
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {button2Text}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#111c38] p-2 hover:border-teal-500/40 transition-all duration-500 group">
              <div className="relative rounded-xl overflow-hidden h-[340px] bg-slate-100 dark:bg-slate-900">
                <img
                  src={displayImage}
                  alt={displayImageAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">ERP Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
