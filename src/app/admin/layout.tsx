import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { USER_ROLES } from '@/types/enums';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'پنل مدیریت',
});

const navItems = [
  { href: '/admin', label: 'داشبورد', icon: '📊' },
  { href: '/admin/users', label: 'کاربران', icon: '👥' },
  { href: '/admin/projects', label: 'پروژه‌ها', icon: '📋' },
  { href: '/admin/taxonomy', label: 'دسته‌بندی و مهارت', icon: '🏷️' },
  { href: '/admin/verifications', label: 'تاییدیه‌ها', icon: '✅' },
  { href: '/admin/seo', label: 'سئو و محتوا', icon: '🔍' },
  { href: '/admin/settings', label: 'تنظیمات', icon: '⚙️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireRole();
  const isAdmin = auth.user.roles.some(r => r.role.name === USER_ROLES.ADMIN);

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-l border-border bg-card md:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="text-lg font-bold text-primary">
            DevJoo Admin
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← بازگشت به داشبورد
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Mobile nav */}
            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {navItems.slice(0, 4).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <span>{auth.user.displayName || 'مدیر'}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
