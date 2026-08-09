import { siteConfig } from '@/config/site';

/**
 * Build a canonical URL from a path.
 * Strips trailing slashes and query params.
 */
export function buildCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slash (except root)
  const normalized = cleanPath === '/' ? cleanPath : cleanPath.replace(/\/+$/, '');
  return `${siteConfig.url}${normalized}`;
}

/**
 * Get the site URL (from env config, never hardcoded).
 */
export function getSiteUrl(): string {
  return siteConfig.url;
}
