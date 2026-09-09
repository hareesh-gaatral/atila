import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/services/SettingsService';
import { ApiResponse } from '@/types';

const settingsService = new SettingsService();

export class SettingsController {
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const settings = await settingsService.getAllSettings();
      return NextResponse.json({ success: true, data: settings } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async getByKey(req: NextRequest, key: string): Promise<NextResponse> {
    try {
      const value = await settingsService.getSettingValue(key);
      return NextResponse.json({ success: true, data: { key, value } } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async set(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { key, value, type } = body;
      if (!key || !value) {
        return NextResponse.json(
          { success: false, error: 'Key and value are required' } as ApiResponse,
          { status: 400 }
        );
      }
      const setting = await settingsService.setSetting(key, value, type);
      return NextResponse.json(
        { success: true, data: setting, message: 'Setting saved' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async delete(req: NextRequest, key: string): Promise<NextResponse> {
    try {
      const deleted = await settingsService.deleteSetting(key);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Setting not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, message: 'Setting deleted' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }
}
