import { SettingsRepository } from '@/repository/SettingsRepository';
import { ISettings } from '@/types';

export class SettingsService {
  private settingsRepo: SettingsRepository;

  constructor() {
    this.settingsRepo = new SettingsRepository();
  }

  async getAllSettings(): Promise<ISettings[]> {
    return this.settingsRepo.findAll();
  }

  async getSetting(key: string): Promise<ISettings | null> {
    return this.settingsRepo.findByKey(key);
  }

  async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.settingsRepo.findByKey(key);
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string, type: string = 'text'): Promise<ISettings> {
    return this.settingsRepo.upsert(key, value, type);
  }

  async deleteSetting(key: string): Promise<boolean> {
    return this.settingsRepo.delete(key);
  }
}
