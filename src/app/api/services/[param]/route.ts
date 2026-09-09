import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ServiceController } from '@/controllers/ServiceController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new ServiceController();

/**
 * /api/services/[param]
 *
 *   GET    (public)              -> published service by slug (detail page)
 *   GET    ?admin=1  (admin)     -> any service by _id or slug (drafts too)
 *   PUT    (admin, _id)          -> update a service (card + page content)
 *   DELETE (admin, _id)          -> soft-delete / archive a service
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { param: string } }
) {
  const { searchParams } = new URL(req.url);
  const param = params.param;
  if (searchParams.get('admin') === '1') {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;
    return controller.getOneForAdmin(req, param);
  }
  return controller.getBySlug(req, param);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { param: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.update(req, params.param);
  if (res.status < 400) {
    revalidatePath('/services', 'layout');
    revalidatePath('/', 'layout');
  }
  return res;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { param: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.archive(req, params.param);
  if (res.status < 400) {
    revalidatePath('/services', 'layout');
    revalidatePath('/', 'layout');
  }
  return res;
}
