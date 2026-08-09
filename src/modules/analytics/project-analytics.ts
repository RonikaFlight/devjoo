/**
 * Project Analytics Service
 * ADR-019: On-demand analytics computation
 *
 * Provides project-level insights:
 * - Lifecycle distribution (draft → completed/cancelled)
 * - Time-to-hire (publish → first accepted proposal)
 * - Category trends (projects by category over time)
 * - Proposal conversion funnel (views → proposals → hires)
 */

import { db } from '@/lib/db';
import type { ProjectAnalyticsFilters } from '@/lib/validators/analytics';

export interface ProjectAnalyticsResult {
  summary: {
    totalProjects: number;
    publishedProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    cancelledProjects: number;
    completionRate: number;
    averageQualityScore: number | null;
    averageProposalCount: number | null;
    averageTimeToHireHours: number | null;
  };
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    published: number;
    completed: number;
    avgProposals: number | null;
    avgQualityScore: number | null;
  }>;
  byMonth: Array<{
    month: string;
    created: number;
    published: number;
    completed: number;
    avgProposals: number | null;
  }>;
}

/**
 * Get project analytics for an employer.
 */
export async function getEmployerProjectAnalytics(
  employerId: string,
  filters?: ProjectAnalyticsFilters
): Promise<ProjectAnalyticsResult> {
  const startDate = filters?.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters?.endDate ? new Date(filters.endDate) : undefined;

  const where: Record<string, unknown> = { employerId };
  if (startDate || endDate) {
    where.createdAt = {} as Record<string, Date>;
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
  }

  const projects = await db.project.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      proposals: { select: { id: true, status: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return buildProjectAnalytics(projects);
}

/**
 * Get global project analytics (admin/platform-wide).
 */
export async function getGlobalProjectAnalytics(
  filters?: ProjectAnalyticsFilters
): Promise<ProjectAnalyticsResult> {
  const startDate = filters?.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters?.endDate ? new Date(filters.endDate) : undefined;

  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.createdAt = {} as Record<string, Date>;
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
  }

  const projects = await db.project.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      proposals: { select: { id: true, status: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000, // Safety cap for global queries
  });

  return buildProjectAnalytics(projects);
}

// ============ Internal helpers ============

function buildProjectAnalytics(
  projects: Array<{
    id: string;
    status: string;
    qualityScore: number | null;
    currentProposalCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    category: { id: string; name: string } | null;
    proposals: Array<{ id: string; status: string; createdAt: Date }>;
  }>
): ProjectAnalyticsResult {
  const statusCounts: Record<string, number> = {};
  const categoryMap = new Map<string, {
    categoryId: string; categoryName: string;
    total: number; published: number; completed: number;
    proposalCounts: number[]; qualityScores: number[];
  }>();
  const monthMap = new Map<string, { created: number; published: number; completed: number; proposalCounts: number[] }>();
  const timeToHireValues: number[] = [];

  for (const p of projects) {
    // Status distribution
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;

    // Category
    const catId = p.category?.id ?? '_none';
    const catName = p.category?.name ?? 'بدون دسته‌بندی';
    const catEntry = categoryMap.get(catId) ?? {
      categoryId: catId,
      categoryName: catName,
      total: 0,
      published: 0,
      completed: 0,
      proposalCounts: [],
      qualityScores: [],
    };
    catEntry.total++;
    if (p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED') catEntry.published++;
    if (p.status === 'COMPLETED') catEntry.completed++;
    catEntry.proposalCounts.push(p.currentProposalCount);
    if (p.qualityScore != null) catEntry.qualityScores.push(p.qualityScore);
    categoryMap.set(catId, catEntry);

    // By month (creation)
    const month = p.createdAt.toISOString().slice(0, 7);
    const monthEntry = monthMap.get(month) ?? {
      created: 0,
      published: 0,
      completed: 0,
      proposalCounts: [],
    };
    monthEntry.created++;
    if (p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED') {
      monthEntry.published++;
    }
    if (p.status === 'COMPLETED') monthEntry.completed++;
    monthEntry.proposalCounts.push(p.currentProposalCount);
    monthMap.set(month, monthEntry);

    // Time to hire: publishedAt → first ACCEPTED proposal
    if (p.publishedAt) {
      const accepted = p.proposals.find((pr) => pr.status === 'ACCEPTED');
      if (accepted) {
        const hours = (accepted.createdAt.getTime() - p.publishedAt.getTime()) / (1000 * 60 * 60);
        timeToHireValues.push(hours);
      }
    }
  }

  const total = projects.length;
  const published = projects.filter(
    (p) => p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'
  ).length;
  const completed = projects.filter((p) => p.status === 'COMPLETED').length;

  const allProposalCounts = projects.map((p) => p.currentProposalCount);
  const allQualityScores = projects
    .map((p) => p.qualityScore)
    .filter((s): s is number => s != null);

  const summary = {
    totalProjects: total,
    publishedProjects: published,
    completedProjects: completed,
    inProgressProjects: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    cancelledProjects: projects.filter((p) => p.status === 'CANCELLED').length,
    completionRate: published > 0
      ? Math.round((completed / published) * 10000) / 100
      : 0,
    averageQualityScore: allQualityScores.length > 0
      ? Math.round((allQualityScores.reduce((a, b) => a + b, 0) / allQualityScores.length) * 100) / 100
      : null,
    averageProposalCount: allProposalCounts.length > 0
      ? Math.round((allProposalCounts.reduce((a, b) => a + b, 0) / allProposalCounts.length) * 100) / 100
      : null,
    averageTimeToHireHours: timeToHireValues.length > 0
      ? Math.round((timeToHireValues.reduce((a, b) => a + b, 0) / timeToHireValues.length) * 100) / 100
      : null,
  };

  const statusDistribution = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 10000) / 100,
    }));

  const byCategory = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      total: c.total,
      published: c.published,
      completed: c.completed,
      avgProposals: c.proposalCounts.length > 0
        ? Math.round((c.proposalCounts.reduce((a, b) => a + b, 0) / c.proposalCounts.length) * 100) / 100
        : null,
      avgQualityScore: c.qualityScores.length > 0
        ? Math.round((c.qualityScores.reduce((a, b) => a + b, 0) / c.qualityScores.length) * 100) / 100
        : null,
    }));

  const byMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      created: data.created,
      published: data.published,
      completed: data.completed,
      avgProposals: data.proposalCounts.length > 0
        ? Math.round((data.proposalCounts.reduce((a, b) => a + b, 0) / data.proposalCounts.length) * 100) / 100
        : null,
    }));

  return { summary, statusDistribution, byCategory, byMonth };
}
