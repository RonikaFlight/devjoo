import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { notificationFiltersSchema, notificationMarkReadSchema } from '@/lib/validators/notification';
import * as notificationService from '@/modules/notifications/service';

/**
 * GET /api/v1/me/notifications — list user's notifications
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = notificationFiltersSchema.parse({
      isRead: searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined,
      type: searchParams.get('type') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 30,
    });

    const result = await notificationService.listNotifications(user.id, filters);
    return NextResponse.json({ data: result.notifications, meta: result.meta });
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
 * PATCH /api/v1/me/notifications — mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = notificationMarkReadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.errors.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const result = await notificationService.markNotificationsRead(user.id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result });
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
