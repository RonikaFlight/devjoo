import { ProjectsPageClient } from './projects-client';
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { buildCanonicalUrl } from '@/lib/seo/canonical';

export const metadata: Metadata = generatePageMetadata({
  title: 'پروژه‌ها',
  description: 'پروژه‌های فریلنسری، برنامه‌نویسی و دیجیتال را در DevJoo پیدا کنید.',
  path: '/projects',
});

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
