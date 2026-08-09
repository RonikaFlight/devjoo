/**
 * JSON-LD Structured Data Helpers
 * All helpers return plain objects — render with <script type="application/ld+json">.
 */

import { siteConfig } from '@/config/site';

interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * BreadcrumbList structured data.
 * Per spec §90: all public SEO pages must use breadcrumbs.
 */
export function generateBreadcrumbLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}

/**
 * Organization structured data (homepage).
 */
export function generateOrganizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DevJoo',
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.svg`,
    sameAs: [],
  };
}

/**
 * WebSite structured data (homepage).
 */
export function generateWebSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevJoo',
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
    description: siteConfig.description,
  };
}

/**
 * ProfilePage structured data (freelancer profiles).
 */
export function generateProfilePageLd(params: {
  name: string;
  username: string;
  headline?: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: params.name,
      url: `${siteConfig.url}${params.url}`,
      jobTitle: params.headline,
      image: params.image
        ? `${siteConfig.url}${params.image}`
        : undefined,
    },
  };
}

/**
 * Article structured data (blog posts).
 */
export function generateArticleLd(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: `${siteConfig.url}${params.url}`,
    image: params.image
      ? `${siteConfig.url}${params.image}`
      : undefined,
    datePublished: params.publishedTime,
    dateModified: params.modifiedTime || params.publishedTime,
    author: {
      '@type': 'Organization',
      name: params.authorName || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.svg`,
      },
    },
  };
}

/**
 * FAQPage structured data.
 * Only use when genuinely eligible (per spec §89).
 */
export function generateFaqLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * ItemList structured data (project/freelancer listings).
 */
export function generateItemListLd(params: {
  name: string;
  url: string;
  items: { name: string; url: string; position: number }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: params.name,
    url: `${siteConfig.url}${params.url}`,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: `${siteConfig.url}${item.url}`,
    })),
  };
}
