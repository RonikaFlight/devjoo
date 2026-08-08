import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionCookieOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

interface GithubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GithubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * POST /api/v1/auth/oauth/github
 * Exchange GitHub authorization code for a session.
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

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        { error: { code: 'CONFIG_ERROR', message: 'GitHub OAuth تنظیم نشده است.' } },
        { status: 503 }
      );
    }

    // Exchange code for token
    const tokenRes = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('[GitHub OAuth] Token exchange failed:', await tokenRes.text());
      return Response.json(
        { error: { code: 'OAUTH_ERROR', message: 'خطا در ارتباط با GitHub.' } },
        { status: 401 }
      );
    }

    const tokenData: GithubTokenResponse = await tokenRes.json();

    // Get user info
    const userRes = await fetch(GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
    });

    if (!userRes.ok) {
      return Response.json(
        { error: { code: 'OAUTH_ERROR', message: 'خطا در دریافت اطلاعات کاربر GitHub.' } },
        { status: 401 }
      );
    }

    const githubUser: GithubUser = await userRes.json();
    const providerAccountId = String(githubUser.id);

    // Find existing OAuth account
    let oauthAccount = await db.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'GITHUB',
          providerAccountId,
        },
      },
      include: { user: { include: { roles: { include: { role: true } }, profile: true } } },
    });

    let user: NonNullable<typeof oauthAccount>['user'];

    if (oauthAccount) {
      user = oauthAccount.user;
      // Update access token
      await db.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: { accessToken: tokenData.access_token },
      });
    } else {
      // Check if user exists with this email
      if (githubUser.email) {
        const existingUser = await db.user.findUnique({
          where: { email: githubUser.email },
          include: { roles: { include: { role: true } }, profile: true },
        });
        if (existingUser) {
          user = existingUser;
          await db.oAuthAccount.create({
            data: {
              userId: user.id,
              provider: 'GITHUB',
              providerAccountId,
              accessToken: tokenData.access_token,
            },
          });
        }
      }

      if (!user) {
        user = await db.user.create({
          data: {
            email: githubUser.email,
            displayName: githubUser.name || githubUser.login,
            oauthAccounts: {
              create: {
                provider: 'GITHUB',
                providerAccountId,
                accessToken: tokenData.access_token,
              },
            },
          },
          include: { roles: { include: { role: true } }, profile: true },
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
            avatarUrl: githubUser.avatar_url || user.profile?.avatarUrl,
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
    console.error('[GitHub OAuth Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
