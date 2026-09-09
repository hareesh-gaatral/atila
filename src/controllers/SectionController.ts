import { NextRequest, NextResponse } from 'next/server';
import { SectionService } from '@/services/SectionService';
import { ApiResponse } from '@/types';

const sectionService = new SectionService();

export class SectionController {
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const pageSlug = searchParams.get('pageSlug');
      const sectionType = searchParams.get('sectionType');
      const filter: Record<string, any> = {};
      if (pageSlug) filter.pageSlug = pageSlug;
      if (sectionType) filter.sectionType = sectionType;
      const sections = await sectionService.getAllSections(filter as any);
      return NextResponse.json({ success: true, data: sections } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async getByPageSlug(req: NextRequest, pageSlug: string): Promise<NextResponse> {
    try {
      const sections = await sectionService.getSectionsByPageSlug(pageSlug);
      return NextResponse.json({ success: true, data: sections } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async getById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const section = await sectionService.getSectionById(id);
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: section } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const section = await sectionService.createSection(body);
      return NextResponse.json(
        { success: true, data: section, message: 'Section created' } as ApiResponse,
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 400 }
      );
    }
  }

  async update(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const section = await sectionService.updateSection(id, body);
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: section, message: 'Section updated' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 400 }
      );
    }
  }

  async delete(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const deleted = await sectionService.deleteSection(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Section not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, message: 'Section deleted' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }
}
