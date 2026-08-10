'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { FolderKanban, Plus, FileText, Clock } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
};

const placeholderProjects = [
  {
    id: '1',
    title: 'طراحی وب‌سایت فروشگاهی',
    category: 'طراحی وب',
    status: 'OPEN',
    proposals: 5,
    budget: '۱۵-۲۰ میلیون تومان',
    createdAt: '۱۴۰۴/۰۲/۱۵',
  },
  {
    id: '2',
    title: 'توسعه اپلیکیشن موبایل',
    category: 'موبایل',
    status: 'IN_PROGRESS',
    proposals: 12,
    budget: '۳۰-۴۰ میلیون تومان',
    createdAt: '۱۴۰۴/۰۱/۲۸',
  },
];

export default function EmployerProjectsPage() {
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
            <BreadcrumbPage>پروژه‌ها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">لیست پروژه‌ها</h1>
          <p className="mt-1 text-text-secondary">
            مدیریت و پیگیری پروژه‌های ثبت‌شده شما
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="ml-2 h-4 w-4" />
            ثبت پروژه جدید
          </Link>
        </Button>
      </div>

      {/* Tabs placeholder */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
        {['همه', 'باز', 'در حال انجام', 'تکمیل شده'].map((tab, i) => (
          <button
            key={tab}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects list */}
      <div className="space-y-3">
        {placeholderProjects.map((project) => (
          <Card key={project.id} className="card-base border-0">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text-primary">
                      {project.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${STATUS_STYLES[project.status] || ''}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted">{project.category}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {project.proposals} پیشنهاد
                    </span>
                    <span>{project.budget}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {project.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state fallback note */}
      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <FolderKanban className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          پروژه‌های بیشتر به زودی بارگذاری خواهند شد.
        </p>
      </div>
    </div>
  );
}
