'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const summaryStats = [
  {
    label: 'کل پروژه‌ها',
    value: '۱۲',
    change: '+۲ این ماه',
    trend: 'up' as const,
    icon: FileText,
  },
  {
    label: 'پیشنهادهای دریافتی',
    value: '۸۷',
    change: '+۱۵ این ماه',
    trend: 'up' as const,
    icon: Users,
  },
  {
    label: 'نرخ پذیرش',
    value: '۳۴٪',
    change: '+۵٪ نسبت به ماه قبل',
    trend: 'up' as const,
    icon: TrendingUp,
  },
  {
    label: 'میانگین بودجه',
    value: '۲۲M',
    change: '-۳٪ نسبت به ماه قبل',
    trend: 'down' as const,
    icon: DollarSign,
  },
];

export default function EmployerAnalyticsPage() {
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
            <BreadcrumbPage>تحلیل و گزارش</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">تحلیل و گزارش</h1>
        <p className="mt-1 text-text-secondary">
          آمار و تحلیل عملکرد پروژه‌ها و هزینه‌های شما
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

      {/* Chart placeholders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-base border-0">
          <CardContent className="p-5">
            <h3 className="mb-4 font-semibold text-text-primary">هزینه ماهانه</h3>
            <div className="flex h-48 items-end justify-around gap-2">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-md bg-primary/20 transition-all hover:bg-primary/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-around text-xs text-text-muted">
              {['فر', 'ار', 'خرد', 'تیر', 'مرد', 'شهر', 'مه', 'آب', 'آذر', 'دی', 'بهم', 'اسف'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-base border-0">
          <CardContent className="p-5">
            <h3 className="mb-4 font-semibold text-text-primary">تعداد پیشنهادها</h3>
            <div className="flex h-48 items-end justify-around gap-2">
              {[30, 50, 70, 45, 60, 85, 40, 75, 90, 55, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-md bg-brand-300/40 transition-all hover:bg-brand-300/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-around text-xs text-text-muted">
              {['فر', 'ار', 'خرد', 'تیر', 'مرد', 'شهر', 'مه', 'آب', 'آذر', 'دی', 'بهم', 'اسف'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder note */}
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <BarChart3 className="mx-auto mb-3 h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          نمودارها و داده‌های واقعی به زودی در دسترس خواهند بود.
        </p>
      </div>
    </div>
  );
}
