'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  Building2,
  User,
} from 'lucide-react';
import { formatBudgetRange, formatNumber } from '@/lib/utils/currency';
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
  const [isLoggedIn] = useState(false);

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

          {/* Skills Card */}
          {project.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">مهارت‌های مورد نیاز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((ps) => (
                    <span
                      key={ps.skill.id}
                      className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm text-primary"
                    >
                      {ps.skill.name}
                    </span>
                  ))}
                </div>
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
                  {formatNumber(project.currentProposalCount)}/
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

              <Button className="w-full" size="lg" disabled={!isLoggedIn}>
                <Bookmark className="ml-2 h-4 w-4" />
                {isLoggedIn ? 'ارسال پیشنهاد' : 'نیاز به ورود'}
              </Button>
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
    </div>
  );
}
