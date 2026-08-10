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
import { Package, Plus } from 'lucide-react';

export default function FreelancerServicesPage() {
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
            <BreadcrumbPage>خدمات من</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">خدمات من</h1>
          <p className="mt-1 text-text-secondary">
            خدمات خود را ثبت و مدیریت کنید
          </p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          ثبت خدمت جدید
        </Button>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Package className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">هنوز خدمتی ثبت نکرده‌اید</h3>
        <p className="mt-2 text-text-secondary">
          با ثبت خدمات، مشتریان می‌توانند مستقیماً سفارش دهند.
        </p>
      </div>
    </div>
  );
}
