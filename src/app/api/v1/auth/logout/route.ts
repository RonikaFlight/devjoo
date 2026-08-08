import { destroySession, getSessionUser, TOKEN_NAME, getSessionCookieOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/v1/auth/logout
 * Logout the current user.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (token) {
      const payload = await getSessionUser(token);
      if (payload) {
        await destroySession(payload.session.id);
      }
    }

    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        data: { message: 'با موفقیت خارج شدید.' },
      },
      { status: 200 }
    );

    response.cookies.set(cookieOptions.name, '', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[Logout Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'خطای داخلی سرور.',
        },
      },
      { status: 500 }
    );
  }
}
