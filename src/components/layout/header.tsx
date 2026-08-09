import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { HeaderMobileNav } from "./header-mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="DevJoo — صفحه اصلی">
          <span className="text-xl font-extrabold text-primary">DevJoo</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="منوی اصلی">
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            aria-label="جستجو"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              ورود
            </Button>
          </Link>
          <Link href="/projects/create">
            <Button size="sm">
              ثبت پروژه
            </Button>
          </Link>
          <HeaderMobileNav />
        </div>
      </div>
    </header>
  );
}