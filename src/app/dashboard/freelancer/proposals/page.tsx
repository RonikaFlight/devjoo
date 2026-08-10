import { requireAuth, isFreelancer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import MyProposalsClient from './my-proposals-client';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'پیشنهادهای من',
  description: 'مشاهده و مدیریت پیشنهادهای ارسال شده',
});

export default async function MyProposalsPage() {
  const auth = await requireAuth();
  if (!isFreelancer(auth.user)) {
    redirect('/dashboard/employer');
  }

  return <MyProposalsClient />;
}
