import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { generateProposalSchema } from '@/lib/validators/ai';
import { isFeatureEnabled } from '@/config/feature-flags';
import { isAIConfigured, AIError } from '@/modules/ai/provider';
import * as proposalAssistant from '@/modules/ai/proposal-assistant';

/**
 * POST /api/v1/ai/generate-proposal — AI Proposal Assistant
 * Generates a personalized proposal for a freelancer.
 */
export async function POST(request: Request) {
  try {
    // Check feature flag
    if (!isFeatureEnabled('aiProposalAssistant')) {
      return NextResponse.json(
        { error: { code: 'FEATURE_DISABLED', message: 'این قابلیت در حال حاضر غیرفعال است.' } },
        { status: 403 }
      );
    }

    // Check AI configuration
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: { code: 'AI_NOT_CONFIGURED', message: 'سرویس هوش مصنوعی تنظیم نشده است.' } },
        { status: 503 }
      );
    }

    // Require auth (freelancer only)
    const { user } = await requireAuth();

    // Parse and validate input
    const body = await request.json();
    const input = generateProposalSchema.parse(body);

    // Ensure the freelancer can only generate proposals for themselves
    if (input.freelancerId !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'شما فقط می‌توانید برای خودتان پیشنهاد تولید کنید.' } },
        { status: 403 }
      );
    }

    // Generate proposal
    const { result, meta } = await proposalAssistant.generateProposal(input);

    return NextResponse.json({
      data: result,
      meta: {
        tokensUsed: meta.totalTokens,
        model: 'ai',
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    if (error instanceof AIError) {
      const statusMap: Record<string, number> = {
        CONFIG_MISSING: 503,
        PROVIDER_ERROR: error.statusCode ?? 502,
        EMPTY_RESPONSE: 502,
        PARSE_ERROR: 502,
        INVALID_OUTPUT: 422,
        SHORT_COVER_LETTER: 422,
        PROJECT_NOT_FOUND: 404,
      };
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: statusMap[error.code] ?? 500 }
      );
    }
    if (error instanceof Error && error.message.includes('Zod')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
