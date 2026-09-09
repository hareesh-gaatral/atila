import TestimonialsSection from '@/components/frontend/TestimonialsSection';
import FAQSection from '@/components/frontend/FAQSection';
import dynamicConfig from '@/data/json/dynamic.json';

interface DynamicSectionProps {
  data: {
    sectionType: string;
    title?: string;
    subtitle?: string;
    content?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    items?: Array<{ title?: string; description?: string; imageUrl?: string; icon?: string; link?: string }>;
  };
}

// Resolve which renderer handles a given section type from the JSON registry.
const rendererFor = (sectionType: string): string => {
  const entry = dynamicConfig.registry.find((r) => r.sectionType === sectionType);
  return entry?.component || 'default';
};

export default function DynamicSection({ data }: DynamicSectionProps) {
  const { sectionType } = data;
  const renderer = rendererFor(sectionType);

  if (renderer === 'TestimonialsSection') {
    return <TestimonialsSection data={data} />;
  }

  if (renderer === 'FAQSection') {
    return <FAQSection data={data} />;
  }

  if (renderer === 'hero') {
    return (
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] pt-16 transition-colors">
        {data.imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5" style={{ backgroundImage: `url(${data.imageUrl})` }} />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          {data.subtitle && <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-4 uppercase tracking-wider">{data.subtitle}</p>}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-navy dark:text-slate-50">{data.title}</h1>
          <p className="text-xl mb-10 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">{data.content}</p>
          {data.buttonText && (
            <a href={data.buttonLink || '#'} className="inline-block bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-lg transition">{data.buttonText}</a>
          )}
        </div>
      </section>
    );
  }

  if (renderer === 'text') {
    return (
      <section className="py-20 bg-white dark:bg-[#0f172a] transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {data.subtitle && <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase">{data.subtitle}</p>}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50 mb-6">{data.title}</h2>
          {data.imageUrl && <img src={data.imageUrl} alt={data.title} className="rounded-xl shadow-card w-full mb-8" />}
          {data.content && <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-line">{data.content}</p>}
        </div>
      </section>
    );
  }

  if (renderer === 'banner') {
    return (
      <section className="relative py-24 bg-navy dark:bg-[#1e293b] transition-colors">
        {data.imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${data.imageUrl})` }} />}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">{data.title}</h2>
          <p className="text-xl text-white/80">{data.content}</p>
        </div>
      </section>
    );
  }

  if (renderer === 'cards') {
    return (
      <section className="py-20 bg-slate-50 dark:bg-[#0f172a] transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            {data.subtitle && <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{data.subtitle}</p>}
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{data.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(data.items || []).map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-card-hover transition border border-slate-200 dark:border-slate-700">
                {item.icon && <span className="text-4xl block mb-4">{item.icon}</span>}
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-14 h-14 mb-4 rounded-xl object-cover" />}
                <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-[#0f172a] transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-navy dark:text-slate-50 mb-4">{data.title || dynamicConfig.defaultContent.title}</h2>
        <p className="text-slate-600 dark:text-slate-300">{data.content || dynamicConfig.defaultContent.content}</p>
      </div>
    </section>
  );
}
