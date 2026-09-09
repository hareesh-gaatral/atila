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
  
    <section id="about" className="pt-24 pb-8 bg-white dark:bg-[#0f172a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 h-[350px] hover:shadow-2xl hover:border-teal-600/50 dark:hover:border-teal-400/50 transition-all duration-500 group cursor-pointer">
            {images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`ATILA ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:brightness-110 ${
                  i === current ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              />
            ))}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-15 pointer-events-none" />
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-400 hover:scale-125 ${
                    i === current ? 'bg-teal-500 w-7 shadow-lg shadow-teal-500/50' : 'bg-white/60 hover:bg-white w-2.5'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {firstParagraph}
            </p>
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
                    {item.icon && (
                      <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{item.icon}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-navy dark:text-slate-50 mb-1 text-lg">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
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
