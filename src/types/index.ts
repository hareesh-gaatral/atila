export interface IPage {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: string[];
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISection {
  _id?: string;
  pageTitle: string;
  pageSlug: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  viewDetailsText?: string;
  items: ISectionItem[];
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface ISectionItem {
  title?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  link?: string;
  id?: string;
  designation?: string;
  rating?: number;
  [key: string]: any;
}

export interface IMedia {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  createdAt?: Date;
}

export interface ISettings {
  _id?: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'json';
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Dynamic Services ("Services mini-CMS")
//
// A Service is the single DB record behind a product offering. The same record
// drives the home-page card, the /services index card, the navigation dropdown
// (when showInMenu) and the dynamic /services/[slug] detail page.
// ---------------------------------------------------------------------------

/** Ordered content regions available on a service detail page. */
export type ServiceBlockType = 'steps' | 'benefits' | 'features' | 'howItWorks' | 'cta' | 'keyPoints';

/** One illustrated walkthrough step (alternating image/text row). */
export interface IServiceStep {
  num?: string;
  title?: string;
  description?: string;
  points?: string[];
  result?: string;
  image?: string;
}

/** Optional bottom CTA overrides for a service detail page. */
export interface IServiceCta {
  heading?: string;
  text?: string;
  buttonText?: string;
  buttonHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

/** Detail-page content of a service. `sections` is the ordered, enabled list. */
export interface IServicePage {
  sections?: ServiceBlockType[];
  steps?: IServiceStep[];
  /** Top-of-page highlight checklist (Key Points region). */
  keyPoints?: string[];
  benefits?: string[];
  features?: string[];
  howItWorks?: string[];
  cta?: IServiceCta;
}

export interface IService {
  _id?: string;
  title: string;
  slug: string;
  tagline?: string;
  /** Short card copy (home page cards). */
  shortDescription?: string;
  /** Longer hero / index-page description. */
  description?: string;
  /** Emoji icon identifier (stored as string, consistent with the rest of the site). */
  icon?: string;
  /** Optional hero / card image URL. */
  image?: string;
  /** Show in the navigation "Services" dropdown. */
  showInMenu: boolean;
  /** Dropdown ordering. */
  menuOrder: number;
  /** Listing ordering (home + /services index). */
  order: number;
  isPublished: boolean;
  /** Soft-delete flag (kept for audit, excluded from every public query). */
  isArchived: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  page?: IServicePage;
  createdAt?: Date;
  updatedAt?: Date;
}
