import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { SkillProjectsClient } from './skill-projects-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await db.skill.findUnique({
    where: { slug, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!skill) {
    return { title: 'مهارت یافت نشد' };
  }

  const title = `پروژه‌های ${skill.name} | فریلنسر ${skill.name}`;
  const description = skill.category
    ? `پروژه‌های ${skill.name} در حوزه ${skill.category.name}. استخدام فریلنسر ${skill.name} در DevJoo.`
    : `پروژه‌های ${skill.name}. استخدام فریلنسر ${skill.name} در DevJoo.`;

  return generatePageMetadata({
    title,
    description,
    path: `/projects/skills/${slug}`,
  });
}

export async function generateStaticParams() {
  const skills = await db.skill.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return skills.map((s) => ({ slug: s.slug }));
}

export default async function SkillProjectsPage({ params }: PageProps) {
  const { slug } = await params;

  const skill = await db.skill.findUnique({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      synonyms: { select: { name: true } },
    },
  });

  if (!skill) {
    notFound();
  }

  // Get related skills (same category, excluding current)
  const relatedSkills = skill.category
    ? await db.skill.findMany({
        where: {
          categoryId: skill.category.id,
          isActive: true,
          id: { not: skill.id },
        },
        orderBy: { displayOrder: 'asc' },
        take: 12,
        select: { id: true, name: true, slug: true },
      })
    : [];

  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'پروژه‌ها', href: '/projects' },
    { name: skill.name, href: `/projects/skills/${skill.slug}` },
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'پروژه‌ها', href: '/projects' },
              { label: skill.name },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        <Suspense>
          <SkillProjectsClient
            skill={{
              id: skill.id,
              name: skill.name,
              slug: skill.slug,
              category: skill.category,
              synonyms: skill.synonyms.map((s) => s.name),
            }}
            relatedSkills={relatedSkills}
          />
        </Suspense>
      </div>
    </main>
  );
}
