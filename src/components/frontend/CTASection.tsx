import ctaContent from '@/data/json/cta.json';

interface CTASectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

export default function CTASection({ data }: CTASectionProps) {
  const title = data?.title || ctaContent.title;
  const subtitle = data?.subtitle || ctaContent.subtitle;
  const content = data?.content || ctaContent.content;
  const buttonText = data?.buttonText || ctaContent.buttonText;
  const buttonLink = data?.buttonLink || ctaContent.buttonLink;

  return (
    <section className="relative py-12 bg-gradient-to-br from-navy via-[#16324f] to-[#1a3b5c] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-colors overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {subtitle && (
          <p className="text-teal-400 text-sm font-semibold mb-3 uppercase tracking-wider">{subtitle}</p>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        {content && (
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            {content}
          </p>
        )}
        {buttonText && (
          <a href={buttonLink} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-3.5 rounded-lg transition-all transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl shadow-lg">
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
