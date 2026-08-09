import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import {
  listAdminSkills,
  createAdminSkill,
} from '@/modules/admin/service';
import { skillCreateSchema } from '@/lib/validators/taxonomy';

/**
 * GET /api/v1/admin/skills — list skills with optional categoryId filter
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId') || undefined;

    const result = await listAdminSkills(categoryId);

    return NextResponse.json({ skills: result });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/skills — create a new skill
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);

    const body = await request.json();
    const parsed = skillCreateSchema.safeParse(body);
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

    const result = await createAdminSkill(user.id, parsed.data);

    return NextResponse.json({ skill: result.skill });
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
