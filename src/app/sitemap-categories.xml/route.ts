import { db } from '@/lib/db';
import { siteConfig } from '@/config/site';

/**
 * Sitemap for categories and skills.
 * Skill pages are indexable SEO landing pages per spec §81.
 */
export async function GET() {
  const siteUrl = siteConfig.url;

  const [categories, skills] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, parentId: null },
      select: { slug: true, updatedAt: true },
      orderBy: { displayOrder: 'asc' },
    }),
    db.skill.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const entries: { loc: string; lastmod: string }[] = [
    // Category pages
    ...categories.map((c) => ({
      loc: `${siteUrl}/projects/${c.slug}`,
      lastmod: c.updatedAt.toISOString(),
    })),
    // Skill pages
    ...skills.map((s) => ({
      loc: `${siteUrl}/projects/${s.slug}`,
      lastmod: s.updatedAt.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
