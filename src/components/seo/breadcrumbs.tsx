import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { StructuredData } from './structured-data';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb component with BreadcrumbList JSON-LD.
 * Per spec §90: all public SEO pages must use breadcrumbs.
 *
 * Example:
 *   <Breadcrumbs items={[
 *     { label: 'DevJoo', href: '/' },
 *     { label: 'پروژه‌ها', href: '/projects' },
 *     { label: 'برنامه‌نویسی', href: '/projects/development' },
 *   ]} />
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const ld = generateBreadcrumbLd(
    items.map((item) => ({ name: item.label, href: item.href }))
  );

  return (
    <>
      <StructuredData data={ld} />
      <nav aria-label="مسیر صفحه">
        <ol className="flex items-center gap-1.5 text-sm text-text-secondary flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-text-secondary/50" />
                )}
                {isLast ? (
                  <span className="text-text-primary font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
