import { connectDB } from '@/lib/database/connect';
import Page from '@/models/Page';
import { IPage } from '@/types';

export class PageRepository {
  async findAll(filter: Record<string, any> = {}): Promise<IPage[]> {
    await connectDB();
    return Page.find(filter).sort({ createdAt: -1 }).lean() as unknown as IPage[];
  }

  async findBySlug(slug: string): Promise<IPage | null> {
    await connectDB();
    return Page.findOne({ slug }).lean() as unknown as IPage | null;
  }

  async findById(id: string): Promise<IPage | null> {
    await connectDB();
    return Page.findById(id).lean() as unknown as IPage | null;
  }

  async create(data: IPage): Promise<IPage> {
    await connectDB();
    const page = new Page(data);
    return page.save() as unknown as IPage;
  }

  async update(id: string, data: Partial<IPage>): Promise<IPage | null> {
    await connectDB();
    return Page.findByIdAndUpdate(id, data, { new: true }).lean() as unknown as IPage | null;
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Page.findByIdAndDelete(id);
    return !!result;
  }

  async findBySlugAndUpdate(slug: string, data: Partial<IPage>): Promise<IPage | null> {
    await connectDB();
    return Page.findOneAndUpdate({ slug }, data, { new: true }).lean() as unknown as IPage | null;
  }
}
