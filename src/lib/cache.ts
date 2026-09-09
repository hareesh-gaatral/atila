import { cache } from 'react';
import pagesData from '@/data/pages.json';
import settingsData from '@/data/settings.json';
import marqueeContent from '@/data/json/marquee.json';
import procurementWheelContent from '@/data/json/procurement-wheel.json';
import { services as staticServices, getServiceBySlug as getStaticServiceBySlug } from '@/data/services';
import { SectionService } from '@/services/SectionService';
import { SettingsService } from '@/services/SettingsService';
import { ServiceService } from '@/services/ServiceService';
import { PageService } from '@/services/PageService';
import type { IService } from '@/types';

// Frontend content is served from MongoDB (seeded from the JSON files in
// src/data/json by `npm run seed`) so the public site is fully CMS-driven.
// When MongoDB is unreachable or a page/section has not been seeded yet, these
// functions transparently fall back to the static JSON defaults so the site
// keeps rendering exactly as before.

type Section = Record<string, any>;
type Page = { slug?: string; sections?: Section[] };

const pages = pagesData as Record<string, Page>;

/** Deep-convert a Mongoose document into a plain JSON value (ObjectId/Date →
 *  string) so it can safely cross the Server→Client Component boundary. */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Normalize marquee logos stored as URL strings or { url } rows. */
function toImageUrls(images?: any[]): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean);
}

function toSettingsMap(list: { key: string; value: string }[]): Record<string, string> {
  const map: Record<string, string> = { ...settingsData };
  list.forEach((s) => {
    if (s && s.key && s.value !== undefined && s.value !== null) {
      map[s.key] = s.value;
    }
  });
  return map;
}

/** Site-wide settings (email / phone / address) from MongoDB, falling back to settings.json. */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const settingsService = new SettingsService();
    const list = await settingsService.getAllSettings();
    if (Array.isArray(list) && list.length > 0) {
      return toSettingsMap(toPlain(list) as { key: string; value: string }[]);
    }
  } catch {
    // DB unavailable -> fall back to JSON below.
  }
  return settingsData;
});

/** Home page data: ordered sections + settings, all from MongoDB (JSON fallback). */
export const getHomeData = cache(async () => {
  try {
    const sectionService = new SectionService();
    const sections = await sectionService.getAllSections({ pageSlug: 'home', isActive: true } as any);
    const settings = await getSettings();
    if (Array.isArray(sections) && sections.length > 0) {
      return { sections: (sections as Section[]).map(toPlain), settings };
    }
  } catch {
    // DB unavailable or empty -> fall back to JSON below.
  }
  const home = pages.home;
  return {
    sections: (home?.sections ?? []) as Section[],
    settings: settingsData,
  };
});

/** Home "Trusted by Leading Enterprises" logo strip (global "marquee" section).
 *  DB-first, falling back to marquee.json when the DB is unavailable/empty.
 *  Returns null only when the section is explicitly unpublished in the CMS,
 *  which hides the strip from the home page. */
export const getMarquee = cache(async (): Promise<{ title?: string; images: string[] } | null> => {
  try {
    const sectionService = new SectionService();
    const sec = await sectionService.getSectionByPageAndType('global', 'marquee');
    if (sec) {
      const plain = toPlain(sec) as Record<string, any>;
      if (plain.isActive === false) return null;
      const images = toImageUrls(plain.images);
      if (plain.title || images.length > 0) {
        return { title: plain.title || marqueeContent.title, images };
      }
    }
  } catch {
    // DB unavailable -> fall back to JSON below.
  }
  return marqueeContent as { title?: string; images: string[] };
});

/** Home "End-to-End Procurement Lifecycle" wheel (global "procurement-wheel"
 *  section). DB-first with the static JSON as the offline default. Returns
 *  null when the section is explicitly unpublished (hides the wheel). */
export const getProcurementWheel = cache(async (): Promise<Record<string, any> | null> => {
  try {
    const sectionService = new SectionService();
    const sec = await sectionService.getSectionByPageAndType('global', 'procurement-wheel');
    if (sec) {
      const plain = toPlain(sec) as Record<string, any>;
      if (plain.isActive === false) return null;
      const META_KEYS = new Set(['_id', 'pageTitle', 'pageSlug', 'sectionType', 'order', 'isActive', 'createdAt', 'updatedAt', '__v']);
      const content: Record<string, any> = {};
      Object.entries(plain).forEach(([key, value]) => {
        if (!META_KEYS.has(key)) content[key] = value;
      });
      if (Array.isArray(content.stages)) {
        return { ...procurementWheelContent, ...content };
      }
    }
  } catch {
    // DB unavailable -> fall back to JSON below.
  }
  return procurementWheelContent as Record<string, any>;
});

/** Dynamic page data by slug, from MongoDB (pages.json fallback). Returns null when not found. */
export const getPageData = cache(async (slug: string) => {
  try {
    const pageService = new PageService();
    const sectionService = new SectionService();
    const page = await pageService.getPageBySlug(slug);
    if (page) {
      const sections = await sectionService.getSectionsByPageSlug(slug);
      return {
        page: toPlain({ ...page }),
        sections: (sections ?? []).map(toPlain) as Section[],
      };
    }
  } catch {
    // DB unavailable -> fall back to JSON below.
  }

  const page = pages[slug];
  if (!page) return null;
  return {
    page: { slug, ...page },
    sections: (page.sections ?? []) as Section[],
  };
});

// ---------------------------------------------------------------------------
// Dynamic Services — DB-first with the static catalog as the offline default.
// ---------------------------------------------------------------------------

/** Published services (index cards + home "Our Solutions" cards). */
export const getServices = cache(async (): Promise<IService[]> => {
  try {
    const serviceService = new ServiceService();
    const services = await serviceService.getPublished();
    if (Array.isArray(services) && services.length > 0) {
      return toPlain(services);
    }
  } catch {
    // DB unavailable or empty -> static catalog below.
  }
  return toPlain(staticServices) as unknown as IService[];
});

/** Published services that are shown in the navigation dropdown. */
export const getMenuServices = cache(async (): Promise<IService[]> => {
  try {
    const serviceService = new ServiceService();
    const services = await serviceService.getMenu();
    if (Array.isArray(services) && services.length > 0) {
      return toPlain(services);
    }
  } catch {
    // DB unavailable -> static catalog below.
  }
  return toPlain(staticServices.filter((s: any) => s.showInMenu !== false)) as unknown as IService[];
});

/** Public detail lookup by slug (published only). Returns null when not found. */
export const getServiceBySlug = cache(async (slug: string): Promise<IService | null> => {
  try {
    const serviceService = new ServiceService();
    const service = await serviceService.getPublishedBySlug(slug);
    if (service) return toPlain(service);
  } catch {
    // DB unavailable -> static catalog below.
  }
  const fallback = getStaticServiceBySlug(slug);
  return fallback ? (toPlain(fallback) as unknown as IService) : null;
});
