import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/services/MediaService';
import { saveFileLocally } from '@/utils/upload';
import { ApiResponse } from '@/types';

const mediaService = new MediaService();

export class MediaController {
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const media = await mediaService.getAllMedia();
      return NextResponse.json({ success: true, data: media } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async upload(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' } as ApiResponse,
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const saved = await saveFileLocally(buffer, file.name, file.type);

      const media = await mediaService.createMedia({
        filename: saved.filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: saved.url,
        path: saved.path,
      });

      return NextResponse.json(
        { success: true, data: media, message: 'File uploaded' } as ApiResponse,
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async delete(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const deleted = await mediaService.deleteMedia(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Media not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, message: 'Media deleted' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }
}
