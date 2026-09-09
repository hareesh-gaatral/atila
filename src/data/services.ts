import serviceCatalog from '@/data/json/services-catalog.json';

/**
 * One illustrated "walkthrough" step — an alternating image/text block
 * (used by Vendor Management today, and available to any service by adding
 * a `sections` array to its record).
 */
export interface ServiceSection {
  num: string;
  title: string;
  description: string;
  points: string[];
  result: string;
  image: string;
}

export interface Service {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  image?: string;
  link: string;
  /** Optional illustrated step walkthrough (e.g. Vendor Management). */
  sections?: ServiceSection[];
  /** Text-mode content (used by the other service detail pages). */
  features?: string[];
  benefits?: string[];
  howItWorks?: string[];
}

/**
 * Repository seam for ATILA's services. Today the catalog is served from
 * src/data/json/services-catalog.json so pages render with zero database
 * round-trips; when content moves to the API/DB, only this module's internals
 * need to change (e.g. getServiceData becomes an async fetch) — callers that
 * import `services` / the helpers below stay the same.
 * Used by the Navbar services dropdown, the home page service cards,
 * the /services index page and the /services/[slug] detail pages.
 */
export const services: Service[] = serviceCatalog.services as Service[];

/** Look up a service by its URL slug. */
export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Look up a service by its display title. */
export function getServiceByTitle(title?: string): Service | undefined {
  if (!title) return undefined;
  return services.find((s) => s.title.toLowerCase() === title.toLowerCase());
}

/** Get the detail-page link for a service title (falls back to #id anchor). */
export function getServiceLink(title?: string): string | undefined {
  return getServiceByTitle(title)?.link;
}

/** Convert a service title to a slug-style anchor id. */
export function serviceTitleToId(title?: string): string {
  if (!title) return '';
  return title.toLowerCase().replace(/\s+/g, '-');
}
