import { requireAuth, isFreelancer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import PortfolioClient from './portfolio-client';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'نمونه‌کارها',
  description: 'مدیریت نمونه‌کارهای فریلنسر',
});

export default async function PortfolioPage() {
  const auth = await requireAuth();
  if (!isFreelancer(auth.user)) {
    redirect('/dashboard/employer');
  }

  return <PortfolioClient />;
}
