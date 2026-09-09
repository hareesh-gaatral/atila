import { NextRequest } from 'next/server';
import { MediaController } from '@/controllers/MediaController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new MediaController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return controller.upload(req);
}
