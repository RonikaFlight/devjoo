import { requireAuth, isFreelancer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'داشبورد',
  description: 'داشبورد DevJoo',
});

export default async function DashboardPage() {
  const auth = await requireAuth();

  if (isFreelancer(auth.user)) {
    redirect('/dashboard/freelancer');
  } else {
    redirect('/dashboard/employer');
  }
}
