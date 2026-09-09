import { NextRequest, NextResponse } from 'next/server';
import { ServiceService } from '@/services/ServiceService';
import { ApiResponse } from '@/types';
import mongoose from 'mongoose';

const serviceService = new ServiceService();

/** Map a thrown service error (e.g. duplicate slug) onto an HTTP status. */
function statusOf(error: any): number {
  if (error?.status) return error.status;
  if (error?.code === 'DUPLICATE_SLUG') return 409;
  if (error instanceof mongoose.Error.ValidationError) return 400;
  return 400;
}

export class ServiceController {
  /**
   * GET /api/services
   *   - default  -> public list of published services (index / home cards)
   *   - ?menu=1  -> public nav dropdown items (showInMenu true)
   *   - ?all=1   -> admin list (route requires admin before calling)
   */
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      if (searchParams.get('menu') === '1') {
        const data = await serviceService.getMenu();
        return NextResponse.json({ success: true, data } as ApiResponse);
      }
      if (searchParams.get('all') === '1') {
        const data = await serviceService.getAll();
        return NextResponse.json({ success: true, data } as ApiResponse);
      }
      const data = await serviceService.getPublished();
      return NextResponse.json({ success: true, data } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to load services' } as ApiResponse,
        { status: 500 }
      );
    }
  }

  /** GET /api/services/[slug] — public published detail lookup. */
  async getBySlug(req: NextRequest, slug: string): Promise<NextResponse> {
    try {
      const service = await serviceService.getPublishedBySlug(slug);
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: service } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to load service' } as ApiResponse,
        { status: 500 }
      );
    }
  }

  /** GET /api/services/[id]?admin=1 — any service (drafts too) by id or slug. */
  async getOneForAdmin(req: NextRequest, param: string): Promise<NextResponse> {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(param);
      const service = isObjectId
        ? await serviceService.getById(param)
        : await serviceService.getBySlug(param);
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: service } as ApiResponse);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to load service' } as ApiResponse,
        { status: 500 }
      );
    }
  }

  /** POST /api/services (admin). */
  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const service = await serviceService.create(body);
      return NextResponse.json(
        { success: true, data: service, message: 'Service created' } as ApiResponse,
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create service' } as ApiResponse,
        { status: statusOf(error) }
      );
    }
  }

  /** PUT /api/services/[id] (admin). */
  async update(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const service = await serviceService.update(id, body);
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: service, message: 'Service updated' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update service' } as ApiResponse,
        { status: statusOf(error) }
      );
    }
  }

  /** DELETE /api/services/[id] (admin) — soft-delete / archive. */
  async archive(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const service = await serviceService.archive(id);
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: service, message: 'Service archived' } as ApiResponse
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to delete service' } as ApiResponse,
        { status: 500 }
      );
    }
  }
}
