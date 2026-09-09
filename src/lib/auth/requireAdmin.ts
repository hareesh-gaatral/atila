import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './tokens';
import { UserRepository } from '@/repository/UserRepository';
import { connectDB } from '@/lib/database/connect';

/**
 * Server-side guard for admin-only API routes.
 *
 * Reads the access token from the HttpOnly cookie, verifies the JWT, then
 * loads the user from the database so a stale/forged `role` claim on the token
 * is never trusted. Returns `{ authorized: true, user }` or a ready-to-return
 * error NextResponse.
 */
export async function requireAdmin(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const accessToken = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('accessToken='))
      ?.split('=')[1];

    if (!accessToken) {
      return {
        authorized: false as const,
        response: NextResponse.json(
          { success: false, error: 'Not authenticated' },
          { status: 401 }
        ),
      };
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !decoded.userId) {
      return {
        authorized: false as const,
        response: NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    await connectDB();
    const userRepo = new UserRepository();
    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      return {
        authorized: false as const,
        response: NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 401 }
        ),
      };
    }

    if (user.role !== 'admin') {
      return {
        authorized: false as const,
        response: NextResponse.json(
          { success: false, error: 'Forbidden. Admin access required.' },
          { status: 403 }
        ),
      };
    }

    return { authorized: true as const, user };
  } catch (error: any) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { success: false, error: error.message || 'Server error' },
        { status: 500 }
      ),
    };
  }
}

export type AdminAuthResult = Awaited<ReturnType<typeof requireAdmin>>;
