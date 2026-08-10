import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbLd } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { HireRoleClient } from './hire-role-client';

/**
 * Reverse mapping: hire-role slug → skill slug.
 * e.g. "react-developer" → "react", "seo-specialist" → "seo"
 */
const hireRoleToSkill: Record<string, { skillSlug: string; title: string; description: string }> = {
  'react-developer': {
    skillSlug: 'react',
    title: 'استخدام برنامه‌نویس React',
    description: 'استخدام فریلنسر React برای پروژه‌های فرانت‌اند، SPA، وب اپلیکیشن و PWA. بهترین برنامه‌نویسان React ایران در DevJoo.',
  },
  'nextjs-developer': {
    skillSlug: 'nextjs',
    title: 'استخدام برنامه‌نویس Next.js',
    description: 'استخدام فریلنسر Next.js برای پروژه‌های SSR، SSG و فول‌استک. بهترین برنامه‌نویسان Next.js ایران در DevJoo.',
  },
  'nodejs-developer': {
    skillSlug: 'nodejs',
    title: 'استخدام برنامه‌نویس Node.js',
    description: 'استخدام فریلنسر Node.js برای بک‌اند، API و میکروسرویس. بهترین برنامه‌نویسان Node.js ایران در DevJoo.',
  },
  'python-developer': {
    skillSlug: 'python',
    title: 'استخدام برنامه‌نویس Python',
    description: 'استخدام فریلنسر Python برای پروژه‌های وب، داده، هوش مصنوعی و اتوماسیون. بهترین برنامه‌نویسان Python ایران در DevJoo.',
  },
  'wordpress-developer': {
    skillSlug: 'wordpress',
    title: 'استخدام طراح و برنامه‌نویس وردپرس',
    description: 'استخدام فریلنسر وردپرس برای طراحی سایت، قالب، افزونه و فروشگاه آنلاین. بهترین متخصصین وردپرس ایران در DevJoo.',
  },
  'laravel-developer': {
    skillSlug: 'laravel',
    title: 'استخدام برنامه‌نویس Laravel',
    description: 'استخدام فریلنسر Laravel برای پروژه‌های وب، API و اپلیکیشن. بهترین برنامه‌نویسان Laravel ایران در DevJoo.',
  },
  'flutter-developer': {
    skillSlug: 'flutter',
    title: 'استخدام برنامه‌نویس Flutter',
    description: 'استخدام فریلنسر Flutter برای اپلیکیشن موبایل اندروید و iOS. بهترین برنامه‌نویسان Flutter ایران در DevJoo.',
  },
  'javascript-developer': {
    skillSlug: 'javascript',
    title: 'استخدام برنامه‌نویس JavaScript',
    description: 'استخدام فریلنسر JavaScript برای پروژه‌های وب، فرانت‌اند و بک‌اند. بهترین برنامه‌نویسان JavaScript ایران در DevJoo.',
  },
  'typescript-developer': {
    skillSlug: 'typescript',
    title: 'استخدام برنامه‌نویس TypeScript',
    description: 'استخدام فریلنسر TypeScript برای پروژه‌های وب با تایپ‌سیف. بهترین برنامه‌نویسان TypeScript ایران در DevJoo.',
  },
  'ui-ux-designer': {
    skillSlug: 'ui-design',
    title: 'استخدام طراح UI/UX',
    description: 'استخدام فریلنسر UI/UX برای طراحی رابط کاربری و تجربه کاربری وب‌سایت و اپلیکیشن. بهترین طراحان UI/UX ایران در DevJoo.',
  },
  'figma-designer': {
    skillSlug: 'figma',
    title: 'استخدام طراح Figma',
    description: 'استخدام فریلنسر Figma برای طراحی UI، پروتوتایپ و طراحی سیستم. بهترین طراحان Figma ایران در DevJoo.',
  },
  'graphic-designer': {
    skillSlug: 'adobe-photoshop',
    title: 'استخدام طراح گرافیک',
    description: 'استخدام فریلنسر گرافیک برای طراحی لوگو، بنر، اینفوگرافیک و هویت بصری. بهترین طراحان گرافیک ایران در DevJoo.',
  },
  'seo-specialist': {
    skillSlug: 'seo',
    title: 'استخدام متخصص سئو',
    description: 'استخدام فریلنسر سئو برای بهینه‌سازی سایت، لینک‌سازی و استراتژی محتوا. بهترین متخصصین سئو ایران در DevJoo.',
  },
  'frontend-developer': {
    skillSlug: 'react',
    title: 'استخدام برنامه‌نویس فرانت‌اند',
    description: 'استخدام فریلنسر فرانت‌اند برای طراحی و توسعه وب‌سایت. بهترین برنامه‌نویسان فرانت‌اند ایران در DevJoo.',
  },
  'mobile-developer': {
    skillSlug: 'react-native',
    title: 'استخدام برنامه‌نویس موبایل',
    description: 'استخدام فریلنسر موبایل برای اپلیکیشن اندروید و iOS. بهترین برنامه‌نویسان موبایل ایران در DevJoo.',
  },
};

// All valid hire-role slugs for generateStaticParams
const allHireRoles = Object.keys(hireRoleToSkill);

interface PageProps {
  params: Promise<{ role: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  const mapping = hireRoleToSkill[role];

  if (!mapping) {
    return { title: 'صفحه یافت نشد' };
  }

  return generatePageMetadata({
    title: mapping.title,
    description: mapping.description,
    path: `/hire/${role}`,
  });
}



export default async function HireRolePage({ params }: PageProps) {
  const { role } = await params;
  const mapping = hireRoleToSkill[role];

  if (!mapping) {
    notFound();
  }

  // Find the primary skill
  const skill = await db.skill.findUnique({
    where: { slug: mapping.skillSlug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      synonyms: { select: { name: true } },
    },
  });

  // Find related skills in same category
  const relatedSkills = skill?.category
    ? await db.skill.findMany({
        where: {
          categoryId: skill.category.id,
          isActive: true,
          id: { not: skill.id },
        },
        orderBy: { displayOrder: 'asc' },
        take: 8,
        select: { id: true, name: true, slug: true },
      })
    : [];

  // Related hire links (different categories)
  const otherCategories = await db.category.findMany({
    where: { isActive: true, id: skill?.category?.id ? { not: skill.category.id } : undefined },
    orderBy: { displayOrder: 'asc' },
    take: 4,
    include: {
      skills: { where: { isActive: true }, orderBy: { displayOrder: 'asc' }, take: 2, select: { name: true, slug: true } },
    },
  });

  const breadcrumbLd = generateBreadcrumbLd([
    { name: 'خانه', href: '/' },
    { name: 'استخدام فریلنسر', href: '/hire' },
    { name: mapping.title, href: `/hire/${role}` },
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'خانه', href: '/' },
              { label: 'استخدام فریلنسر', href: '/hire' },
              { label: mapping.title },
            ]}
          />
        </div>
        <StructuredData data={breadcrumbLd} />

        <HireRoleClient
          role={role}
          hireInfo={mapping}
          skill={
            skill
              ? {
                  id: skill.id,
                  name: skill.name,
                  slug: skill.slug,
                  category: skill.category,
                  synonyms: skill.synonyms.map((s) => s.name),
                }
              : null
          }
          relatedSkills={relatedSkills}
          otherCategories={otherCategories}
        />
      </div>
    </main>
  );
}
