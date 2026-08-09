/**
 * Employer Metrics Dashboard Service
 * ADR-019: On-demand analytics computation
 *
 * Comprehensive employer metrics:
 * - Hiring funnel (projects → proposals → shortlisted → accepted → completed)
 * - Spend analytics (total spent, by category, by month)
 * - Response metrics (time to respond to proposals, response rate)
 * - Project completion stats
 */

import { db } from '@/lib/db';

export interface EmployerDashboardResult {
  summary: {
    totalProjects: number;
    totalHires: number;
    totalSpentRial: number | null;
    averageResponseTimeHours: number | null;
    responseRate: number; // proposals that got any status update / total proposals
    hireRate: number; // accepted / total proposals received
    completionRate: number; // completed / hired
    averageProjectBudgetRial: number | null;
  };
  hiringFunnel: {
    totalProjects: number;
    projectsWithProposals: number;
    projectsShortlisted: number; // at least one SHORTLISTED proposal
    projectsHired: number; // at least one ACCEPTED proposal
    projectsCompleted: number;
  };
  spendByCategory: Array<{
    categoryId: string;
    categoryName: string;
    projects: number;
    totalSpentRial: number | null;
    avgProjectBudgetRial: number | null;
  }>;
  spendByMonth: Array<{
    month: string;
    projectsCreated: number;
    projectsCompleted: number;
    estimatedSpendRial: number | null;
  }>;
  responseTime: {
    averageHours: number | null;
    medianHours: number | null;
    under24h: number;
    under48h: number;
    over48h: number;
  };
}

/**
 * Get comprehensive employer dashboard metrics.
 */
export async function getEmployerDashboard(
  employerId: string
): Promise<EmployerDashboardResult> {
  // Fetch all projects with proposals and categories
  const projects = await db.project.findMany({
    where: { employerId },
    include: {
      category: { select: { id: true, name: true } },
      proposals: {
        select: {
          id: true,
          status: true,
          priceRial: true,
          createdAt: true,
          statusEvents: {
            select: { status: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return buildEmployerDashboard(projects);
}

// ============ Internal helpers ============

function buildEmployerDashboard(
  projects: Array<{
    id: string;
    status: string;
    budgetType: string;
    fixedPriceRial: number | null;
    budgetMinRial: number | null;
    budgetMaxRial: number | null;
    createdAt: Date;
    category: { id: string; name: string } | null;
    proposals: Array<{
      id: string;
      status: string;
      priceRial: number | null;
      createdAt: Date;
      statusEvents: Array<{ status: string; createdAt: Date }>;
    }>;
  }>
): EmployerDashboardResult {
  let totalProposalsReceived = 0;
  let proposalsResponded = 0;
  let proposalsAccepted = 0;
  const responseTimes: number[] = []; // hours between proposal created and first status change
  const categorySpendMap = new Map<string, {
    categoryId: string; categoryName: string;
    projects: number; totalBudget: number[];
  }>();
  const monthSpendMap = new Map<string, {
    created: number; completed: number; budgets: number[];
  }>();
  const budgetValues: number[] = [];

  let projectsWithProposals = 0;
  let projectsShortlisted = 0;
  let projectsHired = 0;
  let projectsCompleted = 0;

  for (const project of projects) {
    const hasProposals = project.proposals.length > 0;
    if (hasProposals) projectsWithProposals++;

    const hasShortlisted = project.proposals.some((p) => p.status === 'SHORTLISTED');
    if (hasShortlisted) projectsShortlisted++;

    const hasAccepted = project.proposals.some((p) => p.status === 'ACCEPTED');
    if (hasAccepted) projectsHired++;

    if (project.status === 'COMPLETED') projectsCompleted++;

    totalProposalsReceived += project.proposals.length;

    // Project budget for spend estimates
    const budget = project.budgetType === 'FIXED'
      ? project.fixedPriceRial
      : project.budgetMaxRial;
    if (budget != null) {
      budgetValues.push(budget);
    }

    // Category spend
    const catId = project.category?.id ?? '_none';
    const catName = project.category?.name ?? 'بدون دسته‌بندی';
    const catEntry = categorySpendMap.get(catId) ?? {
      categoryId: catId,
      categoryName: catName,
      projects: 0,
      totalBudget: [],
    };
    catEntry.projects++;
    if (budget != null) catEntry.totalBudget.push(budget);
    categorySpendMap.set(catId, catEntry);

    // Monthly
    const month = project.createdAt.toISOString().slice(0, 7);
    const monthEntry = monthSpendMap.get(month) ?? {
      created: 0,
      completed: 0,
      budgets: [],
    };
    monthEntry.created++;
    if (project.status === 'COMPLETED') monthEntry.completed++;
    if (budget != null) monthEntry.budgets.push(budget);
    monthSpendMap.set(month, monthEntry);

    // Response times: time from proposal submit to first status event
    for (const proposal of project.proposals) {
      if (proposal.statusEvents.length > 0) {
        proposalsResponded++;
        const firstEvent = proposal.statusEvents[0];
        const hours = (firstEvent.createdAt.getTime() - proposal.createdAt.getTime()) / (1000 * 60 * 60);
        responseTimes.push(hours);
      }
      if (proposal.status === 'ACCEPTED') proposalsAccepted++;
    }
  }

  // Summary
  const acceptedBudgets = projects
    .filter((p) => p.proposals.some((pr) => pr.status === 'ACCEPTED'))
    .map((p) => {
      const accepted = p.proposals.find((pr) => pr.status === 'ACCEPTED');
      return accepted?.priceRial ?? (p.budgetType === 'FIXED' ? p.fixedPriceRial : p.budgetMaxRial);
    })
    .filter((b): b is number => b != null);

  const summary = {
    totalProjects: projects.length,
    totalHires: projectsHired,
    totalSpentRial: acceptedBudgets.length > 0
      ? acceptedBudgets.reduce((a, b) => a + b, 0)
      : null,
    averageResponseTimeHours: responseTimes.length > 0
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
      : null,
    responseRate: totalProposalsReceived > 0
      ? Math.round((proposalsResponded / totalProposalsReceived) * 10000) / 100
      : 0,
    hireRate: totalProposalsReceived > 0
      ? Math.round((proposalsAccepted / totalProposalsReceived) * 10000) / 100
      : 0,
    completionRate: projectsHired > 0
      ? Math.round((projectsCompleted / projectsHired) * 10000) / 100
      : 0,
    averageProjectBudgetRial: budgetValues.length > 0
      ? Math.round((budgetValues.reduce((a, b) => a + b, 0) / budgetValues.length) * 100) / 100
      : null,
  };

  // Response time buckets
  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const medianHours = sortedTimes.length > 0
    ? sortedTimes.length % 2 !== 0
      ? Math.round(sortedTimes[Math.floor(sortedTimes.length / 2)] * 100) / 100
      : Math.round(((sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2) * 100) / 100
    : null;

  // Category spend
  const spendByCategory = Array.from(categorySpendMap.values())
    .sort((a, b) => b.projects - a.projects)
    .map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      projects: c.projects,
      totalSpentRial: c.totalBudget.length > 0
        ? c.totalBudget.reduce((a, b) => a + b, 0)
        : null,
      avgProjectBudgetRial: c.totalBudget.length > 0
        ? Math.round((c.totalBudget.reduce((a, b) => a + b, 0) / c.totalBudget.length) * 100) / 100
        : null,
    }));

  // Monthly spend
  const spendByMonth = Array.from(monthSpendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      projectsCreated: data.created,
      projectsCompleted: data.completed,
      estimatedSpendRial: data.budgets.length > 0
        ? data.budgets.reduce((a, b) => a + b, 0)
        : null,
    }));

  return {
    summary,
    hiringFunnel: {
      totalProjects: projects.length,
      projectsWithProposals,
      projectsShortlisted,
      projectsHired,
      projectsCompleted,
    },
    spendByCategory,
    spendByMonth,
    responseTime: {
      averageHours: summary.averageResponseTimeHours,
      medianHours,
      under24h: responseTimes.filter((t) => t < 24).length,
      under48h: responseTimes.filter((t) => t >= 24 && t < 48).length,
      over48h: responseTimes.filter((t) => t >= 48).length,
    },
  };
}
