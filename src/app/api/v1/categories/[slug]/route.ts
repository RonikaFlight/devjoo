import { db } from '@/lib/db';

/**
 * GET /api/v1/categories/[slug]
 * Public: get a single category by slug with skills.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await db.category.findUnique({
      where: { slug, isActive: true },
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { projects: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    if (!category) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'دسته‌بندی یافت نشد.' } },
        { status: 404 }
      );
    }

    return Response.json({ data: category });
  } catch (error) {
    console.error('[Category GET Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
