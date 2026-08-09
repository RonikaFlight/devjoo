import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { notificationPreferencesBatchSchema } from '@/lib/validators/notification';
import * as notificationService from '@/modules/notifications/service';

/**
 * GET /api/v1/me/notifications/preferences — get user's notification preferences
 */
export async function GET() {
  try {
    const { user } = await requireAuth();
    const result = await notificationService.getNotificationPreferences(user.id);
    return NextResponse.json({ data: result.preferences });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/me/notifications/preferences — update notification preferences
 */
export async function PUT(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = notificationPreferencesBatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.issues.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const result = await notificationService.updateNotificationPreferences(
      user.id,
      parsed.data.preferences
    );

    return NextResponse.json({ data: result.preferences });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
