import { requireAuth, isEmployer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'داشبورد کارفرما',
  description: 'داشبورد کارفرما DevJoo',
});

export default async function EmployerDashboardPage() {
  const auth = await requireAuth();
  const isEmp = isEmployer(auth.user);

  if (!isEmp) {
    redirect('/dashboard/freelancer');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          سلام{auth.user.displayName ? `، ${auth.user.displayName}` : ''}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          به داشبورد کارفرما DevJoo خوش آمدید.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="پروژه جدید"
          description="پروژه خود را ثبت کنید تا فریلنسرها پیشنهاد بدهند"
          href="/dashboard/employer/projects/new"
        />
        <DashboardCard
          title="پروژه‌های من"
          description="وضعیت پروژه‌های ثبت‌شده خود را پیگیری کنید"
          href="/dashboard/employer/projects"
        />
        <DashboardCard
          title="پروفایل"
          description="اطلاعات شرکت خود را تکمیل کنید"
          href="/settings/profile"
        />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">
          داشبورد کارفرما در فازهای بعدی تکمیل می‌شود.
          در حال حاضر می‌توانید پروژه جدید ثبت کنید.
        </p>
        <Link href="/dashboard/employer/projects/new">
          <Button className="mt-4">ثبت پروژه جدید</Button>
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
