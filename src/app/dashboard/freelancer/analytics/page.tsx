'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { BarChart3, TrendingUp, TrendingDown, FileText, Eye, DollarSign, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const summaryStats = [
  {
    label: 'پیشنهادهای ارسالی',
    value: '۲۴',
    change: '+۵ این ماه',
    trend: 'up' as const,
    icon: FileText,
  },
  {
    label: 'نرخ بازدید پروفایل',
    value: '۱۸۵',
    change: '+۳۰ این ماه',
    trend: 'up' as const,
    icon: Eye,
  },
  {
    label: 'نرخ موفقیت',
    value: '۴۲٪',
    change: '+۸٪ نسبت به ماه قبل',
    trend: 'up' as const,
    icon: TrendingUp,
  },
  {
    label: 'میانگین امتیاز',
    value: '۴.۸',
    change: 'بدون تغییر',
    trend: 'up' as const,
    icon: Star,
  },
];

export default function FreelancerAnalyticsPage() {
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
            <BreadcrumbPage>تحلیل و گزارش</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">تحلیل و گزارش</h1>
        <p className="mt-1 text-text-secondary">
          آمار عملکرد و تحلیل فعالیت‌های شما
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-base border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-muted">{stat.label}</p>
                  <Icon className="h-5 w-5 text-text-muted" />
                </div>
                <p className="mt-2 text-2xl font-bold text-text-primary">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder note */}
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <BarChart3 className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          نمودارها و داده‌های دقیق‌تر به زودی در دسترس خواهند بود.
        </p>
      </div>
    </div>
  );
}
