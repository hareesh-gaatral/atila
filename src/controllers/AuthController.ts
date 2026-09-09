import { NextRequest } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/tokens';
import { ApiResponse } from '@/types';

const authService = new AuthService();

export class AuthController {
  async signup(req: NextRequest) {
    try {
      const { name, email, password } = await req.json();
      if (!name || !email || !password) {
        return Response.json({ success: false, error: 'All fields are required' } as ApiResponse, { status: 400 });
      }
      if (password.length < 6) {
        return Response.json({ success: false, error: 'Password must be at least 6 characters' } as ApiResponse, { status: 400 });
      }
      const result = await authService.signup(name, email, password);

      const response = Response.json({ success: true, data: result, message: 'Account created' } as ApiResponse, { status: 201 });

      const cookieResponse = new Response(response.body, response);
      cookieResponse.headers.set('Set-Cookie', [
        `accessToken=${result.accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900`,
        `refreshToken=${result.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
      ].join(', '));

      return cookieResponse;
    } catch (error: any) {
      return Response.json({ success: false, error: error.message } as ApiResponse, { status: 400 });
    }
  }

  async login(req: NextRequest) {
    try {
      const { email, password } = await req.json();
      if (!email || !password) {
        return Response.json({ success: false, error: 'Email and password are required' } as ApiResponse, { status: 400 });
      }
      const result = await authService.login(email, password);

      const response = Response.json({ success: true, data: result, message: 'Login successful' } as ApiResponse);

      const cookieResponse = new Response(response.body, response);
      cookieResponse.headers.set('Set-Cookie', [
        `accessToken=${result.accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900`,
        `refreshToken=${result.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
      ].join(', '));

      return cookieResponse;
    } catch (error: any) {
      return Response.json({ success: false, error: error.message } as ApiResponse, { status: 401 });
    }
  }

  async refreshToken(req: NextRequest) {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const refreshToken = cookieHeader.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];

      if (!refreshToken) {
        return Response.json({ success: false, error: 'Refresh token not found' } as ApiResponse, { status: 401 });
      }

      const tokens = await authService.refreshToken(refreshToken);

      const response = Response.json({ success: true, data: tokens } as ApiResponse);

      const cookieResponse = new Response(response.body, response);
      cookieResponse.headers.set('Set-Cookie', [
        `accessToken=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900`,
        `refreshToken=${tokens.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
      ].join(', '));

      return cookieResponse;
    } catch (error: any) {
      return Response.json({ success: false, error: error.message } as ApiResponse, { status: 401 });
    }
  }

  async logout(req: NextRequest) {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const refreshToken = cookieHeader.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];

      if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) {
          await authService.logout(decoded.userId);
        }
      }

      const response = Response.json({ success: true, message: 'Logged out' } as ApiResponse);

      const cookieResponse = new Response(response.body, response);
      cookieResponse.headers.set('Set-Cookie', [
        'accessToken=; Path=/; HttpOnly; Max-Age=0',
        'refreshToken=; Path=/; HttpOnly; Max-Age=0',
      ].join(', '));

      return cookieResponse;
    } catch (error: any) {
      return Response.json({ success: false, error: error.message } as ApiResponse, { status: 500 });
    }
  }

  async getMe(req: NextRequest) {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const accessToken = cookieHeader.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1];

      if (!accessToken) {
        return Response.json({ success: false, error: 'Not authenticated' } as ApiResponse, { status: 401 });
      }

      const decoded = verifyAccessToken(accessToken);
      if (!decoded) {
        return Response.json({ success: false, error: 'Invalid or expired token' } as ApiResponse, { status: 401 });
      }

      return Response.json({ success: true, data: { userId: decoded.userId, email: decoded.email, role: decoded.role } } as ApiResponse);
    } catch (error: any) {
      return Response.json({ success: false, error: error.message } as ApiResponse, { status: 500 });
    }
  }
}
