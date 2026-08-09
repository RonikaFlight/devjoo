import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Smartphone, Palette, Brain, Server, Search,
  BarChart3, ShieldCheck, Image, Lock,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils/currency';

export const metadata: Metadata = generatePageMetadata({
  title: 'دسته‌بندی‌ها',
  description: 'دسته‌بندی‌های پروژه‌های فریلنسری شامل برنامه‌نویسی وب، موبایل، طراحی UI/UX، هوش مصنوعی، بک‌اند، سئو و بیشتر در DevJoo.',
  path: '/categories',
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Smartphone, Palette, Brain, Server, Search,
  BarChart3, ShieldCheck, Image, Lock,
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      skills: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { projects: { where: { status: 'PUBLISHED' } } },
      },
    },
  });

  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'دسته‌بندی‌ها', href: '/categories' },
  ]);

  const totalProjects = categories.reduce(
    (sum, cat) => sum + cat._count.projects,
    0
  );

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'دسته‌بندی‌ها' },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">دسته‌بندی پروژه‌ها</h1>
          <p className="mt-2 text-muted-foreground">
            در بین{' '}
            <span className="font-semibold text-foreground">
              {formatNumber(categories.length)}
            </span>{' '}
            دسته‌بندی و{' '}
            <span className="font-semibold text-foreground">
              {formatNumber(totalProjects)}
            </span>{' '}
            پروژه، حوزه مورد علاقه خود را پیدا کنید.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const IconComp = iconMap[cat.icon || 'Globe'] || Globe;
            return (
              <Link key={cat.id} href={`/projects/${cat.slug}`}>
                <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="p-6">
                    {/* Icon + Name */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                        <IconComp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold group-hover:text-primary transition-colors">
                          {cat.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(cat._count.projects)} پروژه
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Skills Preview */}
                    {cat.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {cat.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{cat.skills.length - 6}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Internal Linking: Popular Skills */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">مهارت‌های پرطرفدار</h2>
          <div className="flex flex-wrap gap-2">
            {categories.flatMap((cat) => cat.skills.slice(0, 3)).map((skill) => (
              <Link
                key={skill.id}
                href={`/projects/skills/${skill.slug}`}
                className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
              >
                {skill.name}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO Content Block */}
        <div className="mt-12 rounded-xl border border-border p-6">
          <h2 className="mb-3 text-lg font-semibold">
            دسته‌بندی‌های فریلنسری در DevJoo
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              DevJoo بزرگ‌ترین بازار فریلنسری تخصصی در حوزه تکنولوژی و دیجیتال ایران است.
              در این بخش می‌توانید بین دسته‌بندی‌های مختلف پروژه‌های فریلنسری جستجو کنید و
              پروژه‌هایی پیدا کنید که دقیقاً با مهارت‌های شما مطابقت دارند.
            </p>
            <p>
              از برنامه‌نویسی وب و موبایل گرفته تا طراحی UI/UX، هوش مصنوعی، سئو و بازاریابی
              دیجیتال — هر حوزه‌ای که در آن تخصص دارید، پروژه‌های متنوعی برای شما وجود دارد.
              همچنین می‌توانید از طریق صفحه{' '}
              <Link href="/hire" className="text-primary hover:underline">
                استخدام فریلنسر
              </Link>{' '}
              مستقیماً متخصصین هر حوزه را پیدا کنید.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
