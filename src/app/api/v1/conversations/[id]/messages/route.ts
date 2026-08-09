import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { messageSendSchema, messageFiltersSchema } from '@/lib/validators/message';
import * as messagingService from '@/modules/messaging/service';

/**
 * GET /api/v1/conversations/[id]/messages — list messages
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const filters = messageFiltersSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    });

    const result = await messagingService.listMessages(id, user.id, filters);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: result.messages, meta: result.meta });
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
 * POST /api/v1/conversations/[id]/messages — send a message
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const parsed = messageSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.errors.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const result = await messagingService.sendMessage(id, user.id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: result.message }, { status: 201 });
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
