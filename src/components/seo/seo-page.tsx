import { StructuredData } from '@/components/seo/structured-data';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';
import { generateOrganizationLd, generateWebSiteLd } from '@/lib/seo/structured-data';

interface SeoPageProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  includeOrgSchema?: boolean;
  includeWebSiteSchema?: boolean;
  structuredData?: Record<string, unknown>[];
}

/**
 * SEO page wrapper.
 * Wraps page content with optional breadcrumbs, org/web site schema.
 */
export function SeoPage({
  children,
  breadcrumbs,
  includeOrgSchema = false,
  includeWebSiteSchema = false,
  structuredData,
}: SeoPageProps) {
  return (
    <>
      {includeOrgSchema && <StructuredData data={generateOrganizationLd()} />}
      {includeWebSiteSchema && <StructuredData data={generateWebSiteLd()} />}
      {structuredData?.map((data, i) => (
        <StructuredData key={i} data={data} />
      ))}
      {breadcrumbs && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      {children}
    </>
  );
}
