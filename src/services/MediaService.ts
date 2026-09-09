import { MediaRepository } from '@/repository/MediaRepository';
import { IMedia } from '@/types';

export class MediaService {
  private mediaRepo: MediaRepository;

  constructor() {
    this.mediaRepo = new MediaRepository();
  }

  async getAllMedia(): Promise<IMedia[]> {
    return this.mediaRepo.findAll();
  }

  async getMediaById(id: string): Promise<IMedia | null> {
    return this.mediaRepo.findById(id);
  }

  async createMedia(data: IMedia): Promise<IMedia> {
    return this.mediaRepo.create(data);
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.mediaRepo.delete(id);
  }
}
