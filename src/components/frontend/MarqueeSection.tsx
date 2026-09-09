import marqueeContent from '@/data/json/marquee.json';

type MarqueeImage = string | { url?: string };

interface MarqueeContent {
  title?: string;
  images?: MarqueeImage[];
}

/** Normalize logos stored either as plain URL strings or { url } rows. */
function toImageUrls(images?: MarqueeImage[]): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === 'string' ? img : img?.url || ''))
    .filter(Boolean);
}

interface MarqueeSectionProps {
  /** DB-driven content (from the "marquee" global section). When absent/empty, marquee.json is the default. */
  content?: MarqueeContent | null;
}

export default function MarqueeSection({ content }: MarqueeSectionProps) {
  const images = toImageUrls(content?.images?.length ? content.images : marqueeContent.images);
  const sectionTitle = content?.title || marqueeContent.title;

  if (!images || images.length === 0) return null;

  const allImages = [...images, ...images];

  return (
    <section className="py-6 bg-slate-50 dark:bg-[#0f172a] border-y border-slate-200 dark:border-slate-800 transition-colors duration-500">
      {sectionTitle && (
        <div className="text-center mb-6">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{sectionTitle}</h2>
        </div>
      )}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none"></div>

        <div className="flex animate-marquee">
          {allImages.map((img, index) => (
            <div key={index} className="flex-shrink-0 mx-3">
              <div className="w-40 h-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center px-3 py-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
                <img
                  src={img}
                  alt={`Partner ${(index % images.length) + 1}`}
                  className="max-h-14 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
