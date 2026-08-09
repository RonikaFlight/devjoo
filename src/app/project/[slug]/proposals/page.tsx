import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import ProjectProposalsClient from './project-proposals-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generatePrivatePageMetadata({
    title: `پیشنهادهای پروژه`,
    description: `مشاهده و مدیریت پیشنهادهای دریافتی`,
  });
}

export default async function ProjectProposalsPage({ params }: Props) {
  const { slug } = await params;
  return <ProjectProposalsClient slug={slug} />;
}
