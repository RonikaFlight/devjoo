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
import { FileText, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  VIEWED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  SHORTLISTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'ارسال شده',
  VIEWED: 'بررسی شده',
  SHORTLISTED: 'انتخاب اولیه',
  ACCEPTED: 'پذیرفته شده',
  REJECTED: 'رد شده',
};

const placeholderProposals = [
  {
    id: '1',
    projectTitle: 'طراحی وب‌سایت فروشگاهی',
    freelancer: 'علی محمدی',
    price: '۱۵,۰۰۰,۰۰۰ تومان',
    duration: '۳۰ روز',
    status: 'SUBMITTED',
    excerpt: 'تجربه ۵ ساله در طراحی وب‌سایت‌های فروشگاهی با React و Next.js...',
  },
  {
    id: '2',
    projectTitle: 'توسعه اپلیکیشن موبایل',
    freelancer: 'سارا احمدی',
    price: '۳۵,۰۰۰,۰۰۰ تومان',
    duration: '۶۰ روز',
    status: 'SHORTLISTED',
    excerpt: 'متخصص فلاتر با نمونه‌کارهای متعدد در حوزه اپلیکیشن‌های موبایل...',
  },
  {
    id: '3',
    projectTitle: 'طراحی وب‌سایت فروشگاهی',
    freelancer: 'رضا حسینی',
    price: '۱۸,۵۰۰,۰۰۰ تومان',
    duration: '۴۵ روز',
    status: 'VIEWED',
    excerpt: 'تیم ما متشکل از طراح UI/UX و توسعه‌دهنده فول‌استک است...',
  },
];

export default function EmployerProposalsPage() {
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
            <BreadcrumbPage>پیشنهادها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">پیشنهادهای دریافتی</h1>
        <p className="mt-1 text-text-secondary">
          بررسی و مدیریت پیشنهادهای فریلنسرها روی پروژه‌های شما
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
        {['همه', 'جدید', 'بررسی شده', 'انتخاب اولیه'].map((tab, i) => (
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

      {/* Proposals list */}
      <div className="space-y-3">
        {placeholderProposals.map((proposal) => (
          <Card key={proposal.id} className="card-base border-0">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-text-muted" />
                      <span className="font-medium text-text-primary">
                        {proposal.freelancer}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${STATUS_STYLES[proposal.status] || ''}`}
                    >
                      {STATUS_LABELS[proposal.status]}
                    </Badge>
                  </div>

                  <p className="text-sm text-text-muted">
                    پروژه: {proposal.projectTitle}
                  </p>

                  <p className="line-clamp-2 text-sm leading-7 text-text-secondary">
                    {proposal.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-medium text-text-primary">
                      {proposal.price}
                    </span>
                    <span className="flex items-center gap-1 text-text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      {proposal.duration}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="ms-1 h-4 w-4" />
                    مشاهده
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                    <CheckCircle className="ms-1 h-4 w-4" />
                    تایید
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                    <XCircle className="ms-1 h-4 w-4" />
                    رد
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
