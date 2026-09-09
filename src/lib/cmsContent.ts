/**
 * CMS content-type configuration.
 *
 * Describes every DB-backed website content block the admin panel can edit:
 * which page/scope it belongs to, the friendly label shown in the sidebar, the
 * convenient scalar fields, and the shape of the repeatable item rows (used by
 * the Services / FAQ / Testimonials / Features / About / Navbar / Footer lists).
 *
 * Content that does not map to a scalar field or an item row (e.g. hero stats,
 * about image carousel, contact form labels/map) is still fully editable via
 * the Advanced JSON editor in each screen, so nothing is lost.
 */

export type ContentFieldType = 'text' | 'textarea' | 'image' | 'number';

export interface CmsContentField {
  key: string;
  label: string;
  type: ContentFieldType;
  hint?: string;
}

export interface CmsItemField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'image';
}

/**
 * One repeatable list inside a content type. A type can declare several lists
 * (e.g. the procurement wheel has stages, buyer cards, supplier cards and
 * tags). Legacy defs without `groups` keep using hasItems/itemKey/itemFields.
 */
export interface CmsContentGroup {
  /** Dot-path to the array, e.g. "items", "stages", "buyers.cards". */
  itemKey: string;
  /** Friendly name for the add button / empty state / list heading. */
  itemLabel?: string;
  /** "object" rows (default) or a plain-string list (e.g. tags). */
  itemValueType?: 'object' | 'string';
  itemFields?: CmsItemField[];
}

export interface CmsContentDef {
  /** MongoDB Section.sectionType */
  type: string;
  label: string;
  scope: 'home' | 'global';
  pageTitle: string;
  description: string;
  icon: string;
  /** Convenient top-level scalar fields (everything else is editable in JSON). */
  fields: CmsContentField[];
  /** Repeatable list definition (Services cards, FAQ, testimonials, nav links…). */
  hasItems: boolean;
  itemKey?: string;
  itemLabel?: string;
  itemFields?: CmsItemField[];
  /** Multiple repeatable lists (overrides hasItems/itemKey/itemFields). */
  groups?: CmsContentGroup[];
}

export const CMS_CONTENT_TYPES: CmsContentDef[] = [
  {
    type: 'navbar',
    label: 'Header / Navigation',
    scope: 'global',
    pageTitle: 'Global',
    description: 'Logo, top navigation links and the Admin panel link.',
    icon: '🧭',
    fields: [
      { key: 'logo', label: 'Logo URL', type: 'image' },
      { key: 'logoAlt', label: 'Logo Alt Text', type: 'text' },
      { key: 'adminLabel', label: 'Admin Link Label', type: 'text' },
      { key: 'adminHref', label: 'Admin Link URL', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'navItems',
    itemLabel: 'Navigation Link',
    itemFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'href', label: 'URL', type: 'text' },
      { key: 'id', label: 'ID (anchor)', type: 'text' },
    ],
  },
  {
    type: 'footer',
    label: 'Footer',
    scope: 'global',
    pageTitle: 'Global',
    description: 'Footer logo, description, quick links, contact and bottom bar.',
    icon: '🦶',
    fields: [
      { key: 'logo', label: 'Logo URL', type: 'image' },
      { key: 'logoAlt', label: 'Logo Alt Text', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'quickLinksTitle', label: 'Quick Links Title', type: 'text' },
      { key: 'contactTitle', label: 'Contact Title', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'quickLinks',
    itemLabel: 'Quick Link',
    itemFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'href', label: 'URL', type: 'text' },
    ],
  },
  {
    type: 'marquee',
    label: 'Trusted By (Marquee)',
    scope: 'global',
    pageTitle: 'Global',
    description: 'Home logo strip: heading and the partner logo images that scroll.',
    icon: '🤝',
    fields: [{ key: 'title', label: 'Heading', type: 'text' }],
    hasItems: true,
    itemKey: 'images',
    itemLabel: 'Logo',
    itemFields: [{ key: 'url', label: 'Logo Image', type: 'image' }],
  },
  {
    type: 'procurement-wheel',
    label: 'Procurement Lifecycle Wheel',
    scope: 'global',
    pageTitle: 'Global',
    description: 'End-to-End lifecycle diagram — badge, headings, ring labels, wheel stages and the scrolling Buyers/Suppliers columns.',
    icon: '🔄',
    fields: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Title Prefix', type: 'text' },
      { key: 'highlight', label: 'Title Highlight', type: 'text' },
      { key: 'logo', label: 'Center Logo URL', type: 'image' },
      { key: 'ringLabels.top', label: 'Ring Label — Top', type: 'text' },
      { key: 'ringLabels.bottom', label: 'Ring Label — Bottom', type: 'text' },
      { key: 'ringLabels.left', label: 'Ring Label — Left', type: 'text' },
      { key: 'ringLabels.right', label: 'Ring Label — Right', type: 'text' },
      { key: 'buyers.title', label: 'Buyers Title', type: 'text' },
      { key: 'buyers.headline', label: 'Buyers Headline', type: 'text' },
      { key: 'buyers.description', label: 'Buyers Intro', type: 'textarea' },
      { key: 'suppliers.title', label: 'Suppliers Title', type: 'text' },
      { key: 'suppliers.headline', label: 'Suppliers Headline', type: 'text' },
      { key: 'suppliers.description', label: 'Suppliers Intro', type: 'textarea' },
    ],
    hasItems: false,
    groups: [
      {
        itemKey: 'stages',
        itemLabel: 'Wheel Stage',
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'color', label: 'Segment Color (hex)', type: 'text' },
        ],
      },
      {
        itemKey: 'buyers.cards',
        itemLabel: 'Buyer Card',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
      {
        itemKey: 'suppliers.cards',
        itemLabel: 'Supplier Card',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
      {
        itemKey: 'tags',
        itemLabel: 'Tag',
        itemValueType: 'string',
        itemFields: [{ key: 'value', label: 'Tag', type: 'text' }],
      },
    ],
  },
  {
    type: 'hero',
    label: 'Hero',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Top banner: badge, headline, paragraph, buttons and stats.',
    icon: '🏠',
    fields: [
      { key: 'subtitle', label: 'Badge / Subtitle', type: 'text' },
      { key: 'heading.brand', label: 'Headline Prefix', type: 'text' },
      { key: 'heading.highlight', label: 'Headline Highlight', type: 'text' },
      { key: 'heading.subtext', label: 'Headline Suffix', type: 'text' },
      { key: 'paragraph.text', label: 'Intro Paragraph', type: 'textarea' },
      { key: 'paragraph.highlight', label: 'Paragraph Highlight Phrase', type: 'text' },
      { key: 'buttonText', label: 'Primary Button Text', type: 'text' },
      { key: 'buttonLink', label: 'Primary Button URL', type: 'text' },
      { key: 'button2Text', label: 'Secondary Button Text', type: 'text' },
      { key: 'button2Link', label: 'Secondary Button URL', type: 'text' },
      { key: 'displayImage', label: 'Display Image URL', type: 'image' },
      { key: 'displayImageAlt', label: 'Display Image Alt', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'stats',
    itemLabel: 'Statistic',
    itemFields: [
      { key: 'value', label: 'Value (e.g. 500+)', type: 'text' },
      { key: 'label', label: 'Label (e.g. Enterprises)', type: 'text' },
    ],
  },
  {
    type: 'about',
    label: 'About',
    scope: 'home',
    pageTitle: 'Home',
    description: 'About ATILA: image carousel, paragraphs and highlight items.',
    icon: 'ℹ️',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'content', label: 'Intro Paragraph', type: 'textarea' },
    ],
    hasItems: true,
    itemKey: 'items',
    itemLabel: 'Highlight Item',
    itemFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (emoji)', type: 'text' },
    ],
  },
  {
    type: 'services',
    label: 'Services',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Home page service cards (each links to its detail page).',
    icon: '🧩',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'viewDetailsText', label: '"View Details" Text', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'items',
    itemLabel: 'Service Card',
    itemFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (emoji)', type: 'text' },
      { key: 'link', label: 'Detail URL', type: 'text' },
    ],
  },
  {
    type: 'features',
    label: 'Features',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Key feature cards shown under Services.',
    icon: '⚡',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'content', label: 'Description', type: 'textarea' },
    ],
    hasItems: true,
    itemKey: 'items',
    itemLabel: 'Feature',
    itemFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (emoji)', type: 'text' },
    ],
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Customer testimonials with name, role, quote and star rating.',
    icon: '💬',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'items',
    itemLabel: 'Testimonial',
    itemFields: [
      { key: 'title', label: 'Name', type: 'text' },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'description', label: 'Quote', type: 'textarea' },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      { key: 'imageUrl', label: 'Avatar URL', type: 'text' },
    ],
  },
  {
    type: 'faq',
    label: 'FAQ',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Frequently asked questions (accordion list).',
    icon: '❓',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
    hasItems: true,
    itemKey: 'items',
    itemLabel: 'FAQ',
    itemFields: [
      { key: 'title', label: 'Question', type: 'text' },
      { key: 'description', label: 'Answer', type: 'textarea' },
    ],
  },
  {
    type: 'cta',
    label: 'Call To Action',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Bottom call-to-action banner.',
    icon: '📣',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'buttonText', label: 'Button Text', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'text' },
    ],
    hasItems: false,
  },
  {
    type: 'contact',
    label: 'Contact',
    scope: 'home',
    pageTitle: 'Home',
    description: 'Contact section: info cards, Google map and form labels.',
    icon: '✉️',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'heading', label: 'Info Heading', type: 'text' },
      { key: 'formHeading', label: 'Form Heading', type: 'text' },
      { key: 'mapUrl', label: 'Google Maps Embed URL', type: 'textarea' },
    ],
    hasItems: false,
  },
];

export const CMS_CONTENT_BY_TYPE: Record<string, CmsContentDef> = CMS_CONTENT_TYPES.reduce(
  (acc, def) => {
    acc[def.type] = def;
    return acc;
  },
  {} as Record<string, CmsContentDef>
);
