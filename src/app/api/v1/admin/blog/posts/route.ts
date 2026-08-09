import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import {
  listAdminBlogPosts,
  createAdminBlogPost,
} from '@/modules/admin/service';
import { adminBlogPostSchema } from '@/lib/validators/admin';

/**
 * GET /api/v1/admin/blog/posts — لیست پست‌های بلاگ با صفحه‌بندی
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const result = await listAdminBlogPosts(page, limit);

    return NextResponse.json({ posts: result.posts, meta: result.meta });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'پارامترهای ورودی نامعتبر هستند',
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

/**
 * POST /api/v1/admin/blog/posts — ایجاد پست جدید بلاگ
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);

    const body = await request.json();
    const parsed = adminBlogPostSchema.safeParse(body);
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

    const result = await createAdminBlogPost(user.id, parsed.data);

    return NextResponse.json({ post: result.post });
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
