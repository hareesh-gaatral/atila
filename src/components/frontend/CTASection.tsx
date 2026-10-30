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
    <section className="relative py-12 bg-gradient-to-r from-[#0c1f38] via-[#143254] to-[#0c1f38] border-y border-teal-500/20 transition-colors overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {subtitle && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/15 border border-teal-400/25 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
            {subtitle}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
          {title}
        </h2>
        {content && (
          <p className="text-base sm:text-lg text-slate-200/90 mb-6 max-w-2xl mx-auto leading-relaxed">
            {content}
          </p>
        )}
        {buttonText && (
          <a
            href={buttonLink}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {buttonText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
