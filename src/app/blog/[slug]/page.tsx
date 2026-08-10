import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const readableSlug = slug.replace(/-/g, ' ');
  return generatePageMetadata({
    title: readableSlug,
    description: `مقاله ${readableSlug} در وبلاگ DevJoo. مقالات تخصصی درباره فریلنسری و تکنولوژی.`,
    path: `/blog/${slug}`,
    ogType: 'article',
  });
}

export default async function BlogPostPage({ params }: Props) {
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
              { label: 'وبلاگ', href: '/blog' },
              { label: readableSlug },
            ]}
          />
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <FileText className="h-10 w-10 text-primary/40" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            این مقاله در دسترس نیست.
          </h1>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            مقاله مورد نظر یافت نشد یا هنوز منتشر نشده است.
          </p>
          <Button asChild>
            <Link href="/blog">
              بازگشت به وبلاگ
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
