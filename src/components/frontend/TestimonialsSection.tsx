'use client';

import testimonialsContent from '@/data/json/testimonials.json';

interface Testimonial {
  title?: string;
  description?: string;
  imageUrl?: string;
  designation?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    items?: Testimonial[];
  };
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const items: Testimonial[] = data?.items && data.items.length > 0 ? data.items : (testimonialsContent.items as Testimonial[]);
  const title = data?.title || testimonialsContent.title;
  const subtitle = data?.subtitle || testimonialsContent.subtitle;

  return (
    <section id="testimonials" className="py-16 bg-white dark:bg-[#0f172a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{subtitle}</p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= (item.rating || 5) ? 'text-teal-500 dark:text-teal-400' : 'text-slate-200 dark:text-slate-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">“{item.description}”</p>

              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy dark:bg-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(item.title || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-navy dark:text-slate-50">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.designation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
