import { db } from '@/lib/db';

/**
 * GET /api/v1/skills
 * Public: list skills. Supports ?categoryId= and ?search=
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    // If searching, use synonym system
    if (search && search.trim().length > 0) {
      const normalized = search.trim().replace(/\s+/g, '').toLowerCase();
      const skills = await db.skill.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: search.trim() } },
            { slug: { contains: search.trim().toLowerCase() } },
            { synonyms: { some: { normalized: { contains: normalized } } } },
          ],
        },
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
      });
      return Response.json({ data: skills });
    }

    // Filter by category
    const where = categoryId
      ? { categoryId, isActive: true }
      : { isActive: true };

    const skills = await db.skill.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    });

    return Response.json({ data: skills });
  } catch (error) {
    console.error('[Skills GET Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
