import { NextRequest, NextResponse } from 'next/server';
import { PageService } from '@/services/PageService';
import { ApiResponse } from '@/types';

const pageService = new PageService();

export class PageController {
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const pages = await pageService.getAllPages();
      return NextResponse.json({ success: true, data: pages } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async getBySlug(req: NextRequest, slug: string): Promise<NextResponse> {
    try {
      const page = await pageService.getPageWithSections(slug);
      if (!page) {
        return NextResponse.json(
          { success: false, error: 'Page not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: page } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }

  async getById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const page = await pageService.getPageById(id);
      if (!page) {
        return NextResponse.json(
          { success: false, error: 'Page not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: page } as ApiResponse);
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
      const page = await pageService.createPage(body);
      return NextResponse.json(
        { success: true, data: page, message: 'Page created' } as ApiResponse,
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
      const page = await pageService.updatePage(id, body);
      if (!page) {
        return NextResponse.json(
          { success: false, error: 'Page not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: page, message: 'Page updated' } as ApiResponse
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
      const deleted = await pageService.deletePage(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Page not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, message: 'Page deleted' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }
  }
}
