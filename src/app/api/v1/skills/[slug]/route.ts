import { db } from '@/lib/db';

/**
 * GET /api/v1/skills/[slug]
 * Public: get a single skill by slug.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const skill = await db.skill.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        synonyms: { select: { name: true } },
      },
    });

    if (!skill) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'مهارت یافت نشد.' } },
        { status: 404 }
      );
    }

    return Response.json({ data: skill });
  } catch (error) {
    console.error('[Skill GET Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
