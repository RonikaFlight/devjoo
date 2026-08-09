import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { conversationCreateSchema, conversationFiltersSchema } from '@/lib/validators/conversation';
import * as messagingService from '@/modules/messaging/service';

/**
 * GET /api/v1/conversations — list user's conversations
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = conversationFiltersSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });

    const result = await messagingService.listConversations(user.id, filters);
    return NextResponse.json({ data: result.conversations, meta: result.meta });
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
 * POST /api/v1/conversations — create or find conversation
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = conversationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.issues.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const result = await messagingService.findOrCreateConversation(user.id, parsed.data);

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        SELF_CONVERSATION: 400,
        NOT_FOUND: 404,
        USER_INACTIVE: 400,
        PROJECT_NOT_FOUND: 404,
        FORBIDDEN: 403,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error!] || 400 }
      );
    }

    return NextResponse.json({ data: result.conversation }, { status: 201 });
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
