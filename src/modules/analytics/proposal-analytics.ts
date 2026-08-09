/**
 * Proposal Analytics Service
 * ADR-019: On-demand analytics computation
 *
 * Provides proposal-level insights for freelancers and employers:
 * - Win rate, status distribution, success by category
 * - Average response time, average proposal price
 * - Proposal velocity (proposals per week/month)
 */

import { db } from '@/lib/db';
import type { ProposalAnalyticsFilters } from '@/lib/validators/analytics';

export interface ProposalAnalyticsResult {
  summary: {
    totalProposals: number;
    acceptedProposals: number;
    rejectedProposals: number;
    pendingProposals: number;
    withdrawnProposals: number;
    winRate: number; // accepted / (accepted + rejected)
    averagePriceRial: number | null;
    medianPriceRial: number | null;
  };
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    accepted: number;
    winRate: number;
    avgPriceRial: number | null;
  }>;
  byMonth: Array<{
    month: string; // YYYY-MM
    total: number;
    accepted: number;
    winRate: number;
  }>;
  velocity: {
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
}

/**
 * Get proposal analytics for a freelancer.
 */
export async function getFreelancerProposalAnalytics(
  freelancerId: string,
  filters?: ProposalAnalyticsFilters
): Promise<ProposalAnalyticsResult> {
  const startDate = filters?.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters?.endDate ? new Date(filters.endDate) : undefined;

  const where: Record<string, unknown> = { freelancerId };
  if (startDate || endDate) {
    where.createdAt = {} as Record<string, Date>;
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
  }

  // Fetch all proposals with project category info
  const proposals = await db.proposal.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  return buildProposalAnalytics(proposals);
}

/**
 * Get proposal analytics for an employer (proposals received on their projects).
 */
export async function getEmployerProposalAnalytics(
  employerId: string,
  filters?: ProposalAnalyticsFilters
): Promise<ProposalAnalyticsResult> {
  const startDate = filters?.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters?.endDate ? new Date(filters.endDate) : undefined;

  const projectWhere: Record<string, unknown> = { employerId };
  if (startDate || endDate) {
    // For employer, we filter on proposal createdAt
  }

  const proposals = await db.proposal.findMany({
    where: {
      project: projectWhere,
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      } : {}),
    },
    include: {
      project: {
        select: {
          id: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  return buildProposalAnalytics(proposals);
}

// ============ Internal helpers ============

function buildProposalAnalytics(
  proposals: Array<{
    id: string;
    status: string;
    priceRial: number | null;
    createdAt: Date;
    project: {
      id: string;
      categoryId: string | null;
      category: { id: string; name: string } | null;
    } | null;
  }>
): ProposalAnalyticsResult {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const summary = {
    totalProposals: proposals.length,
    acceptedProposals: 0,
    rejectedProposals: 0,
    pendingProposals: 0,
    withdrawnProposals: 0,
    winRate: 0,
    averagePriceRial: null as number | null,
    medianPriceRial: null as number | null,
  };

  const categoryMap = new Map<string, { categoryId: string; categoryName: string; total: number; accepted: number; prices: number[] }>();
  const monthMap = new Map<string, { total: number; accepted: number }>();
  const prices: number[] = [];

  let thisWeek = 0;
  let thisMonth = 0;
  let lastMonth = 0;
  let thisYear = 0;

  for (const p of proposals) {
    // Status counts
    if (p.status === 'ACCEPTED') summary.acceptedProposals++;
    else if (p.status === 'REJECTED') summary.rejectedProposals++;
    else if (p.status === 'WITHDRAWN') summary.withdrawnProposals++;
    else summary.pendingProposals++;

    // Price
    if (p.priceRial != null) {
      prices.push(p.priceRial);
    }

    // By category
    const catId = p.project?.categoryId;
    const catName = p.project?.category?.name ?? 'بدون دسته‌بندی';
    if (catId) {
      const existing = categoryMap.get(catId);
      if (existing) {
        existing.total++;
        if (p.status === 'ACCEPTED') existing.accepted++;
        if (p.priceRial != null) existing.prices.push(p.priceRial);
      } else {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          total: 1,
          accepted: p.status === 'ACCEPTED' ? 1 : 0,
          prices: p.priceRial != null ? [p.priceRial] : [],
        });
      }
    }

    // By month
    const month = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
    const monthEntry = monthMap.get(month);
    if (monthEntry) {
      monthEntry.total++;
      if (p.status === 'ACCEPTED') monthEntry.accepted++;
    } else {
      monthMap.set(month, { total: 1, accepted: p.status === 'ACCEPTED' ? 1 : 0 });
    }

    // Velocity
    if (p.createdAt >= thisWeekStart) thisWeek++;
    if (p.createdAt >= thisMonthStart) thisMonth++;
    if (p.createdAt >= lastMonthStart && p.createdAt <= lastMonthEnd) lastMonth++;
    if (p.createdAt >= thisYearStart) thisYear++;
  }

  // Win rate
  const decided = summary.acceptedProposals + summary.rejectedProposals;
  summary.winRate = decided > 0
    ? Math.round((summary.acceptedProposals / decided) * 10000) / 100
    : 0;

  // Average price
  if (prices.length > 0) {
    summary.averagePriceRial = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    summary.medianPriceRial = sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  // By category
  const byCategory = Array.from(categoryMap.values()).map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    total: c.total,
    accepted: c.accepted,
    winRate: c.total > 0
      ? Math.round((c.accepted / c.total) * 10000) / 100
      : 0,
    avgPriceRial: c.prices.length > 0
      ? Math.round(c.prices.reduce((a, b) => a + b, 0) / c.prices.length)
      : null,
  })).sort((a, b) => b.total - a.total);

  // By month
  const byMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total: data.total,
      accepted: data.accepted,
      winRate: data.total > 0
        ? Math.round((data.accepted / data.total) * 10000) / 100
        : 0,
    }));

  return {
    summary,
    byCategory,
    byMonth,
    velocity: {
      thisWeek,
      thisMonth,
      lastMonth,
      thisYear,
    },
  };
}
