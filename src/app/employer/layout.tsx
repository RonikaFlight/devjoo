'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-client';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  UserSearch,
  Send,
  MessageSquare,
  FileSignature,
  BarChart3,
  UserCircle,
  Settings,
  Menu,
  ArrowRight,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/employer', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/employer/projects', label: 'پروژه‌ها', icon: FolderKanban },
  { href: '/employer/proposals', label: 'پیشنهادها', icon: FileText },
  { href: '/employer/talent', label: 'استخدام', icon: UserSearch },
  { href: '/employer/invitations', label: 'دعوت‌ها', icon: Send },
  { href: '/messages', label: 'پیام‌ها', icon: MessageSquare },
  { href: '/employer/contracts', label: 'قراردادها', icon: FileSignature },
  { href: '/employer/analytics', label: 'تحلیل', icon: BarChart3 },
  { href: '/employer/profile', label: 'پروفایل', icon: UserCircle },
  { href: '/employer/settings', label: 'تنظیمات', icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive =
          item.href === '/employer'
            ? pathname === '/employer'
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-soft text-primary'
                : 'text-text-secondary hover:bg-muted hover:text-text-primary'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isEmployer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isEmployer) {
      router.replace('/dashboard');
    }
  }, [isLoading, isEmployer, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <aside className="hidden h-screen w-64 shrink-0 border-l border-border bg-surface p-4 lg:block">
          <Skeleton className="mb-4 h-8 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!isEmployer) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-l border-border bg-surface lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/employer" className="text-lg font-bold text-primary">
            DevJoo
          </Link>
          <span className="mr-2 text-xs text-text-muted">کارفرما</span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        {/* Back to dashboard */}
        <div className="border-t border-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به داشبورد
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar - mobile */}
        <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-lg font-bold text-primary">
                  DevJoo
                </SheetTitle>
                <p className="text-xs text-text-muted">پنل کارفرما</p>
              </SheetHeader>
              <SidebarNav />
              <div className="border-t border-border p-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
                >
                  <ArrowRight className="h-4 w-4" />
                  بازگشت به داشبورد
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-text-primary">
            {user?.displayName || 'کارفرما'}
          </span>
        </div>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-between border-b border-border bg-surface px-6 py-3 lg:flex">
          <span className="text-sm text-text-muted">
            {user?.displayName ? `سلام، ${user.displayName}` : 'پنل کارفرما'}
          </span>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
