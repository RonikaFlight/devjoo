'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  FileText,
} from 'lucide-react';
import {
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS,
  type ProposalStatus,
} from '@/types/enums';
import { formatCurrencyToman, rialToToman, formatNumber } from '@/lib/utils/currency';

interface Proposal {
  id: string;
  coverLetter: string;
  priceRial: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    budgetType: string;
    fixedPriceRial: number | null;
    budgetMinRial: number | null;
    budgetMaxRial: number | null;
    category: { name: string } | null;
  };
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  VIEWED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  SHORTLISTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export default function MyProposalsClient() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProposals = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/me/proposals?page=${p}&limit=10`);
      if (res.ok) {
        const json = await res.json();
        setProposals(json.data || []);
        setMeta(json.meta || null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals(page);
  }, [page, fetchProposals]);

  if (loading && proposals.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">پیشنهادهای من</h1>
          <p className="mt-1 text-muted-foreground">
            مشاهده و پیگیری پیشنهادهای ارسال شده
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">پیشنهادهای من</h1>
        <p className="mt-1 text-muted-foreground">
          مشاهده و پیگیری پیشنهادهای ارسال شده
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">هنوز پیشنهادی ارسال نکرده‌اید</h3>
          <p className="mt-2 text-muted-foreground">
            پروژه‌هایی که به تخصص شما نزدیک هستند را پیدا کنید و پیشنهاد ارسال کنید.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/projects">
              <Briefcase className="ml-2 h-4 w-4" />
              مشاهده پروژه‌ها
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/project/${proposal.project.slug}`}
                        className="text-base font-semibold text-primary hover:underline"
                      >
                        {proposal.project.title}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_COLORS[proposal.status] || ''}`}
                      >
                        {PROPOSAL_STATUS_LABELS[proposal.status as ProposalStatus] || proposal.status}
                      </Badge>
                    </div>

                    {proposal.project.category && (
                      <p className="text-sm text-muted-foreground">
                        {proposal.project.category.name}
                      </p>
                    )}

                    <p className="line-clamp-2 text-sm leading-7 text-text-secondary">
                      {proposal.coverLetter}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-text-primary">
                        {formatCurrencyToman(rialToToman(proposal.priceRial))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {proposal.estimatedDuration}
                      </span>
                      <span>{formatDate(proposal.createdAt)}</span>
                    </div>
                  </div>

                  {proposal.status === PROPOSAL_STATUS.ACCEPTED && (
                    <Button size="sm" asChild>
                      <Link href="/dashboard/messages">
                        <MessageCircle className="ml-1 h-4 w-4" />
                        شروع گفتگو
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronRight className="ml-1 h-4 w-4" />
                قبلی
              </Button>
              <span className="text-sm text-muted-foreground">
                {formatNumber(page)} از {formatNumber(meta.totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                بعدی
                <ChevronLeft className="mr-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
