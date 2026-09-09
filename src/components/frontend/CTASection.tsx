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
    <section className="py-12 bg-navy dark:bg-[#0f172a] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {subtitle && (
          <p className="text-teal-400 text-sm font-semibold mb-4 uppercase tracking-wider">{subtitle}</p>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {title}
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          {content}
        </p>
        {buttonText && (
          <a href={buttonLink} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg">
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
