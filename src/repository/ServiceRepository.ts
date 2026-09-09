import { connectDB } from '@/lib/database/connect';
import Service from '@/models/Service';
import { IService } from '@/types';

export class ServiceRepository {
  /** Admin list: every service (optionally filtered), ordered for the UI. */
  async findAll(filter: Record<string, any> = {}): Promise<IService[]> {
    await connectDB();
    return Service.find(filter)
      .sort({ order: 1, menuOrder: 1 })
      .lean() as unknown as IService[];
  }

  /** Public list: published, non-archived services (cards / dropdown). */
  async findPublished(): Promise<IService[]> {
    await connectDB();
    return Service.find({ isPublished: true, isArchived: false })
      .sort({ order: 1, menuOrder: 1 })
      .select('-page')
      .lean() as unknown as IService[];
  }

  /** Public menu items: published, non-archived and shown in the dropdown. */
  async findMenuItems(): Promise<IService[]> {
    await connectDB();
    return Service.find({ isPublished: true, isArchived: false, showInMenu: true })
      .sort({ menuOrder: 1, order: 1 })
      .select('title slug tagline icon shortDescription image menuOrder order')
      .lean() as unknown as IService[];
  }

  async findById(id: string): Promise<IService | null> {
    await connectDB();
    return Service.findById(id).lean() as unknown as IService | null;
  }

  async findBySlug(slug: string): Promise<IService | null> {
    await connectDB();
    return Service.findOne({ slug: slug.toLowerCase() }).lean() as unknown as IService | null;
  }

  /** Public detail lookup — published + not archived only. */
  async findPublishedBySlug(slug: string): Promise<IService | null> {
    await connectDB();
    return Service.findOne({ slug: slug.toLowerCase(), isPublished: true, isArchived: false }).lean() as unknown as IService | null;
  }

  async create(data: IService): Promise<IService> {
    await connectDB();
    const service = new Service(data);
    return service.save() as unknown as IService;
  }

  async update(id: string, data: Partial<IService>): Promise<IService | null> {
    await connectDB();
    return Service.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean() as unknown as IService | null;
  }

  /** Soft delete — archives + unpublishes so it disappears everywhere. */
  async archive(id: string): Promise<IService | null> {
    await connectDB();
    return Service.findByIdAndUpdate(
      id,
      { isArchived: true, isPublished: false },
      { new: true }
    ).lean() as unknown as IService | null;
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    await connectDB();
    const q: Record<string, any> = { slug: slug.toLowerCase() };
    if (excludeId) q._id = { $ne: excludeId };
    return !!(await Service.findOne(q).select('_id').lean());
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Service.findByIdAndDelete(id);
    return !!result;
  }
}
