'use client';

import Link from 'next/link';
import { getServiceLink, getServiceByTitle } from '@/data/services';
import servicesContent from '@/data/json/services.json';

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
  /** Published DB services (server-rendered). When present they drive the cards. */
  services?: Array<any>;
}

export default function ServicesSection({ data, services }: ServicesSectionProps) {
  const title = data?.title || servicesContent.title;
  const subtitle = data?.subtitle || servicesContent.subtitle;
  const viewDetailsText = data?.viewDetailsText || servicesContent.viewDetailsText;

  // Normalize every source into the same card shape so the markup below is
  // identical regardless of whether cards come from the DB Service collection
  // (new services appear automatically), the DB home section items, or the JSON
  // default.
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
    <section id="services" className="py-12 bg-slate-50 dark:bg-[#0f172a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          {subtitle && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{subtitle}</p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id}>
              {card.link ? (
                <Link
                  href={card.link}
                  className="block bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-card-hover transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:-translate-y-1 group h-full"
                >
                  {card.icon && (
                    <div className="w-14 h-14 bg-teal-600/10 dark:bg-teal-400/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-500 dark:group-hover:bg-teal-400 transition">
                      <span className="text-2xl group-hover:text-white transition">{card.icon}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-3">{card.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{card.description}</p>
                  <div className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-sm group-hover:gap-3 transition-all">
                    {viewDetailsText}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-card-hover transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:-translate-y-1 group h-full">
                  {card.icon && (
                    <div className="w-14 h-14 bg-teal-600/10 dark:bg-teal-400/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-500 dark:group-hover:bg-teal-400 transition">
                      <span className="text-2xl group-hover:text-white transition">{card.icon}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-3">{card.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{card.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
