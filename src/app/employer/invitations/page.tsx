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
import { Send, FolderKanban, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار پاسخ',
  ACCEPTED: 'پذیرفته شده',
  REJECTED: 'رد شده',
};

const placeholderInvitations = [
  {
    id: '1',
    projectTitle: 'طراحی وب‌سایت فروشگاهی',
    freelancer: 'علی محمدی',
    status: 'PENDING',
    sentAt: '۱۴۰۴/۰۲/۱۸',
  },
  {
    id: '2',
    projectTitle: 'توسعه API بک‌اند',
    freelancer: 'مریم کریمی',
    status: 'ACCEPTED',
    sentAt: '۱۴۰۴/۰۲/۱۰',
  },
];

export default function EmployerInvitationsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employer">داشبورد</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>دعوت‌ها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">دعوت‌نامه‌ها</h1>
        <p className="mt-1 text-text-secondary">
          مدیریت دعوت‌نامه‌های ارسالی به فریلنسرها
        </p>
      </div>

      {/* Invitations list */}
      <div className="space-y-3">
        {placeholderInvitations.map((inv) => (
          <div
            key={inv.id}
            className="card-base flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <User className="h-4 w-4 text-text-muted" />
                  {inv.freelancer}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${STATUS_STYLES[inv.status] || ''}`}
                >
                  {STATUS_LABELS[inv.status]}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-text-muted">
                <FolderKanban className="h-3.5 w-3.5" />
                {inv.projectTitle}
              </p>
              <p className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                ارسال شده در {inv.sentAt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
        <Send className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          از بخش استعدادیابی یا صفحه پروژه می‌توانید فریلنسرها را دعوت کنید.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/employer/talent">مشاهده فریلنسرها</Link>
        </Button>
      </div>
    </div>
  );
}
