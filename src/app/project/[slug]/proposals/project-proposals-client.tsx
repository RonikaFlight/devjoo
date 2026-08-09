'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Check,
  Eye,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Briefcase,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS,
  type ProposalStatus,
} from '@/types/enums';
import { formatCurrencyToman, rialToToman } from '@/lib/utils/currency';

interface FreelancerInfo {
  id: string;
  displayName: string | null;
  profile: {
    avatarUrl: string | null;
    headline: string | null;
    city: string | null;
  } | null;
}

interface Proposal {
  id: string;
  coverLetter: string;
  priceRial: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
  freelancer: FreelancerInfo;
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

export default function ProjectProposalsClient({ slug }: { slug: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptDialogId, setAcceptDialogId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${slug}/proposals`);
      if (res.ok) {
        const json = await res.json();
        setProposals(json.data || []);
      } else {
        // If 403/404, the user might not be the owner
        toast.error('شما دسترسی مشاهده پیشنهادهای این پروژه را ندارید.');
      }
    } catch {
      toast.error('خطا در بارگذاری پیشنهادها.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const updateProposalStatus = async (
    id: string,
    status: string,
    body?: Record<string, unknown>
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/v1/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...body }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || 'خطا در بروزرسانی وضعیت پیشنهاد.');
        return;
      }

      const label = PROPOSAL_STATUS_LABELS[status as ProposalStatus];
      toast.success(`وضعیت پیشنهاد به «${label}» تغییر کرد.`);
      fetchProposals();
    } catch {
      toast.error('خطا در ارتباط با سرور.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = () => {
    if (!rejectDialogId) return;
    if (rejectReason.trim().length < 10) {
      toast.error('دلیل رد باید حداقل ۱۰ کاراکتر باشد.');
      return;
    }
    updateProposalStatus(rejectDialogId, PROPOSAL_STATUS.REJECTED, {
      rejectionReason: rejectReason.trim(),
    });
    setRejectDialogId(null);
    setRejectReason('');
  };

  const handleAccept = () => {
    if (!acceptDialogId) return;
    updateProposalStatus(acceptDialogId, PROPOSAL_STATUS.ACCEPTED);
    setAcceptDialogId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">پیشنهادهای دریافت شده</h1>
          <p className="mt-1 text-muted-foreground">
            در حال بارگذاری...
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard/employer" className="hover:text-primary">
            داشبورد کارفرما
          </Link>
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          <span>پیشنهادها</span>
        </div>
        <h1 className="text-2xl font-bold">پیشنهادهای دریافت شده</h1>
        <p className="mt-1 text-muted-foreground">
          {formatCurrencyToman(0) && ''}
          {proposals.length} پیشنهاد دریافت شده
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">هنوز پیشنهادی دریافت نشده</h3>
          <p className="mt-2 text-muted-foreground">
            به محض ارسال پیشنهاد توسط فریلنسرها، اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const isExpanded = expandedId === proposal.id;
            const isUpdating = updatingId === proposal.id;
            const freelancerName = proposal.freelancer.displayName || 'کاربر';
            const actionableStatuses: string[] = [
              PROPOSAL_STATUS.SUBMITTED,
              PROPOSAL_STATUS.VIEWED,
              PROPOSAL_STATUS.SHORTLISTED,
            ];
            const canAct = actionableStatuses.includes(proposal.status);

            return (
              <Card key={proposal.id}>
                <CardContent className="p-5">
                  {/* Freelancer info row */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      {proposal.freelancer.profile?.avatarUrl ? (
                        <AvatarImage
                          src={proposal.freelancer.profile.avatarUrl}
                          alt={freelancerName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary-soft text-sm font-medium text-primary">
                        {getInitials(freelancerName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{freelancerName}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${STATUS_COLORS[proposal.status] || ''}`}
                        >
                          {PROPOSAL_STATUS_LABELS[proposal.status as ProposalStatus] || proposal.status}
                        </Badge>
                      </div>

                      {proposal.freelancer.profile?.headline && (
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {proposal.freelancer.profile.headline}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {proposal.freelancer.profile?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {proposal.freelancer.profile.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Price & Duration */}
                    <div className="shrink-0 text-left sm:text-left">
                      <p className="text-base font-bold text-primary">
                        {formatCurrencyToman(rialToToman(proposal.priceRial))}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {proposal.estimatedDuration}
                      </p>
                    </div>
                  </div>

                  {/* Cover letter */}
                  <div className="mt-4">
                    <p
                      className={`text-sm leading-7 text-text-secondary ${
                        isExpanded ? '' : 'line-clamp-3'
                      }`}
                    >
                      {proposal.coverLetter}
                    </p>
                    {proposal.coverLetter.length > 150 && (
                      <button
                        onClick={() => toggleExpand(proposal.id)}
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            بستن
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            ادامه مطلب
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  {canAct && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-wrap items-center gap-2">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            {proposal.status !== PROPOSAL_STATUS.VIEWED && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateProposalStatus(proposal.id, PROPOSAL_STATUS.VIEWED)
                                }
                              >
                                <Eye className="ml-1 h-3.5 w-3.5" />
                                مشاهده شد
                              </Button>
                            )}
                            {proposal.status !== PROPOSAL_STATUS.SHORTLISTED && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateProposalStatus(proposal.id, PROPOSAL_STATUS.SHORTLISTED)
                                }
                              >
                                <Star className="ml-1 h-3.5 w-3.5" />
                                انتخاب اولیه
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => setAcceptDialogId(proposal.id)}
                            >
                              <Check className="ml-1 h-3.5 w-3.5" />
                              قبول
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setRejectDialogId(proposal.id)}
                            >
                              <X className="ml-1 h-3.5 w-3.5" />
                              رد
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accept confirmation dialog */}
      <AlertDialog open={!!acceptDialogId} onOpenChange={(open) => !open && setAcceptDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>قبول پیشنهاد</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از قبول این پیشنهاد اطمینان دارید؟ با قبول پیشنهاد، فریلنسر می‌تواند گفتگو را آغاز کند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingId}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept} disabled={!!updatingId}>
              {updatingId ? 'در حال انجام...' : 'بله، قبول شود'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog with reason */}
      <AlertDialog open={!!rejectDialogId} onOpenChange={(open) => !open && setRejectDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>رد پیشنهاد</AlertDialogTitle>
            <AlertDialogDescription>
              لطفاً دلیل رد پیشنهاد را بنویسید تا به فریلنسر اطلاع داده شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="rejectReason">
              دلیل رد <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="دلیل رد پیشنهاد..."
              rows={3}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              حداقل ۱۰ کاراکتر
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingId}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!!updatingId}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {updatingId ? 'در حال انجام...' : 'رد پیشنهاد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
