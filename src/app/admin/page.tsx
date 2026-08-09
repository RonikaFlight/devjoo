import { getAdminDashboardStats } from '@/modules/admin/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { title: 'کاربران', value: stats.users.total, sub: `${stats.users.recentSignups} ثبت‌نام اخیر`, href: '/admin/users', color: 'text-blue-600 dark:text-blue-400' },
    { title: 'پروژه‌ها', value: stats.projects.total, sub: `${stats.projects.published} منتشر شده`, href: '/admin/projects', color: 'text-purple-600 dark:text-purple-400' },
    { title: 'در انتظار بررسی', value: stats.projects.pendingReview, sub: 'پروژه نیاز به بررسی', href: '/admin/projects?status=PENDING_REVIEW', color: 'text-amber-600 dark:text-amber-400' },
    { title: 'تاییدیه‌ها', value: stats.verifications.pending, sub: 'درخواست منتظر', href: '/admin/verifications', color: 'text-green-600 dark:text-green-400' },
    { title: 'پیشنهادها', value: stats.proposals.total, sub: 'کل پیشنهادها', href: '#', color: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'قراردادها', value: stats.contracts.total, sub: stats.contracts.disputed > 0 ? `${stats.contracts.disputed} زیر اختلاف` : 'بدون اختلاف', href: '#', color: stats.contracts.disputed > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400' },
    { title: 'خدمات', value: stats.serviceListings.total, sub: 'لیست خدمات', href: '#', color: 'text-pink-600 dark:text-pink-400' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">داشبورد مدیریت</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map(card => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString('fa-IR')}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}