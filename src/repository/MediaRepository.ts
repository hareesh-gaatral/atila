import { connectDB } from '@/lib/database/connect';
import Media from '@/models/Media';
import { IMedia } from '@/types';

export class MediaRepository {
  async findAll(): Promise<IMedia[]> {
    await connectDB();
    return Media.find({}).sort({ createdAt: -1 }).lean() as unknown as IMedia[];
  }

  async findById(id: string): Promise<IMedia | null> {
    await connectDB();
    return Media.findById(id).lean() as unknown as IMedia | null;
  }

  async create(data: IMedia): Promise<IMedia> {
    await connectDB();
    const media = new Media(data);
    return media.save();
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Media.findByIdAndDelete(id);
    return !!result;
  }
}
