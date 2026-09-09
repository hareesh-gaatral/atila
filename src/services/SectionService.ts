import { SectionRepository } from '@/repository/SectionRepository';
import { ISection } from '@/types';

export class SectionService {
  private sectionRepo: SectionRepository;

  constructor() {
    this.sectionRepo = new SectionRepository();
  }

  async getSectionsByPageSlug(pageSlug: string): Promise<ISection[]> {
    return this.sectionRepo.findByPageSlug(pageSlug);
  }

  async getAllSections(filter?: Partial<ISection>): Promise<ISection[]> {
    return this.sectionRepo.findAll(filter || {});
  }

  async getSectionByPageAndType(pageSlug: string, sectionType: string): Promise<ISection | null> {
    return this.sectionRepo.findOne({ pageSlug, sectionType });
  }

  async getSectionById(id: string): Promise<ISection | null> {
    return this.sectionRepo.findById(id);
  }

  async createSection(data: ISection): Promise<ISection> {
    const existingSections = await this.sectionRepo.findByPageSlug(data.pageSlug);
    if (!data.order || data.order === 0) {
      data.order = existingSections.length + 1;
    }
    return this.sectionRepo.create(data);
  }

  async updateSection(id: string, data: Partial<ISection>): Promise<ISection | null> {
    return this.sectionRepo.update(id, data);
  }

  async deleteSection(id: string): Promise<boolean> {
    return this.sectionRepo.delete(id);
  }

  async reorderSections(pageSlug: string, sectionIds: string[]): Promise<void> {
    for (let i = 0; i < sectionIds.length; i++) {
      await this.sectionRepo.update(sectionIds[i], { order: i + 1 });
    }
  }
}
