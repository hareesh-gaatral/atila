'use client';

import { useState, useEffect } from 'react';
import aboutContent from '@/data/json/about.json';

interface AboutSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    content?: string;
    imageUrl?: string;
    images?: string[];
    paragraphs?: string[];
    items?: Array<{ title?: string; description?: string; imageUrl?: string; icon?: string }>;
  };
}

export default function AboutSection({ data }: AboutSectionProps) {
  const images = data?.images?.length ? data.images : aboutContent.images;
  const title = data?.title || aboutContent.title;
  const firstParagraph = data?.content || aboutContent.content;
  const paragraphs = data?.paragraphs?.length ? data.paragraphs : aboutContent.paragraphs;
  const items = data?.items && data.items.length > 0 ? data.items : aboutContent.items;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section id="about" className="py-12 scroll-mt-24 bg-slate-50/50 dark:bg-[#0b1329] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 dark:border-slate-800 h-[360px] hover:shadow-2xl hover:border-teal-500/50 transition-all duration-500 group">
            {images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`ATILA ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
                  i === current ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-teal-400 w-6 shadow-sm' : 'bg-white/60 hover:bg-white w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">
              {firstParagraph}
            </p>
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">
                {paragraph}
              </p>
            ))}
            {items.length > 0 && (
              <div className="space-y-3 mt-5">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-3.5 bg-white dark:bg-[#111c38] rounded-xl border border-slate-200/80 dark:border-slate-800/90 shadow-xs hover:border-teal-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {item.icon && (
                      <div className="w-10 h-10 bg-teal-500/10 dark:bg-teal-400/20 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                        <span>{item.icon}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
