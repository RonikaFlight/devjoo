import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { PackageOpen, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const readableSlug = slug.replace(/-/g, ' ');
  return generatePageMetadata({
    title: readableSlug,
    description: `مشاهده جزئیات خدمت ${readableSlug} در DevJoo. قیمت، زمان تحویل و سفارش آنلاین.`,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const readableSlug = slug.replace(/-/g, ' ');

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'خدمات', href: '/services' },
              { label: readableSlug },
            ]}
          />
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <PackageOpen className="h-10 w-10 text-primary/40" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            این خدمت در دسترس نیست.
          </h1>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            خدمت مورد نظر یافت نشد یا حذف شده است.
          </p>
          <Button asChild>
            <Link href="/services">
              مشاهده خدمات
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
