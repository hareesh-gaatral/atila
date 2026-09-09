import featuresContent from '@/data/json/features.json';

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
    <section className="py-12 bg-white dark:bg-[#0f172a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          {subtitle && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{subtitle}</p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
          {content && (
            <p className="text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto">{content}</p>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center hover:bg-navy dark:hover:bg-teal-500 transition-all duration-300 group border border-slate-200 dark:border-slate-700">
              {item.icon && (
                <div className="w-14 h-14 bg-teal-600/10 dark:bg-teal-400/20 group-hover:bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 transition">
                  <span className="text-2xl group-hover:text-white transition">{item.icon}</span>
                </div>
              )}
              <h3 className="font-bold text-navy dark:text-slate-50 group-hover:text-white transition mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 group-hover:text-white/80 text-sm transition">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
