import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface PageSeoParams {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Generate full Next.js Metadata for any public page.
 * Titles target user intent first, brand second (per spec §78).
 */
export function generatePageMetadata({
  title,
  description,
  path,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authors,
  image,
  noindex = false,
  nofollow = false,
}: PageSeoParams): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image
    ? `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.seo.ogImage}`;

  const base: Metadata = {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  if (ogType === 'article' && publishedTime) {
    base.openGraph = {
      ...base.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: authors || [siteConfig.name],
    };
  }

  return base;
}

/**
 * Convenience: generate metadata for filter/search pages (noindex, follow).
 */
export function generateFilterPageMetadata({
  title,
  description,
  path,
}: Omit<PageSeoParams, 'noindex' | 'nofollow'>): Metadata {
  return generatePageMetadata({
    title,
    description,
    path,
    noindex: true,
    nofollow: false,
  });
}

/**
 * Convenience: generate metadata for private pages (noindex, nofollow).
 */
export function generatePrivatePageMetadata({
  title,
  description,
}: {
  title: string;
  description?: string;
}): Metadata {
  return {
    title,
    ...(description && { description }),
    robots: { index: false, follow: false },
  };
}
