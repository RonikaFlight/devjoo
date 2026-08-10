import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe, Smartphone, Palette, Brain, Server, Search,
  BarChart3, ShieldCheck, Image, Lock, ArrowLeft,
  Users, Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: 'استخدام فریلنسر و برنامه‌نویس',
  description:
    'استخدام فریلنسر برنامه‌نویس، طراح UI/UX، متخصص سئو و سایر متخصصین دیجیتال در DevJoo. بهترین متخصصین دورکاری را پیدا کنید.',
  path: '/hire',
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Smartphone, Palette, Brain, Server, Search,
  BarChart3, ShieldCheck, Image, Lock,
};

/** Map of popular skills to their hire-page slug */
const hireSkillMap: Record<string, string> = {
  react: 'react-developer',
  nextjs: 'nextjs-developer',
  'ui-design': 'ui-ux-designer',
  'ux-design': 'ui-ux-designer',
  seo: 'seo-specialist',
  python: 'python-developer',
  nodejs: 'nodejs-developer',
  wordpress: 'wordpress-developer',
  flutter: 'flutter-developer',
  figma: 'figma-designer',
  laravel: 'laravel-developer',
  javascript: 'javascript-developer',
  typescript: 'typescript-developer',
  'adobe-photoshop': 'graphic-designer',
  'adobe-illustrator': 'graphic-designer',
};

export default async function HirePage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      skills: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'استخدام فریلنسر', href: '/hire' },
  ]);

  // Collect popular hire links
  const hireLinks: { name: string; slug: string; categoryName: string }[] = [];
  for (const cat of categories) {
    for (const skill of cat.skills) {
      const hireSlug = hireSkillMap[skill.slug];
      if (hireSlug) {
        hireLinks.push({
          name: skill.name,
          slug: hireSlug,
          categoryName: cat.name,
        });
      }
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'استخدام فریلنسر' },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        {/* Hero */}
        <section className="mb-12">
          <div className="brand-gradient rounded-2xl p-8 sm:p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              متخصص مناسب پروژه‌ات را{' '}
              <span className="text-white/90">پیدا کن</span>
            </h1>
            <p className="mx-auto max-w-2xl text-white/85 text-base sm:text-lg leading-relaxed">
              از بین صدها فریلنسر تأییدشده، متخصص مورد نظر خود را برای پروژه‌های
              برنامه‌نویسی، طراحی، سئو و سایر حوزه‌های دیجیتال پیدا کنید.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="mb-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: Users, value: '۵۰۰+', label: 'فریلنسر فعال' },
            { icon: ShieldCheck, value: 'احراز هویت', label: 'تضمین شده' },
            { icon: Zap, value: 'سریع', label: 'پیدا کردن متخصص' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Popular Hire Links */}
        {hireLinks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary" />
              استخدام بر اساس تخصص
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hireLinks.map((link) => (
                <Link
                  key={`${link.slug}-${link.name}`}
                  href={`/hire/${link.slug}`}
                >
                  <div className="flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-primary-soft hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                      <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">استخدام {link.name}</p>
                      <p className="text-xs text-text-secondary">{link.categoryName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories for Hiring */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-primary" />
            دسته‌بندی‌ها
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const IconComp = iconMap[cat.icon || 'Globe'] || Globe;
              return (
                <Link key={cat.id} href={`/projects/${cat.slug}`}>
                  <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                          <IconComp className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {cat.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{cat.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <section className="rounded-2xl bg-primary p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            پروژه‌ات را ثبت کن، پیشنهادها بگیر
          </h2>
          <p className="mx-auto max-w-lg text-primary-foreground/80 mb-6">
            پروژه خود را رایگان ثبت کنید و از بین پیشنهادهای متخصصین، بهترین را انتخاب کنید.
          </p>
          <Button size="lg" variant="secondary" className="mt-2" asChild>
            <Link href="/projects/create">
              ثبت پروژه رایگان
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* SEO Content */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-text-primary">استخدام فریلنسر در DevJoo</h2>
          <div className="text-sm text-text-secondary leading-relaxed space-y-3">
            <p>
              DevJoo پلتفرم استخدام فریلنسر و متخصص دیجیتال در ایران است.
              اگر به دنبال برنامه‌نویس React، طراح UI/UX، متخصص سئو یا هر متخصص دیجیتال دیگری هستید،
              می‌توانید بهترین نیروها را در DevJoo پیدا کنید.
            </p>
            <p>
              با ثبت پروژه در DevJoo، فریلنسرهای متخصص پیشنهاد خود را ارسال می‌کنند و
              شما می‌توانید بهترین آن‌ها را بر اساس نمونه کار، تجربه و قیمت انتخاب کنید.
              تمامی فریلنسرها احراز هویت شده‌اند و پروژه‌ها با قرارداد محافظت می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
