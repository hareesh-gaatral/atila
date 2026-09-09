import { NextRequest } from 'next/server';
import { SettingsController } from '@/controllers/SettingsController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new SettingsController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (key) {
    return controller.getByKey(req, key);
  }
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return controller.set(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    return Response.json({ success: false, error: 'Key is required' }, { status: 400 });
  }
  return controller.delete(req, key);
}
