'use client';

import { useAuth } from '@/lib/auth-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FolderKanban,
  FileText,
  FileSignature,
  Wallet,
  Plus,
  ArrowLeft,
  Clock,
} from 'lucide-react';

const statCards = [
  {
    key: 'activeProjects',
    label: 'پروژه‌های فعال',
    icon: FolderKanban,
    color: 'text-brand-500',
    bg: 'bg-brand-50',
  },
  {
    key: 'receivedProposals',
    label: 'پیشنهادهای دریافتی',
    icon: FileText,
    color: 'text-info',
    bg: 'bg-blue-50',
  },
  {
    key: 'contracts',
    label: 'قراردادها',
    icon: FileSignature,
    color: 'text-success',
    bg: 'bg-green-50',
  },
  {
    key: 'totalSpent',
    label: 'کل هزینه‌ها',
    icon: Wallet,
    color: 'text-warning',
    bg: 'bg-amber-50',
  },
];

const placeholderProjects = [
  {
    id: '1',
    title: 'طراحی وب‌سایت فروشگاهی',
    status: 'OPEN',
    statusLabel: 'باز',
    proposals: 5,
    createdAt: '۱۴۰۴/۰۲/۱۵',
  },
  {
    id: '2',
    title: 'توسعه اپلیکیشن موبایل',
    status: 'IN_PROGRESS',
    statusLabel: 'در حال انجام',
    proposals: 12,
    createdAt: '۱۴۰۴/۰۱/۲۸',
  },
];

const placeholderProposals = [
  {
    id: '1',
    projectTitle: 'طراحی وب‌سایت فروشگاهی',
    freelancer: 'علی محمدی',
    price: '۱۵,۰۰۰,۰۰۰ تومان',
    status: 'NEW',
    statusLabel: 'جدید',
  },
  {
    id: '2',
    projectTitle: 'توسعه اپلیکیشن موبایل',
    freelancer: 'سارا احمدی',
    price: '۳۵,۰۰۰,۰۰۰ تومان',
    status: 'SHORTLISTED',
    statusLabel: 'انتخاب شده',
  },
  {
    id: '3',
    projectTitle: 'طراحی وب‌سایت فروشگاهی',
    freelancer: 'رضا حسینی',
    price: '۱۸,۵۰۰,۰۰۰ تومان',
    status: 'NEW',
    statusLabel: 'جدید',
  },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  NEW: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300',
  SHORTLISTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

function StatCard({
  label,
  icon: Icon,
  color,
  bg,
  value,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  value: string;
}) {
  return (
    <Card className="card-base border-0">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-bold text-text-primary">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployerDashboardHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            سلام {user?.displayName || 'کارفرما'} 👋
          </h1>
          <p className="mt-1 text-text-secondary">
            به پنل کارفرما خوش آمدید. وضعیت پروژه‌ها و پیشنهادهای خود را پیگیری کنید.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="ml-2 h-4 w-4" />
            ثبت پروژه جدید
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.key}
              label={stat.label}
              icon={Icon}
              color={stat.color}
              bg={stat.bg}
              value="—"
            />
          );
        })}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            پروژه‌های اخیر
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employer/projects">
              مشاهده همه
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Card className="card-base border-0">
          <CardContent className="divide-y divide-border p-0">
            {placeholderProjects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-text-primary">
                      {project.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-xs ${STATUS_STYLES[project.status] || ''}`}
                    >
                      {project.statusLabel}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {project.proposals} پیشنهاد
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {project.createdAt}
                    </span>
                  </div>
                </div>
                <ArrowLeft className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            پیشنهادهای اخیر
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employer/proposals">
              مشاهده همه
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Card className="card-base border-0">
          <CardContent className="divide-y divide-border p-0">
            {placeholderProposals.map((proposal) => (
              <Link
                key={proposal.id}
                href="/employer/proposals"
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-text-primary">
                      {proposal.freelancer}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-xs ${STATUS_STYLES[proposal.status] || ''}`}
                    >
                      {proposal.statusLabel}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-text-muted">
                    پروژه: {proposal.projectTitle}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-text-primary">
                    {proposal.price}
                  </p>
                </div>
                <ArrowLeft className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
