import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SectionController } from '@/controllers/SectionController';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const controller = new SectionController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const res = await controller.create(req);
  if (res.status < 400) revalidatePath('/', 'layout');
  return res;
}
