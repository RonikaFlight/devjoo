import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'فریلنسرها',
  description:
    'مشاهده لیست فریلنسرهای متخصص DevJoo. برنامه‌نویس، طراح UI/UX، متخصص سئو و سایر متخصصین دیجیتال را پیدا کنید.',
  path: '/freelancers',
});

const popularSkills = [
  'React', 'Next.js', 'Python', 'WordPress', 'UI/UX', 'Node.js', 'Laravel', 'Flutter', 'SEO', 'TypeScript',
];

export default function FreelancersPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'فریلنسرها' },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            فریلنسرها
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary leading-relaxed">
            از بین متخصصان حرفه‌ای، فریلنسر مناسب پروژه خود را پیدا کنید.
          </p>
        </section>

        {/* Search Bar */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="جستجوی نام، تخصص یا مهارت..."
              className="w-full rounded-xl border border-border bg-surface py-3 ps-10 pe-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              readOnly
            />
          </div>
        </div>

        {/* Skill Chips */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-text-primary mb-3">مهارت‌های پرطرفدار</h2>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="cursor-pointer hover:bg-primary-soft hover:text-primary transition-colors py-1.5 px-3"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <Users className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            هنوز فریلنسری ثبت‌نام نکرده است.
          </h2>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            به‌زودی فریلنسرهای متخصص به پلتفرم اضافه خواهند شد. شما هم می‌توانید اولین باشید.
          </p>
          <Button asChild>
            <Link href="/auth/register">
              ثبت‌نام به عنوان فریلنسر
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
