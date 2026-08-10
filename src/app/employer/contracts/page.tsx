'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { FileSignature, User, FolderKanban, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'فعال',
  PENDING: 'در انتظار تایید',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
};

const placeholderContracts = [
  {
    id: '1',
    projectTitle: 'توسعه اپلیکیشن موبایل',
    freelancer: 'سارا احمدی',
    amount: '۳۵,۰۰۰,۰۰۰ تومان',
    status: 'ACTIVE',
    startDate: '۱۴۰۴/۰۲/۰۱',
    milestones: 4,
    completedMilestones: 1,
  },
  {
    id: '2',
    projectTitle: 'طراحی لوگو و هویت بصری',
    freelancer: 'محمد رضایی',
    amount: '۸,۰۰۰,۰۰۰ تومان',
    status: 'COMPLETED',
    startDate: '۱۴۰۴/۰۱/۰۵',
    milestones: 2,
    completedMilestones: 2,
  },
];

export default function EmployerContractsPage() {
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
            <BreadcrumbPage>قراردادها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">قراردادها</h1>
        <p className="mt-1 text-text-secondary">
          مدیریت قراردادهای فعال و تکمیل‌شده با فریلنسرها
        </p>
      </div>

      {/* Contracts list */}
      <div className="space-y-3">
        {placeholderContracts.map((contract) => (
          <div
            key={contract.id}
            className="card-base space-y-4 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-text-primary">
                    {contract.projectTitle}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${STATUS_STYLES[contract.status] || ''}`}
                  >
                    {STATUS_LABELS[contract.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {contract.freelancer}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3.5 w-3.5" />
                    {contract.milestones} مرحله
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {contract.startDate}
                  </span>
                </div>
              </div>

              <div className="text-left">
                <p className="text-lg font-bold text-text-primary">
                  {contract.amount}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
                <span>پیشرفت مراحل</span>
                <span>{contract.completedMilestones} از {contract.milestones}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(contract.completedMilestones / contract.milestones) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                جزئیات قرارداد
              </Button>
              {contract.status === 'ACTIVE' && (
                <Button size="sm">مدیریت مراحل</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state note */}
      <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
        <FileSignature className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          قراردادها پس از تایید پیشنهاد فریلنسر ایجاد می‌شوند.
        </p>
      </div>
    </div>
  );
}
