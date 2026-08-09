import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { formatBudgetRange, rialToToman, formatCurrencyToman, formatNumber } from '@/lib/utils/currency';
import { PROJECT_STATUS_LABELS, BUDGET_TYPE_LABELS, WORK_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from '@/types/enums';

export interface ProjectCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  budgetType: string;
  fixedPriceRial: number | null;
  budgetMinRial: number | null;
  budgetMaxRial: number | null;
  workType: string;
  experienceLevel: string | null;
  proposalLimit: number;
  currentProposalCount: number;
  createdAt: string;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  skills: { skill: { name: string; slug: string } }[];
  employer: {
    id: string;
    displayName: string | null;
    profile: { avatarUrl: string | null; city: string | null } | null;
  };
}

export function ProjectCard({ project }: { project: ProjectCardProps }) {
  const budget = formatBudgetRange(
    project.budgetMinRial,
    project.budgetMaxRial,
    project.budgetType
  );

  return (
    <Link href={`/project/${project.slug}`}>
      <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="p-5">
          {/* Header: category + budget type */}
          <div className="mb-3 flex items-center gap-2">
            {project.category && (
              <Badge variant="secondary" className="text-xs">
                {project.category.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {BUDGET_TYPE_LABELS[project.budgetType as keyof typeof BUDGET_TYPE_LABELS] || project.budgetType}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-base font-semibold leading-relaxed group-hover:text-primary">
            {project.title}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>

          {/* Skills */}
          {project.skills.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.skills.slice(0, 4).map((ps) => (
                <span
                  key={ps.skill.id}
                  className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs text-primary"
                >
                  {ps.skill.name}
                </span>
              ))}
              {project.skills.length > 4 && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  +{project.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer: budget + meta */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">
              {budget}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {project.employer.profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {project.employer.profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {formatNumber(project.currentProposalCount)}/{formatNumber(project.proposalLimit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
