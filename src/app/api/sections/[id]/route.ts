import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SectionController } from '@/controllers/SectionController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new SectionController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.getById(req, params.id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.update(req, params.id);
  if (res.status < 400) revalidatePath('/', 'layout');
  return res;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.delete(req, params.id);
  if (res.status < 400) revalidatePath('/', 'layout');
  return res;
}
