import { db } from '@/lib/db';
import { siteConfig } from '@/config/site';

/**
 * Dynamic sitemap for published projects.
 * Per spec §87: only canonical indexable URLs, lastmod reflects real changes.
 */
export async function GET() {
  const siteUrl = siteConfig.url;

  const projects = await db.project.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 1000,
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${projects
  .map(
    (p) => `  <url>
    <loc>${siteUrl}/project/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
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
