'use client';

import Link from 'next/link';
import { getServiceLink, getServiceByTitle } from '@/data/services';
import servicesContent from '@/data/json/services.json';
import ScrollReveal from '@/components/frontend/ScrollReveal';

interface ServiceItem {
  title?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  link?: string;
  id?: string;
}

interface ServicesSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    viewDetailsText?: string;
    items?: Array<ServiceItem>;
  };
  services?: Array<any>;
}

export default function ServicesSection({ data, services }: ServicesSectionProps) {
  const title = data?.title || servicesContent.title;
  const subtitle = data?.subtitle || servicesContent.subtitle;
  const viewDetailsText = data?.viewDetailsText || servicesContent.viewDetailsText;

  const cards: Array<{ id: string; title: string; description: string; icon?: string; link?: string }> = [];

  if (services && services.length > 0) {
    for (const s of services) {
      if (s.isPublished === false || s.isArchived === true) continue;
      cards.push({
        id: s.slug || s._id,
        title: s.title,
        description: s.shortDescription || s.description || s.tagline || '',
        icon: s.icon,
        link: `/services/${s.slug}`,
      });
    }
  } else {
    const items: ServiceItem[] = data?.items && data.items.length > 0 ? data.items : (servicesContent.items as ServiceItem[]);
    for (const item of items) {
      const link = getServiceLink(item.title) || item.link;
      const service = getServiceByTitle(item.title);
      cards.push({
        id: service?.slug || item.title?.toLowerCase().replace(/\s+/g, '-') || String(Math.random()),
        title: item.title || '',
        description: item.description || '',
        icon: item.icon,
        link,
      });
    }
  }

  return (
    <section id="services" className="py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#080e1e] dark:via-[#0c1830] dark:to-[#080e1e] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {subtitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
              {subtitle}
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5 items-stretch">
          {cards.map((card, idx) => (
            <ScrollReveal key={card.id} delay={idx * 60} className="h-full">
              {card.link ? (
                <Link
                  href={card.link}
                  className="bg-white dark:bg-[#111c38] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-[#183457]/15 hover:-translate-y-1.5 transition-all duration-300 group h-full flex flex-col justify-between hover:bg-gradient-to-b hover:from-[#183457] hover:to-[#0f243e] dark:hover:from-[#142d4d] dark:hover:to-[#0c1c30] hover:border-teal-400/60"
                >
                  <div>
                    {card.icon && (
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500/10 to-teal-500/20 dark:from-teal-400/15 dark:to-teal-400/5 border border-teal-500/25 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-white/15 group-hover:border-white/30 transition-all duration-300 shadow-xs">
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-200/90 leading-relaxed mb-4 transition-colors">
                      {card.description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 group-hover:text-teal-300 font-semibold text-xs group-hover:gap-2.5 transition-all duration-200 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800/80 group-hover:border-white/15">
                    {viewDetailsText}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <div className="bg-white dark:bg-[#111c38] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-[#183457]/15 hover:-translate-y-1.5 transition-all duration-300 group h-full flex flex-col justify-between hover:bg-gradient-to-b hover:from-[#183457] hover:to-[#0f243e] dark:hover:from-[#142d4d] dark:hover:to-[#0c1c30] hover:border-teal-400/60">
                  <div>
                    {card.icon && (
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500/10 to-teal-500/20 dark:from-teal-400/15 dark:to-teal-400/5 border border-teal-500/25 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-white/15 group-hover:border-white/30 transition-all duration-300 shadow-xs">
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-200/90 leading-relaxed transition-colors">
                      {card.description}
                    </p>
                  </div>
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
