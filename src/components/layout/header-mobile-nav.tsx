'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, LogOut, User, Settings, Bell, MessageSquare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/lib/auth-client';

export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, user, isFreelancer, isEmployer, logout } = useAuth();

  const initials = user?.displayName
    ? user.displayName.slice(0, 2)
    : user?.email?.slice(0, 2) ?? 'کاربر';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5 text-text-secondary" />
          <span className="sr-only">منو</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="sr-only">منوی اصلی</SheetTitle>
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-1">
            <span className="text-xl font-extrabold text-text-primary tracking-tight">
              Dev
            </span>
            <span className="text-xl font-extrabold text-primary tracking-tight">
              Joo
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1" />
          </Link>
        </SheetHeader>

        {/* User info (if logged in) */}
        {isLoggedIn && (
          <div className="px-6 pt-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {user?.profile?.avatarUrl && (
                  <AvatarImage
                    src={user.profile.avatarUrl}
                    alt={user.displayName ?? ''}
                  />
                )}
                <AvatarFallback className="text-sm font-semibold bg-primary-soft text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.displayName ?? 'کاربر'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator className="mt-4" />

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-3 pt-3">
          {siteConfig.nav.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator className="mt-3" />

        {/* Quick links (logged in only) */}
        {isLoggedIn && (
          <div className="px-3 pt-3">
            <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
              دسترسی سریع
            </p>
            <div className="flex flex-col gap-0.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                داشبورد
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                تنظیمات
              </Link>
              {isFreelancer && (
                <Link
                  href="/dashboard/proposals"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  پیشنهادهای من
                </Link>
              )}
              {isEmployer && (
                <Link
                  href="/dashboard/projects"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  پروژه‌های من
                </Link>
              )}
            </div>
          </div>
        )}

        {isLoggedIn && <Separator className="mt-3" />}

        {/* Auth actions */}
        <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
          {isLoggedIn ? (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="ms-2 h-4 w-4" />
              خروج
            </Button>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">
                  ورود
                </Button>
              </Link>
              <Link href="/projects/new" onClick={() => setOpen(false)}>
                <Button className="w-full" size="sm">
                  ثبت پروژه
                </Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
