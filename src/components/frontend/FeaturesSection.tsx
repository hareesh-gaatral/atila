import featuresContent from '@/data/json/features.json';
import ScrollReveal from '@/components/frontend/ScrollReveal';

interface FeaturesSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    content?: string;
    items?: Array<{ title?: string; description?: string; icon?: string }>;
  };
}

export default function FeaturesSection({ data }: FeaturesSectionProps) {
  const title = data?.title || featuresContent.title;
  const subtitle = data?.subtitle || featuresContent.subtitle;
  const content = data?.content || featuresContent.content;
  const items = data?.items && data.items.length > 0 ? data.items : featuresContent.items;

  return (
    <section className="py-12 bg-white dark:bg-[#0b1329] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {subtitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
              {subtitle}
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {content && (
            <p className="text-slate-600 dark:text-slate-300 mt-2.5 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{content}</p>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="bg-slate-50/70 dark:bg-[#111c38] rounded-2xl p-6 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-xl hover:shadow-[#183457]/15 hover:-translate-y-1.5 transition-all duration-300 group h-full flex flex-col items-center hover:bg-gradient-to-b hover:from-[#183457] hover:to-[#0f243e] dark:hover:from-[#142d4d] dark:hover:to-[#0c1c30] hover:border-teal-400/60 cursor-default">
                {item.icon && (
                  <div className="w-14 h-14 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/15 group-hover:border-white/30 transition-all duration-300 shadow-sm">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                )}
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-200/90 text-xs sm:text-sm leading-relaxed transition-colors">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
