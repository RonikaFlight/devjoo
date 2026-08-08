import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/v1/auth/me
 * Get current authenticated user info.
 */
export async function GET() {
  try {
    const auth = await getAuthUser();

    if (!auth) {
      return Response.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'لطفاً وارد حساب کاربری خود شوید.',
          },
        },
        { status: 401 }
      );
    }

    return Response.json({
      data: {
        user: {
          id: auth.user.id,
          email: auth.user.email,
          phone: auth.user.phone,
          displayName: auth.user.displayName,
          roles: auth.user.roles.map((r) => r.role.name),
          profile: auth.user.profile,
          needsOnboarding: !isOnboardingComplete(auth.user),
        },
      },
    });
  } catch (error) {
    console.error('[Auth Me Error]', error);
    return Response.json(
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

function isOnboardingComplete(user: { roles: { role: { name: string } }[]; profile: { displayName: string | null } | null }): boolean {
  if (user.roles.length === 0) return false;
  if (!user.profile?.displayName) return false;
  return true;
}
