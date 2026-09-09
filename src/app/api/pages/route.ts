import { NextRequest } from 'next/server';
import { PageController } from '@/controllers/PageController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new PageController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return controller.create(req);
}
