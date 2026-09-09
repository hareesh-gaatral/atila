import { connectDB } from '@/lib/database/connect';
import Settings from '@/models/Settings';
import { ISettings } from '@/types';

export class SettingsRepository {
  async findAll(): Promise<ISettings[]> {
    await connectDB();
    return Settings.find({}).lean() as unknown as ISettings[];
  }

  async findByKey(key: string): Promise<ISettings | null> {
    await connectDB();
    return Settings.findOne({ key }).lean() as unknown as ISettings | null;
  }

  async upsert(key: string, value: string, type: string = 'text'): Promise<ISettings> {
    await connectDB();
    return Settings.findOneAndUpdate(
      { key },
      { value, type },
      { upsert: true, new: true }
    ).lean() as unknown as ISettings;
  }

  async delete(key: string): Promise<boolean> {
    await connectDB();
    const result = await Settings.findOneAndDelete({ key });
    return !!result;
  }
}
