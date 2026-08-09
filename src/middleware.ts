import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TOKEN_NAME } from '@/lib/auth/session-edge';

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff2', '.woff', '.json', '.xml',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/og-image') ||
    pathname.startsWith('/sitemap-')
  ) {
    return NextResponse.next();
  }

  // API routes: check auth for protected endpoints
  if (pathname.startsWith('/api/v1/')) {
    const isAuthApi = pathname.startsWith('/api/v1/auth/');
    const isPublicAuthApi = [
      '/api/v1/auth/otp/request',
      '/api/v1/auth/otp/verify',
      '/api/v1/auth/otp/resend',
      '/api/v1/auth/oauth/google',
      '/api/v1/auth/oauth/github',
    ].some((p) => pathname.startsWith(p));

    if (isAuthApi && !isPublicAuthApi) {
      // Protected auth endpoints (register, me, logout, password)
      const auth = await checkAuth(request);
      if (!auth) return auth;
    }

    if (!isAuthApi) {
      // All non-auth API routes require authentication
      const auth = await checkAuth(request);
      if (!auth) return auth;
    }

    return NextResponse.next();
  }

  // Protected page routes
  if (pathname.startsWith('/dashboard/') || pathname.startsWith('/settings/') || pathname.startsWith('/admin/')) {
    const auth = await checkAuth(request);
    if (!auth) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

async function checkAuth(request: NextRequest): Promise<NextResponse<unknown> | null> {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
    // For API routes, return JSON error
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'لطفاً وارد حساب کاربری خود شوید.' } },
        { status: 401 }
      );
    }
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'نشست شما منقضی شده است.' } },
        { status: 401 }
      );
    }
    return null;
  }

  return null; // null means auth passed
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
