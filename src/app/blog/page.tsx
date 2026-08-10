import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, DollarSign, Home, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'وبلاگ',
  description:
    'مقالات و راهنماهای تخصصی درباره فریلنسری، برنامه‌نویسی، طراحی وب، قیمت‌گذاری و دورکاری در وبلاگ DevJoo.',
  path: '/blog',
});

const blogCategories = [
  { name: 'تکنولوژی', icon: Code, slug: 'technology', count: 0 },
  { name: 'راهنما', icon: BookOpen, slug: 'guides', count: 0 },
  { name: 'قیمت‌گذاری', icon: DollarSign, slug: 'pricing', count: 0 },
  { name: 'دورکاری', icon: Home, slug: 'remote-work', count: 0 },
];

export default function BlogPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'وبلاگ' },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="mb-12">
          <div className="brand-gradient rounded-2xl p-8 sm:p-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              وبلاگ DevJoo
            </h1>
            <p className="mx-auto max-w-2xl text-white/85 text-base sm:text-lg leading-relaxed">
              مقالات تخصصی، راهنماهای کاربردی و تحلیل‌های صنعت فریلنسری و تکنولوژی دیجیتال.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-text-primary mb-4">دسته‌بندی‌ها</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {blogCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.slug}
                  className="card-base p-5 flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft mb-3 group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-1">{cat.name}</p>
                  <p className="text-xs text-text-muted">{cat.count} مقاله</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Empty State */}
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            به‌زودی مقالاتی منتشر خواهند شد.
          </h2>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            تیم محتوای DevJoo در حال آماده‌سازی مقالات تخصصی در حوزه‌های فریلنسری، برنامه‌نویسی و
            مدیریت پروژه است. ماندگار باشید.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Badge variant="secondary" className="py-1.5 px-3 text-sm">
              تکنولوژی
            </Badge>
            <Badge variant="secondary" className="py-1.5 px-3 text-sm">
              راهنما
            </Badge>
            <Badge variant="secondary" className="py-1.5 px-3 text-sm">
              قیمت‌گذاری
            </Badge>
            <Badge variant="secondary" className="py-1.5 px-3 text-sm">
              دورکاری
            </Badge>
          </div>
        </div>

        {/* Internal Linking */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">مطالب پیشنهادی</h2>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              در حال حاضر می‌توانید{' '}
              <Link href="/projects" className="text-primary hover:underline">
                پروژه‌های فریلنسری
              </Link>{' '}
              را مشاهده کنید یا{' '}
              <Link href="/freelancers" className="text-primary hover:underline">
                فریلنسرهای متخصص
              </Link>{' '}
              را پیدا کنید.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
