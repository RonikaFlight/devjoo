import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import * as messagingService from '@/modules/messaging/service';

/**
 * GET /api/v1/conversations/[id] — get conversation details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const result = await messagingService.getConversation(id, user.id);

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error] || 400 }
      );
    }

    return NextResponse.json({ data: result.conversation });
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
