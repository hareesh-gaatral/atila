import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ServiceController } from '@/controllers/ServiceController';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { services as staticServices } from '@/data/services';

/**
 * /api/services
 *
 *   GET  (public)                 -> published services (index/home cards)
 *   GET  ?menu=1  (public)        -> nav dropdown items
 *   GET  ?all=1   (admin)         -> every service (drafts + archived included)
 *   POST (admin)                  -> create a service
 *
 * Returns the static JSON catalog when MongoDB is unreachable so the
 * navbar dropdown and home-page cards still render.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Admin listing includes drafts/archived — guard it.
  if (searchParams.get('all') === '1') {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;
  }

  try {
    const controller = new ServiceController();
    return await controller.getAll(req);
  } catch {
    // DB unavailable — fall back to static catalog so the dropdown still works.
    let items = staticServices as any[];
    if (searchParams.get('menu') === '1') {
      items = items.filter((s) => s.showInMenu !== false);
    }
    return NextResponse.json({ success: true, data: items });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const controller = new ServiceController();
  const res = await controller.create(req);
  if (res.status < 400) {
    revalidatePath('/services', 'layout');
    revalidatePath('/', 'layout');
  }
  return res;
}
