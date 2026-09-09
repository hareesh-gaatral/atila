import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ServiceController } from '@/controllers/ServiceController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new ServiceController();

/**
 * /api/services
 *
 *   GET  (public)                 -> published services (index/home cards)
 *   GET  ?menu=1  (public)        -> nav dropdown items
 *   GET  ?all=1   (admin)         -> every service (drafts + archived included)
 *   POST (admin)                  -> create a service
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Admin listing includes drafts/archived — guard it.
  if (searchParams.get('all') === '1') {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;
  }
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.create(req);
  if (res.status < 400) {
    revalidatePath('/services', 'layout');
    revalidatePath('/', 'layout');
  }
  return res;
}
