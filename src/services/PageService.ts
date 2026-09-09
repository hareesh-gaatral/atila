import { PageRepository } from '@/repository/PageRepository';
import { SectionRepository } from '@/repository/SectionRepository';
import { IPage } from '@/types';

export class PageService {
  private pageRepo: PageRepository;
  private sectionRepo: SectionRepository;

  constructor() {
    this.pageRepo = new PageRepository();
    this.sectionRepo = new SectionRepository();
  }

  async getAllPages(): Promise<IPage[]> {
    return this.pageRepo.findAll();
  }

  async getPublishedPages(): Promise<IPage[]> {
    return this.pageRepo.findAll({ isPublished: true });
  }

  async getPageBySlug(slug: string): Promise<IPage | null> {
    return this.pageRepo.findBySlug(slug);
  }

  async getPageById(id: string): Promise<IPage | null> {
    return this.pageRepo.findById(id);
  }

  async getPageWithSections(slug: string) {
    const page = await this.pageRepo.findBySlug(slug);
    if (!page) return null;
    const sections = await this.sectionRepo.findByPageSlug(slug);
    return { ...page, sectionsData: sections };
  }

  async createPage(data: IPage): Promise<IPage> {
    const existing = await this.pageRepo.findBySlug(data.slug);
    if (existing) {
      throw new Error('A page with this slug already exists');
    }
    return this.pageRepo.create(data);
  }

  async updatePage(id: string, data: Partial<IPage>): Promise<IPage | null> {
    return this.pageRepo.update(id, data);
  }

  async deletePage(id: string): Promise<boolean> {
    const page = await this.pageRepo.findById(id);
    if (page) {
      await this.sectionRepo.deleteByPageSlug(page.slug);
    }
    return this.pageRepo.delete(id);
  }
}
