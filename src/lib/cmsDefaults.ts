/**
 * Static JSON defaults keyed by Section.sectionType.
 *
 * The public site renders from MongoDB (seeded via `npm run seed` from these
 * files). The CMS content editors use these files as the offline/fallback
 * starting point when a section document doesn't exist in the DB yet, so the
 * admin always sees the current live content even before the first save.
 */
import hero from '@/data/json/hero.json';
import about from '@/data/json/about.json';
import services from '@/data/json/services.json';
import features from '@/data/json/features.json';
import testimonials from '@/data/json/testimonials.json';
import faq from '@/data/json/faq.json';
import cta from '@/data/json/cta.json';
import contact from '@/data/json/contact.json';
import navbar from '@/data/json/navbar.json';
import footer from '@/data/json/footer.json';
import marqueeContent from '@/data/json/marquee.json';
import procurementWheelContent from '@/data/json/procurement-wheel.json';

/**
 * The marquee JSON file stores logo images as plain URL strings (the public
 * fallback reads them directly), but the CMS repeatable editor edits object
 * rows. Normalize to { url } rows for the editor baseline.
 */
const marqueeDefault: Record<string, any> = {
  title: marqueeContent.title,
  images: marqueeContent.images.map((u: any) => (typeof u === 'string' ? { url: u } : u)),
};

export const CMS_SECTION_DEFAULTS: Record<string, Record<string, any>> = {
  hero,
  about,
  services,
  features,
  testimonials,
  faq,
  cta,
  contact,
  navbar,
  footer,
  marquee: marqueeDefault,
  'procurement-wheel': procurementWheelContent as Record<string, any>,
};

/** Deep clone (JSON files are plain data). */
export function cloneDefault<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
