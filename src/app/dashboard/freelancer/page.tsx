import { requireAuth, isFreelancer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'داشبورد فریلنسر',
  description: 'داشبورد فریلنسر DevJoo',
});

export default async function FreelancerDashboardPage() {
  const auth = await requireAuth();
  const isFree = isFreelancer(auth.user);

  if (!isFree) {
    redirect('/dashboard/employer');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          سلام{auth.user.displayName ? `، ${auth.user.displayName}` : ''}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          به داشبورد فریلنسر DevJoo خوش آمدید.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="پروژه‌های جدید"
          description="پروژه‌های مناسب خود را پیدا کنید"
          href="/projects"
        />
        <DashboardCard
          title="پیشنهادهای من"
          description="وضعیت پیشنهادهای ارسالی خود را پیگیری کنید"
          href="/dashboard/freelancer/proposals"
        />
        <DashboardCard
          title="نمونه‌کارها"
          description="نمونه‌کارهای خود را مدیریت کنید"
          href="/dashboard/freelancer/portfolio"
        />
        <DashboardCard
          title="پروفایل"
          description="پروفایل خود را تکمیل کنید تا بیشتر دیده شوید"
          href="/settings/profile"
        />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">
          داشبورد فریلنسر در فازهای بعدی تکمیل می‌شود.
          در حال حاضر می‌توانید پروژه‌ها را مرور کنید.
        </p>
        <Link href="/projects">
          <Button className="mt-4">مشاهده پروژه‌ها</Button>
        </Link>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="rounded-xl border border-border p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
