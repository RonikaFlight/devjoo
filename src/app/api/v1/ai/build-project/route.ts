import { NextResponse } from 'next/server';
import { requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { buildProjectSchema } from '@/lib/validators/ai';
import { isFeatureEnabled } from '@/config/feature-flags';
import { isAIConfigured, AIError } from '@/modules/ai/provider';
import * as projectBuilder from '@/modules/ai/project-builder';
import { createRateLimitGuard, getClientIp } from '@/lib/security/rate-limiter';
import { logger } from '@/lib/logger';

const aiRateLimit = createRateLimitGuard('ai', (req) => `ai:${getClientIp(req)}`);

/**
 * POST /api/v1/ai/build-project — AI Project Builder
 * Takes a brief description and generates a structured project draft.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || '';
  const reqLogger = logger.child({ requestId, path: '/api/v1/ai/build-project', method: 'POST' });

  try {
    // Rate limit before expensive AI call
    const rlResponse = aiRateLimit(request);
    if (rlResponse) return rlResponse;

    // Check feature flag
    if (!isFeatureEnabled('aiProjectBuilder')) {
      return NextResponse.json(
        { error: { code: 'FEATURE_DISABLED', message: 'این قابلیت در حال حاضر غیرفعال است.' }, requestId },
        { status: 403 }
      );
    }

    // Check AI configuration
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: { code: 'AI_NOT_CONFIGURED', message: 'سرویس هوش مصنوعی تنظیم نشده است.' }, requestId },
        { status: 503 }
      );
    }

    // Require employer role
    const { user } = await requireRole('EMPLOYER');

    // Parse and validate input
    const body = await request.json();
    const input = buildProjectSchema.parse(body);

    reqLogger.info('AI project build request', { userId: user.id });

    // Generate project
    const { result, meta } = await projectBuilder.buildProject(input);

    reqLogger.info('AI project build completed', {
      userId: user.id,
      tokensUsed: meta.totalTokens,
    });

    return NextResponse.json({
      data: {
        ...result,
        generatedFrom: {
          brief: input.brief,
        },
      },
      meta: {
        tokensUsed: meta.totalTokens,
        model: 'ai',
      },
      requestId,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    if (error instanceof AIError) {
      reqLogger.error('AI project build error', error);
      const statusMap: Record<string, number> = {
        CONFIG_MISSING: 503,
        PROVIDER_ERROR: error.statusCode ?? 502,
        EMPTY_RESPONSE: 502,
        PARSE_ERROR: 502,
        INVALID_OUTPUT: 422,
        INVALID_BUDGET: 422,
      };
      return NextResponse.json(
        { error: { code: error.code, message: error.message }, requestId },
        { status: statusMap[error.code] ?? 500 }
      );
    }
    if (error instanceof Error && error.message.includes('Zod')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message }, requestId },
        { status: 400 }
      );
    }
    reqLogger.error('AI project build failed', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' }, requestId },
      { status: 500 }
    );
  }
}
