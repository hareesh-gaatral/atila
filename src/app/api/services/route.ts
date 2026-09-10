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
 * Falls back to the static JSON catalog when MongoDB is unreachable or
 * returns no services, so the navbar dropdown and home-page cards always render.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Admin listing includes drafts/archived — guard it.
  if (searchParams.get('all') === '1') {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;
  }

  let fallbackItems = staticServices as any[];
  if (searchParams.get('menu') === '1') {
    fallbackItems = fallbackItems.filter((s) => s.showInMenu !== false);
  }

  try {
    const controller = new ServiceController();
    const res = await controller.getAll(req);

    // If the controller returned an error or an empty list, use the static fallback.
    if (res.status >= 400) {
      return NextResponse.json({ success: true, data: fallbackItems });
    }

    const body = await res.clone().json();
    if (body.success && Array.isArray(body.data) && body.data.length > 0) {
      return res;
    }

    // Empty DB result — merge: static catalog so the dropdown always has items.
    return NextResponse.json({ success: true, data: fallbackItems });
  } catch {
    // DB unavailable — fall back to static catalog.
    return NextResponse.json({ success: true, data: fallbackItems });
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
