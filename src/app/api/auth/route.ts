import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/AuthController';

const controller = new AuthController();

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'login') {
    return controller.login(req);
  }
  if (action === 'refresh') {
    return controller.refreshToken(req);
  }
  if (action === 'logout') {
    return controller.logout(req);
  }
  if (action === 'me') {
    return controller.getMe(req);
  }

  return controller.signup(req);
}
