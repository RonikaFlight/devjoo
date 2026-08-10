import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'خدمات',
  description:
    'مشاهده خدمات فریلنسرهای DevJoo. طراحی وب، برنامه‌نویسی، سئو و خدمات دیجیتال با قیمت مشخص و تحویل سریع.',
  path: '/services',
});

const categories = [
  'برنامه‌نویسی وب',
  'اپلیکیشن موبایل',
  'طراحی UI/UX',
  'سئو و دیجیتال مارکتینگ',
  'هوش مصنوعی',
  'طراحی گرافیک',
];

export default function ServicesPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'خدمات' },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            خدمات
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary leading-relaxed">
            خدمات آماده با قیمت مشخص و زمان تحویل مشخص. بدون نیاز به ثبت پروژه، مستقیم سفارش دهید.
          </p>
        </section>

        {/* Search */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="جستجوی خدمت..."
              className="w-full rounded-xl border border-border bg-surface py-3 pr-10 pl-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              readOnly
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-text-primary mb-3">دسته‌بندی‌ها</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="cursor-pointer hover:bg-primary-soft hover:text-primary transition-colors py-1.5 px-3"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <Package className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            هنوز خدمتی ثبت نشده است.
          </h2>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            فریلنسرها به‌زودی خدمات خود را اضافه خواهند کرد. اگر فریلنسر هستید، همین الان خدمات خود را ثبت کنید.
          </p>
          <Button asChild>
            <Link href="/dashboard/freelancer/services">
              ثبت خدمات
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
