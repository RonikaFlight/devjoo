import { db } from '@/lib/db';
import { siteConfig } from '@/config/site';

/**
 * Sitemap for category pages, skill pages, hire pages, and static pages.
 * Per spec §81: skill pages are indexable SEO landing pages.
 */
export async function GET() {
  const siteUrl = siteConfig.url;
  const now = new Date().toISOString();

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

  // Hire role slugs (static, known at build time)
  const hireRoles = [
    'react-developer', 'nextjs-developer', 'nodejs-developer', 'python-developer',
    'wordpress-developer', 'laravel-developer', 'flutter-developer', 'javascript-developer',
    'typescript-developer', 'ui-ux-designer', 'figma-designer', 'graphic-designer',
    'seo-specialist', 'frontend-developer', 'mobile-developer',
  ];

  const entries: { loc: string; lastmod: string }[] = [
    // Static pages
    { loc: `${siteUrl}/categories`, lastmod: now },
    { loc: `${siteUrl}/hire`, lastmod: now },
    // Category pages: /projects/[slug]
    ...categories.map((c) => ({
      loc: `${siteUrl}/projects/${c.slug}`,
      lastmod: c.updatedAt.toISOString(),
    })),
    // Skill pages: /projects/skills/[slug]
    ...skills.map((s) => ({
      loc: `${siteUrl}/projects/skills/${s.slug}`,
      lastmod: s.updatedAt.toISOString(),
    })),
    // Hire pages: /hire/[role]
    ...hireRoles.map((role) => ({
      loc: `${siteUrl}/hire/${role}`,
      lastmod: now,
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
