import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generatePageMetadata({
  title: 'وبلاگ',
  description: 'مقالات و راهنماهای فریلنسری، برنامه‌نویسی، طراحی وب و مدیریت پروژه در وبلاگ DevJoo.',
  path: '/blog',
});

export default function BlogPage() {
  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'وبلاگ', href: '/blog' },
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'وبلاگ' },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">وبلاگ DevJoo</h1>
          <p className="mt-2 text-muted-foreground">
            مقالات و راهنماهای تخصصی در حوزه فریلنسری، برنامه‌نویسی و پروژه‌های دیجیتال.
          </p>
        </div>

        {/* Empty State */}
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            هنوز مقاله‌ای منتشر نشده است.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            به زودی مقالات تخصصی در حوزه فریلنسری و تکنولوژی منتشر خواهیم کرد.
          </p>
        </div>

        {/* Internal Linking */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">مطالب پیشنهادی</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              در حال حاضر می‌توانید{' '}
              <Link href="/projects" className="text-primary hover:underline">
                پروژه‌های فریلنسری
              </Link>{' '}
              را مشاهده کنید یا از{' '}
              <Link href="/categories" className="text-primary hover:underline">
                دسته‌بندی‌ها
              </Link>{' '}
              حوزه مورد علاقه خود را پیدا کنید.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
