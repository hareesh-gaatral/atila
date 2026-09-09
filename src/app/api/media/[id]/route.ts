import { NextRequest } from 'next/server';
import { MediaController } from '@/controllers/MediaController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new MediaController();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return controller.delete(req, params.id);
}
