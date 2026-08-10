'use client';

import Link from 'next/link';
import { Search, Bell, MessageSquare, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/lib/auth-client';
import { HeaderMobileNav } from './header-mobile-nav';

export function Header() {
  const { isLoggedIn, user, isFreelancer, isEmployer, logout } = useAuth();

  const initials = user?.displayName
    ? user.displayName.slice(0, 2)
    : user?.email?.slice(0, 2) ?? 'کاربر';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 shrink-0"
          aria-label="DevJoo — صفحه اصلی"
        >
          <span className="text-xl font-extrabold text-text-primary tracking-tight">
            Dev
          </span>
          <span className="text-xl font-extrabold text-primary tracking-tight">
            Joo
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="منوی اصلی"
        >
          {siteConfig.nav.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-soft rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2">
          {/* Search button (desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-9 w-9"
            aria-label="جستجو"
          >
            <Search className="h-4.5 w-4.5 text-text-secondary" aria-hidden="true" />
          </Button>

          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-9 w-9 relative"
                aria-label="اعلان‌ها"
              >
                <Bell className="h-4.5 w-4.5 text-text-secondary" aria-hidden="true" />
                {/* Notification dot (optional future use) */}
                {/* <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-danger rounded-full" /> */}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-9 w-9"
                aria-label="پیام‌ها"
              >
                <MessageSquare className="h-4.5 w-4.5 text-text-secondary" aria-hidden="true" />
              </Button>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-8 w-8">
                      {user?.profile?.avatarUrl && (
                        <AvatarImage
                          src={user.profile.avatarUrl}
                          alt={user.displayName ?? ''}
                        />
                      )}
                      <AvatarFallback className="text-xs font-semibold bg-primary-soft text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold leading-none">
                      {user?.displayName ?? 'کاربر'}
                    </p>
                    <p className="text-xs text-text-muted mt-1 truncate">
                      {user?.email ?? ''}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="ms-2 h-4 w-4" />
                        داشبورد
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="ms-2 h-4 w-4" />
                        تنظیمات
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {(isFreelancer || isEmployer) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {isFreelancer && (
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/proposals">
                              <MessageSquare className="ms-2 h-4 w-4" />
                              پیشنهادهای من
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isEmployer && (
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/projects">
                              <Search className="ms-2 h-4 w-4" />
                              پروژه‌های من
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={logout}>
                    <LogOut className="ms-2 h-4 w-4" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Logged-out state */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-text-secondary"
                asChild
              >
                <Link href="/auth/login">ورود</Link>
              </Button>
              <Button size="sm" className="hidden md:flex rounded-lg" asChild>
                <Link href="/projects/new">ثبت پروژه</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <HeaderMobileNav />
        </div>
      </div>
    </header>
  );
}
