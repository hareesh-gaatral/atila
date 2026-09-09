import { connectDB } from '@/lib/database/connect';
import Section from '@/models/Section';
import { ISection } from '@/types';

export class SectionRepository {
  async findByPageSlug(pageSlug: string): Promise<ISection[]> {
    await connectDB();
    return Section.find({ pageSlug, isActive: true }).sort({ order: 1 }).lean() as unknown as ISection[];
  }

  async findAll(filter: Record<string, any> = {}): Promise<ISection[]> {
    await connectDB();
    return Section.find(filter).sort({ order: 1 }).lean() as unknown as ISection[];
  }

  async findById(id: string): Promise<ISection | null> {
    await connectDB();
    return Section.findById(id).lean() as unknown as ISection | null;
  }

  /** Find the first section matching a filter (e.g. pageSlug + sectionType). */
  async findOne(filter: Record<string, any>): Promise<ISection | null> {
    await connectDB();
    return Section.findOne(filter).sort({ order: 1 }).lean() as unknown as ISection | null;
  }

  async create(data: ISection): Promise<ISection> {
    await connectDB();
    const section = new Section(data);
    return section.save() as unknown as ISection;
  }

  async update(id: string, data: Partial<ISection>): Promise<ISection | null> {
    await connectDB();
    return Section.findByIdAndUpdate(id, data, { new: true }).lean() as unknown as ISection | null;
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Section.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByPageSlug(pageSlug: string): Promise<boolean> {
    await connectDB();
    const result = await Section.deleteMany({ pageSlug });
    return result.deletedCount > 0;
  }
}
