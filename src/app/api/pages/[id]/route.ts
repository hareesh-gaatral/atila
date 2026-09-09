import { NextRequest } from 'next/server';
import { PageController } from '@/controllers/PageController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new PageController();

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
  return controller.update(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return controller.delete(req, params.id);
}
