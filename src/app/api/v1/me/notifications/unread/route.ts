import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import * as notificationService from '@/modules/notifications/service';

/**
 * GET /api/v1/me/notifications/unread — get unread notification count
 */
export async function GET() {
  try {
    const { user } = await requireAuth();
    const result = await notificationService.getUnreadNotificationCount(user.id);
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
