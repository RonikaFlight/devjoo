import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { CategoryProjectsClient } from './category-projects-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    select: { name: true, seoTitle: true, seoDescription: true, description: true },
  });

  if (!category) {
    return { title: 'دسته‌بندی یافت نشد' };
  }

  return generatePageMetadata({
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || '',
    path: `/projects/${slug}`,
  });
}

export const dynamic = 'force-dynamic';

export default async function CategoryProjectsPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug, isActive: true },
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

  if (!category) {
    notFound();
  }

  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'پروژه‌ها', href: '/projects' },
    { name: category.name, href: `/projects/${category.slug}` },
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'پروژه‌ها', href: '/projects' },
              { label: category.name },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        <Suspense>
          <CategoryProjectsClient
            category={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description || '',
              projectCount: category._count.projects,
              skills: category.skills.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
            }}
          />
        </Suspense>
      </div>
    </main>
  );
}
