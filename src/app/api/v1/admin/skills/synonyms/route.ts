import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import {
  listSkillSynonyms,
  createSkillSynonym,
} from '@/modules/admin/service';
import { skillSynonymSchema } from '@/lib/validators/taxonomy';

/**
 * GET /api/v1/admin/skills/synonyms — list synonyms for a skill
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'پارامتر skillId الزامی است',
          },
        },
        { status: 400 }
      );
    }

    const result = await listSkillSynonyms(skillId);

    return NextResponse.json({ synonyms: result });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/skills/synonyms — create a new skill synonym
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);

    const body = await request.json();
    const parsed = skillSynonymSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'داده‌های ورودی نامعتبر',
            details: parsed.error.issues.map((e) => e.message),
          },
        },
        { status: 400 }
      );
    }

    const result = await createSkillSynonym(user.id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ synonym: result.synonym });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'داده‌های ورودی نامعتبر',
            details: error.issues.map((e) => e.message),
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}
