import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';
import { ProjectDetailClient } from './project-detail-client';
import { StructuredData } from '@/components/seo/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!project) {
    return { title: 'پروژه یافت نشد' };
  }

  return generatePageMetadata({
    title: project.title,
    description: project.description.slice(0, 160),
    path: `/project/${slug}`,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const project = await db.project.findUnique({
    where: { slug },
    include: {
      category: true,
      skills: { include: { skill: true } },
      employer: {
        select: {
          id: true,
          displayName: true,
          profile: { select: { avatarUrl: true, city: true, bio: true } },
        },
      },
      statusEvents: {
        orderBy: { createdAt: 'asc' },
        take: 20,
      },
    },
  });

  if (!project) {
    notFound();
  }

      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'خانه', href: '/' },
        { label: 'پروژه‌ها', href: '/projects' },
      ];
      if (project.category) {
        breadcrumbItems.push({
          label: project.category.name,
          href: `/projects/${project.category.slug}`,
        });
      }
      breadcrumbItems.push({ label: project.title });

      const breadcrumbLd = generateBreadcrumbLd(
        breadcrumbItems.filter((item) => item.href).map((item) => ({
          name: item.label,
          href: item.href!,
        }))
      );

  const serialized = JSON.parse(JSON.stringify(project));

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'پروژه‌ها', href: '/projects' },
              { label: project.title },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />
        <ProjectDetailClient project={serialized} />
      </div>
    </main>
  );
}
