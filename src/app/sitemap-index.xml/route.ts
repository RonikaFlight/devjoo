import { siteConfig } from '@/config/site';

/**
 * Sitemap Index — references individual sitemaps.
 * Per spec §87: sitemap-projects, sitemap-skills, sitemap-categories,
 * sitemap-freelancers, sitemap-services, sitemap-blog.
 * Currently returns static entries; will be dynamic when data exists.
 */
export function GET() {
  const siteUrl = siteConfig.url;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-projects.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-blog.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
