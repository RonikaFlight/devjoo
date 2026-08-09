import { siteConfig } from '@/config/site';

const isProduction = process.env.NODE_ENV === 'production';

export function GET() {
  const siteUrl = siteConfig.url;

  const disallowed = [
    '/api/',
    '/dashboard/',
    '/settings/',
    '/messages/',
    '/admin/',
    '/auth/',
  ];

  // In development, also block the preview domain
  const body = isProduction
    ? `User-agent: *
Allow: /

${disallowed.map((d) => `Disallow: ${d}`).join('\n')}

Sitemap: ${siteUrl}/sitemap-index.xml\n`
    : `User-agent: *
Disallow: /

# Dev environment - block all indexing
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
