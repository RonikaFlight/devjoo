'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-client';
import { formatBudgetRange, formatNumber, rialToToman, formatCurrencyToman } from '@/lib/utils/currency';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Briefcase,
  Send,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  WORK_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  BUDGET_TYPE_LABELS,
} from '@/types/enums';

type WorkType = keyof typeof WORK_TYPE_LABELS;
type ExperienceLevel = keyof typeof EXPERIENCE_LEVEL_LABELS;
type BudgetType = keyof typeof BUDGET_TYPE_LABELS;

interface ProjectData {
  id: string;
  slug: string;
  title: string;
  description: string;
  budgetType: string;
  budgetMinRial: number | null;
  budgetMaxRial: number | null;
  workType: string;
  experienceLevel: string | null;
  proposalLimit: number;
  currentProposalCount: number;
  createdAt: string;
  publishedAt: string | null;
  deadline: string | null;
  estimatedDuration: string | null;
  city: string | null;
  category: { id: string; name: string; slug: string } | null;
  skills: { skillId: string; skill: { id: string; name: string; slug: string } }[];
  employer: {
    id: string;
    displayName: string | null;
    profile: { avatarUrl: string | null; city: string | null; bio: string | null } | null;
  };
  statusEvents: {
    id: string;
    status: string;
    createdAt: string;
  }[];
}

export function ProjectDetailClient({ project }: { project: ProjectData }) {
  const { user, isLoggedIn, isFreelancer, isEmployer, isLoading } = useAuth();

  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [hasExistingProposal, setHasExistingProposal] = useState(false);
  const [checkingProposal, setCheckingProposal] = useState(false);

  // Proposal form state
  const [coverLetter, setCoverLetter] = useState('');
  const [priceToman, setPriceToman] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update proposal count after submission
  const [proposalCount, setProposalCount] = useState(project.currentProposalCount);

  const budget = formatBudgetRange(
    project.budgetMinRial,
    project.budgetMaxRial,
    project.budgetType,
  );

  const workTypeLabel =
    WORK_TYPE_LABELS[project.workType as WorkType] ?? project.workType;
  const experienceLabel = project.experienceLevel
    ? EXPERIENCE_LEVEL_LABELS[project.experienceLevel as ExperienceLevel] ??
      project.experienceLevel
    : null;

  const employerName = project.employer.displayName ?? 'کاربر';

  const employerInitials = employerName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  // Check if freelancer already submitted a proposal
  const checkExistingProposal = useCallback(async () => {
    if (!isLoggedIn || !isFreelancer) return;
    setCheckingProposal(true);
    try {
      const res = await fetch(`/api/v1/me/proposals?projectId=${project.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setHasExistingProposal(true);
        }
      }
    } catch {
      // silent
    } finally {
      setCheckingProposal(false);
    }
  }, [isLoggedIn, isFreelancer, project.id]);

  useEffect(() => {
    checkExistingProposal();
  }, [checkExistingProposal]);

  const isOwner = isLoggedIn && isEmployer && user?.id === project.employer.id;

  const handleOpenProposalDialog = () => {
    setCoverLetter('');
    setPriceToman('');
    setEstimatedDuration('');
    setProposalDialogOpen(true);
  };

  const handleSubmitProposal = async () => {
    // Validation
    if (coverLetter.trim().length < 50) {
      toast.error('متن پیشنهاد باید حداقل ۵۰ کاراکتر باشد.');
      return;
    }
    if (coverLetter.length > 5000) {
      toast.error('متن پیشنهاد نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد.');
      return;
    }

    const priceRialNum = Number(priceToman) * 10;
    if (!priceToman || priceRialNum < 100000) {
      toast.error('قیمت پیشنهادی باید حداقل ۱۰,۰۰۰ تومان باشد.');
      return;
    }

    if (!estimatedDuration.trim()) {
      toast.error('مدت زمان تخمینی الزامی است.');
      return;
    }
    if (estimatedDuration.length > 100) {
      toast.error('مدت زمان تخمینی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.slug}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceRial: priceRialNum,
          estimatedDuration: estimatedDuration.trim(),
          coverLetter: coverLetter.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || 'خطا در ارسال پیشنهاد.');
        return;
      }

      toast.success('پیشنهاد شما با موفقیت ارسال شد.');
      setProposalDialogOpen(false);
      setHasExistingProposal(true);
      setProposalCount((c) => c + 1);
    } catch {
      toast.error('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine button state
  const renderActionButton = () => {
    if (isLoading) {
      return (
        <Button className="w-full" size="lg" disabled>
          <Briefcase className="ml-2 h-4 w-4" />
          در حال بارگذاری...
        </Button>
      );
    }

    if (isOwner) {
      return (
        <Button className="w-full" size="lg" asChild>
          <Link href={`/project/${project.slug}/proposals`}>
            <Briefcase className="ml-2 h-4 w-4" />
            پیشنهادهای دریافت شده
          </Link>
        </Button>
      );
    }

    if (!isLoggedIn) {
      return (
        <Button className="w-full" size="lg" variant="outline" asChild>
          <Link href="/auth/login">
            نیاز به ورود
          </Link>
        </Button>
      );
    }

    if (!isFreelancer) {
      return (
        <Button className="w-full" size="lg" disabled>
          <Briefcase className="ml-2 h-4 w-4" />
          فقط فریلنسرها می‌توانند پیشنهاد ارسال کنند
        </Button>
      );
    }

    if (hasExistingProposal) {
      return (
        <div className="flex w-full items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          شما قبلاً پیشنهاد ارسال کرده‌اید
        </div>
      );
    }

    return (
      <Button
        className="w-full"
        size="lg"
        onClick={handleOpenProposalDialog}
      >
        <Send className="ml-2 h-4 w-4" />
        ارسال پیشنهاد
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div>
        <h1 className="text-2xl font-bold leading-relaxed text-text-primary sm:text-3xl">
          {project.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {project.category && (
            <Badge variant="secondary" className="text-xs">
              {project.category.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {BUDGET_TYPE_LABELS[project.budgetType as BudgetType] ?? project.budgetType}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Intl.DateTimeFormat('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(project.createdAt))}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Description & Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">توضیحات پروژه</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-8 text-text-secondary">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Skills Card with internal links */}
          {project.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">مهارت‌های مورد نیاز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((ps) => (
                    <Link
                      key={ps.skill.id}
                      href={`/projects/skills/${ps.skill.slug}`}
                      className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {ps.skill.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category & Related Links */}
          {project.category && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/projects/${project.category.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  مشاهده همه پروژه‌های {project.category.name}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Budget & Proposal Card */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="mb-1 text-sm text-text-secondary">بودجه</p>
                <p className="text-lg font-bold text-primary">{budget}</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Briefcase className="h-4 w-4" />
                  <span>پیشنهادها</span>
                </div>
                <span className="text-sm font-medium">
                  {formatNumber(proposalCount)}/
                  {formatNumber(project.proposalLimit)} پیشنهاد
                </span>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">نوع همکاری</span>
                  <span className="font-medium">{workTypeLabel}</span>
                </div>
                {experienceLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">سطح تجربه</span>
                    <span className="font-medium">{experienceLabel}</span>
                  </div>
                )}
                {project.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">موقعیت</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.city}
                    </span>
                  </div>
                )}
                {project.estimatedDuration && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">مدت تخمینی</span>
                    <span className="font-medium">{project.estimatedDuration}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">مهلت</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {new Intl.DateTimeFormat('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(new Date(project.deadline))}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {renderActionButton()}
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card>
            <CardContent className="p-5">
              <p className="mb-3 text-sm font-medium text-text-secondary">
                کارفرما
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  {project.employer.profile?.avatarUrl ? (
                    <AvatarImage
                      src={project.employer.profile.avatarUrl}
                      alt={employerName}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary-soft text-sm font-medium text-primary">
                    {employerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                    <p className="truncate text-sm font-semibold">
                      {employerName}
                    </p>
                  </div>
                  {project.employer.profile?.city && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="h-3 w-3" />
                      {project.employer.profile.city}
                    </p>
                  )}
                </div>
              </div>
              {project.employer.profile?.bio && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
                  {project.employer.profile.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Submission Dialog */}
      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ارسال پیشنهاد</DialogTitle>
            <DialogDescription>
              پیشنهاد خود را برای پروژه «{project.title}» ارسال کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="coverLetter">
                متن پیشنهاد <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="توضیح دهید که چرا شما بهترین گزینه برای این پروژه هستید..."
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                حداقل ۵۰ کاراکتر — {coverLetter.length}/۵۰۰۰
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priceToman">
                قیمت پیشنهادی (تومان) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="priceToman"
                type="number"
                min={10000}
                value={priceToman}
                onChange={(e) => setPriceToman(e.target.value)}
                placeholder="مثلاً ۵۰۰۰۰۰"
                dir="ltr"
              />
              {priceToman && Number(priceToman) * 10 >= 100000 && (
                <p className="text-xs text-muted-foreground">
                  معادل {formatNumber(Number(priceToman) * 10)} ریال
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">
                مدت زمان تخمینی <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="مثلاً: ۲ هفته، ۱ ماه"
                maxLength={100}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmitProposal}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'در حال ارسال...' : 'ارسال پیشنهاد'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setProposalDialogOpen(false)}
                disabled={submitting}
              >
                انصراف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
