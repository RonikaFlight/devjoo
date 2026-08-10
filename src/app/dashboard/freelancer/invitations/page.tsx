'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Send, UserCircle } from 'lucide-react';

export default function FreelancerInvitationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/freelancer">داشبورد</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>دعوت‌نامه‌ها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">دعوت‌نامه‌ها</h1>
        <p className="mt-1 text-text-secondary">
          دعوت‌نامه‌های دریافتی از کارفرماها
        </p>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Send className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">هنوز دعوتی دریافت نکرده‌اید</h3>
        <p className="mt-2 text-text-secondary">
          پروفایل کامل‌تر شانس دعوت شدن شما را افزایش می‌دهد.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/freelancer/profile">
            <UserCircle className="ms-2 h-4 w-4" />
            ویرایش پروفایل
          </Link>
        </Button>
      </div>
    </div>
  );
}
