import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionCookieOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
  locale?: string;
}

/**
 * GET /api/v1/auth/oauth/google?callbackUrl=...
 * Redirect user to Google's OAuth consent screen.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    // If Google OAuth is not configured, return an error page
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_not_configured', request.url)
    );
  }

  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/dashboard';
  const state = Buffer.from(
    JSON.stringify({ callbackUrl, provider: 'google' }),
    'utf-8'
  ).toString('base64url');

  const redirectUri = `${new URL(request.url).origin}/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

/**
 * POST /api/v1/auth/oauth/google
 * Exchange Google authorization code for a session.
 */
export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'کد و آدرس بازگشت الزامی است.' } },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        { error: { code: 'CONFIG_ERROR', message: 'Google OAuth تنظیم نشده است.' } },
        { status: 503 }
      );
    }

    // Exchange code for token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[Google OAuth] Token exchange failed:', await tokenRes.text());
      return Response.json(
        { error: { code: 'OAUTH_ERROR', message: 'خطا در ارتباط با Google.' } },
        { status: 401 }
      );
    }

    const tokenData: GoogleTokenResponse = await tokenRes.json();

    // Get user info
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return Response.json(
        { error: { code: 'OAUTH_ERROR', message: 'خطا در دریافت اطلاعات کاربر Google.' } },
        { status: 401 }
      );
    }

    const googleUser: GoogleUserInfo = await userRes.json();

    if (!googleUser.verified_email) {
      return Response.json(
        { error: { code: 'EMAIL_NOT_VERIFIED', message: 'ایمیل Google شما تایید نشده است.' } },
        { status: 403 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: googleUser.email },
      include: { roles: { include: { role: true } }, profile: true, oauthAccounts: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: googleUser.email,
          displayName: googleUser.name || googleUser.email.split('@')[0],
          oauthAccounts: {
            create: {
              provider: 'GOOGLE',
              providerAccountId: googleUser.id,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
            },
          },
        },
        include: { roles: { include: { role: true } }, profile: true, oauthAccounts: true },
      });
    } else {
      // Update OAuth token
      const existingOauth = user.oauthAccounts.find(
        (a) => a.provider === 'GOOGLE'
      );
      if (existingOauth) {
        await db.oAuthAccount.update({
          where: { id: existingOauth.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || existingOauth.refreshToken,
          },
        });
      } else {
        await db.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerAccountId: googleUser.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
          },
        });
      }
    }

    // Create session
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);

    const hasRoles = user.roles.length > 0;
    const hasProfile = user.profile?.displayName;
    const needsOnboarding = !hasRoles || !hasProfile;

    // Set cookie
    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: googleUser.picture || user.profile?.avatarUrl,
            hasProfile: !!user.profile,
            roles: user.roles.map((r) => r.role.name),
          },
          needsOnboarding,
        },
      },
      { status: 200 }
    );

    response.cookies.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error('[Google OAuth Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
