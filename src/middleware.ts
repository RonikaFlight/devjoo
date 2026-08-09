import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TOKEN_NAME } from '@/lib/auth/session-edge';
import { getSecurityHeaders, getCorsHeaders } from '@/lib/security/headers';
import { getOrCreateRequestId } from '@/lib/security/request-id';

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff2', '.woff', '.json', '.xml',
];

const isProduction = process.env.NODE_ENV === 'production';

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

  // Generate or propagate request ID
  const requestId = getOrCreateRequestId(request);

  // Handle CORS preflight for API routes
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin, isProduction);
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
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
      const auth = await checkAuth(request);
      if (!auth) return auth;
    }

    if (!isAuthApi) {
      const auth = await checkAuth(request);
      if (!auth) return auth;
    }

    // Add security headers + CORS + request ID to API responses
    const response = NextResponse.next();
    const securityHeaders = getSecurityHeaders({ isProduction });
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin, isProduction);

    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    response.headers.set('x-request-id', requestId);

    return response;
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

  // Add security headers to page responses
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders({ isProduction });
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set('x-request-id', requestId);

  return response;
}

async function checkAuth(request: NextRequest): Promise<NextResponse<unknown> | null> {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
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

  return null;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
