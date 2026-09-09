import { ServiceRepository } from '@/repository/ServiceRepository';
import { IService, IServicePage, ServiceBlockType } from '@/types';
import { slugify } from '@/lib/slugify';

/**
 * Business layer for the dynamic Services mini-CMS.
 *
 * Normalizes incoming payloads (slug generation, ordering defaults, page
 * structure) and enforces slug uniqueness so two services can never share a URL.
 */
export class ServiceService {
  private repo: ServiceRepository;

  constructor() {
    this.repo = new ServiceRepository();
  }

  /** Public — published, non-archived services (index cards + home cards). */
  async getPublished(): Promise<IService[]> {
    return this.repo.findPublished();
  }

  /** Public — published, non-archived, showInMenu services (nav dropdown). */
  async getMenu(): Promise<IService[]> {
    return this.repo.findMenuItems();
  }

  /** Admin list (all statuses, ordered). */
  async getAll(): Promise<IService[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<IService | null> {
    return this.repo.findById(id);
  }

  /** Any service by slug (admin / draft editing). */
  async getBySlug(slug: string): Promise<IService | null> {
    return this.repo.findBySlug(slug);
  }

  /** Public detail — published + not archived only. */
  async getPublishedBySlug(slug: string): Promise<IService | null> {
    return this.repo.findPublishedBySlug(slug);
  }

  async create(data: Partial<IService>): Promise<IService> {
    const doc = this.normalize(data, null);
    await this.assertUniqueSlug(doc.slug ?? '');
    // Auto next order number if not explicitly provided.
    if (doc.order === undefined || doc.order === null || doc.order === 0) {
      const all = await this.repo.findAll({ isArchived: false });
      doc.order = all.length ? Math.max(...all.map((s) => s.order || 0)) + 1 : 1;
    }
    return this.repo.create(doc as IService);
  }

  async update(id: string, data: Partial<IService>): Promise<IService | null> {
    const existing = await this.repo.findById(id);
    if (!existing) return null;
    const doc = this.normalize(data, existing);
    await this.assertUniqueSlug(doc.slug ?? '', id);
    return this.repo.update(id, doc as Partial<IService>);
  }

  async archive(id: string): Promise<IService | null> {
    return this.repo.archive(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  private async assertUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const slugTaken = await this.repo.isSlugTaken(slug, excludeId);
    if (slugTaken) {
      const err: any = new Error(`A service with the slug "${slug}" already exists.`);
      err.status = 409;
      err.code = 'DUPLICATE_SLUG';
      throw err;
    }
  }

  /**
   * Coerce a partial payload into a full, well-formed Service document. When an
   * existing service is provided its values are used as the base so a partial
   * update (e.g. toggling isPublished) never blanks out fields the client did
   * not send.
   */
  private normalize(data: Partial<IService>, existing: IService | null): Partial<IService> {
    const base: Partial<IService> = existing
      ? JSON.parse(JSON.stringify(existing))
      : {
          title: '',
          slug: '',
          tagline: '',
          shortDescription: '',
          description: '',
          icon: '',
          image: '',
          showInMenu: true,
          menuOrder: 0,
          order: 0,
          isPublished: true,
          isArchived: false,
          metaTitle: '',
          metaDescription: '',
          ogImage: '',
        };

    const merged: any = { ...base, ...data };
    if (data.title !== undefined && data.title !== null && !data.slug) {
      merged.slug = slugify(data.title);
    }
    if (!merged.slug) merged.slug = slugify(merged.title || 'service');

    // Sanitize the page content: ensure every region exists so the renderer can
    // rely on arrays, and `sections` only contains known block types in order.
    merged.page = this.normalizePage(existing?.page || {}, data.page);

    return merged;
  }

  private normalizePage(
    existing: IServicePage | undefined,
    incoming: IServicePage | undefined
  ): IServicePage {
    const cur: IServicePage = existing ? JSON.parse(JSON.stringify(existing)) : {};
    const patch: IServicePage = incoming ? JSON.parse(JSON.stringify(incoming)) : {};

    const known: ServiceBlockType[] = ['steps', 'keyPoints', 'benefits', 'features', 'howItWorks', 'cta'];

    const sectionsOf = (value: unknown): ServiceBlockType[] =>
      Array.isArray(value)
        ? (value as any[]).filter((t): t is ServiceBlockType => known.includes(t))
        : [];

    const sections: ServiceBlockType[] = Array.isArray(patch.sections)
      ? sectionsOf(patch.sections)
      : Array.isArray(cur.sections)
        ? sectionsOf(cur.sections)
        : (['steps', 'cta'] as ServiceBlockType[]);

    // Drop duplicate block types while preserving order.
    const out: IServicePage = {
      sections: sections.filter((t, i) => sections.indexOf(t) === i),
      steps: Array.isArray(patch.steps) ? patch.steps : Array.isArray(cur.steps) ? cur.steps : [],
      keyPoints: Array.isArray(patch.keyPoints) ? patch.keyPoints : Array.isArray(cur.keyPoints) ? cur.keyPoints : [],
      benefits: Array.isArray(patch.benefits) ? patch.benefits : Array.isArray(cur.benefits) ? cur.benefits : [],
      features: Array.isArray(patch.features) ? patch.features : Array.isArray(cur.features) ? cur.features : [],
      howItWorks: Array.isArray(patch.howItWorks) ? patch.howItWorks : Array.isArray(cur.howItWorks) ? cur.howItWorks : [],
      cta: { ...(cur.cta || {}), ...(patch.cta || {}) },
    };

    return out;
  }
}
