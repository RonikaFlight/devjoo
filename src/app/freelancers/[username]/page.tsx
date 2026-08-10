import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { UserX, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return generatePageMetadata({
    title: `پروفایل ${username}`,
    description: `مشاهده پروفایل ${username} در DevJoo. مهارت‌ها، نمونه‌کارها و پروژه‌های انجام‌شده.`,
    path: `/freelancers/${username}`,
  });
}

export default async function FreelancerProfilePage({ params }: Props) {
  const { username } = await params;

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'فریلنسرها', href: '/freelancers' },
              { label: username },
            ]}
          />
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
            <UserX className="h-10 w-10 text-primary/40" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            این پروفایل در دسترس نیست.
          </h1>
          <p className="mx-auto max-w-md text-sm text-text-secondary mb-8">
            کاربری با نام کاربری «{username}» یافت نشد یا پروفایل عمومی ندارد.
          </p>
          <Button asChild>
            <Link href="/freelancers">
              مشاهده فریلنسرها
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
