'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">منو</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <div className="flex flex-col gap-4 pt-6">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold text-primary">DevJoo</span>
          </Link>
          <nav className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
            <Link href="/auth" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                ورود
              </Button>
            </Link>
            <Link href="/projects/create" onClick={() => setOpen(false)}>
              <Button className="w-full">
                ثبت پروژه
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}