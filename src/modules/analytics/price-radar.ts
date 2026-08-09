/**
 * Price Radar Service
 * ADR-019: On-demand analytics computation
 *
 * Market rate intelligence:
 * - Average/median project prices by category and skill
 * - Percentile breakdowns (P25, P50, P75, P90) for budgets
 * - Freelancer hourly rate distribution by skill
 * - Proposal price vs project budget comparison
 */

import { db } from '@/lib/db';
import type { PriceRadarFilters } from '@/lib/validators/analytics';

export interface PriceRadarResult {
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    projectCount: number;
    avgBudgetRial: number | null;
    medianBudgetRial: number | null;
    p25: number | null;
    p75: number | null;
    p90: number | null;
  }>;
  bySkill: Array<{
    skillId: string;
    skillName: string;
    projectCount: number;
    avgBudgetRial: number | null;
    medianBudgetRial: number | null;
  }>;
  freelancerRates: Array<{
    experienceLevel: string;
    count: number;
    avgHourlyRateRial: number | null;
    medianHourlyRateRial: number | null;
    p25: number | null;
    p75: number | null;
  }>;
  proposalVsBudget: {
    avgProposalPriceRial: number | null;
    avgProjectBudgetRial: number | null;
    ratio: number | null; // proposal/budget ratio
    underBudget: number;
    overBudget: number;
    withinBudget: number;
  };
}

/**
 * Get price radar data for the marketplace.
 */
export async function getPriceRadar(
  filters?: PriceRadarFilters
): Promise<PriceRadarResult> {
  const where: Record<string, unknown> = { status: 'PUBLISHED' };
  if (filters?.categoryId) where.categoryId = filters.categoryId;

  // Fetch published projects with budget data, skills, and proposals
  const projects = await db.project.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      proposals: {
        where: { status: { in: ['ACCEPTED', 'SUBMITTED'] } },
        select: { priceRial: true },
      },
    },
    take: 5000,
  });

  // Fetch freelancer rates
  const freelancerProfiles = await db.freelancerProfile.findMany({
    where: { hourlyRateRial: { not: null } },
    include: {
      profile: {
        select: {
          userId: true,
          userSkills: {
            select: { skillId: true },
          },
        },
      },
    },
    take: 5000,
  });

  return buildPriceRadar(projects, freelancerProfiles);
}

// ============ Internal helpers ============

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function buildPriceRadar(
  projects: Array<{
    id: string;
    budgetType: string;
    fixedPriceRial: number | null;
    budgetMinRial: number | null;
    budgetMaxRial: number | null;
    category: { id: string; name: string } | null;
    skills: Array<{ skillId: string; skill: { id: string; name: string } }>;
    proposals: Array<{ priceRial: number | null }>;
  }>,
  freelancerProfiles: Array<{
    experienceLevel: string | null;
    hourlyRateRial: number | null;
    profile: {
      userId: string;
      userSkills: Array<{ skillId: string }>;
    };
  }>
): PriceRadarResult {
  // Effective budget per project
  const getBudget = (p: typeof projects[0]): number | null => {
    if (p.budgetType === 'FIXED' && p.fixedPriceRial != null) return p.fixedPriceRial;
    if (p.budgetType === 'HOURLY' && p.budgetMaxRial != null) return p.budgetMaxRial;
    if (p.fixedPriceRial != null) return p.fixedPriceRial;
    if (p.budgetMaxRial != null) return p.budgetMaxRial;
    return null;
  };

  // By category
  const catMap = new Map<string, { budgets: number[] }>();
  const skillMap = new Map<string, { budgets: number[] }>();
  const allBudgets: number[] = [];
  let underBudget = 0;
  let overBudget = 0;
  let withinBudget = 0;
  const proposalPrices: number[] = [];

  for (const project of projects) {
    const budget = getBudget(project);
    if (budget != null) {
      allBudgets.push(budget);
    }

    // Category
    const catId = project.category?.id ?? '_none';
    const catEntry = catMap.get(catId);
    if (catEntry) {
      if (budget != null) catEntry.budgets.push(budget);
    } else {
      catMap.set(catId, { budgets: budget != null ? [budget] : [] });
    }

    // Skills
    for (const ps of project.skills) {
      const sEntry = skillMap.get(ps.skillId);
      if (sEntry) {
        if (budget != null) sEntry.budgets.push(budget);
      } else {
        skillMap.set(ps.skillId, { budgets: budget != null ? [budget] : [] });
      }
    }

    // Proposal vs budget
    for (const proposal of project.proposals) {
      if (proposal.priceRial != null) {
        proposalPrices.push(proposal.priceRial);
        if (budget != null) {
          if (proposal.priceRial < budget * 0.9) underBudget++;
          else if (proposal.priceRial > budget * 1.1) overBudget++;
          else withinBudget++;
        }
      }
    }
  }

  // Build category results
  const byCategory = projects
    .filter((p) => p.category)
    .reduce(
      (acc, p) => {
        const cat = p.category!;
        if (!acc.has(cat.id)) {
          acc.set(cat.id, { categoryId: cat.id, categoryName: cat.name, budgets: [] as number[], projectCount: 0 });
        }
        const entry = acc.get(cat.id)!;
        entry.projectCount++;
        const b = getBudget(p);
        if (b != null) entry.budgets.push(b);
        return acc;
      },
      new Map<string, { categoryId: string; categoryName: string; budgets: number[]; projectCount: number }>()
    );

  const byCategoryResult = Array.from(byCategory.values())
    .sort((a, b) => b.projectCount - a.projectCount)
    .map((c) => {
      const sorted = [...c.budgets].sort((a, b) => a - b);
      return {
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        projectCount: c.projectCount,
        avgBudgetRial: c.budgets.length > 0
          ? Math.round(c.budgets.reduce((a, b) => a + b, 0) / c.budgets.length)
          : null,
        medianBudgetRial: sorted.length > 0
          ? sorted[Math.floor(sorted.length / 2)]
          : null,
        p25: sorted.length > 0 ? percentile(sorted, 25) : null,
        p75: sorted.length > 0 ? percentile(sorted, 75) : null,
        p90: sorted.length > 0 ? percentile(sorted, 90) : null,
      };
    });

  // Build skill results
  const skillData = new Map<string, { skillId: string; skillName: string; budgets: number[]; projectCount: number }>();
  for (const project of projects) {
    const budget = getBudget(project);
    for (const ps of project.skills) {
      const entry = skillData.get(ps.skillId) ?? {
        skillId: ps.skillId,
        skillName: ps.skill.name,
        budgets: [],
        projectCount: 0,
      };
      entry.projectCount++;
      if (budget != null) entry.budgets.push(budget);
      skillData.set(ps.skillId, entry);
    }
  }

  const bySkill = Array.from(skillData.values())
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 50) // Top 50 skills
    .map((s) => {
      const sorted = [...s.budgets].sort((a, b) => a - b);
      return {
        skillId: s.skillId,
        skillName: s.skillName,
        projectCount: s.projectCount,
        avgBudgetRial: s.budgets.length > 0
          ? Math.round(s.budgets.reduce((a, b) => a + b, 0) / s.budgets.length)
          : null,
        medianBudgetRial: sorted.length > 0
          ? sorted[Math.floor(sorted.length / 2)]
          : null,
      };
    });

  // Freelancer rates by experience level
  const levelMap = new Map<string, number[]>();
  for (const fp of freelancerProfiles) {
    if (fp.hourlyRateRial == null) continue;
    const level = fp.experienceLevel ?? 'UNKNOWN';
    const entry = levelMap.get(level) ?? [];
    entry.push(fp.hourlyRateRial);
    levelMap.set(level, entry);
  }

  const EXPERIENCE_LABELS: Record<string, string> = {
    JUNIOR: 'مبتدی',
    MID_LEVEL: 'متوسط',
    SENIOR: 'ارشد',
    EXPERT: 'حرفه‌ای',
    UNKNOWN: 'نامشخص',
  };

  const freelancerRates = Array.from(levelMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([level, rates]) => {
      const sorted = [...rates].sort((a, b) => a - b);
      return {
        experienceLevel: level,
        count: rates.length,
        avgHourlyRateRial: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
        medianHourlyRateRial: sorted[Math.floor(sorted.length / 2)],
        p25: percentile(sorted, 25),
        p75: percentile(sorted, 75),
      };
    });

  // Proposal vs budget
  const avgProposalPrice = proposalPrices.length > 0
    ? Math.round(proposalPrices.reduce((a, b) => a + b, 0) / proposalPrices.length)
    : null;
  const avgProjectBudget = allBudgets.length > 0
    ? Math.round(allBudgets.reduce((a, b) => a + b, 0) / allBudgets.length)
    : null;

  return {
    byCategory: byCategoryResult,
    bySkill,
    freelancerRates,
    proposalVsBudget: {
      avgProposalPriceRial: avgProposalPrice,
      avgProjectBudgetRial: avgProjectBudget,
      ratio: avgProjectBudget && avgProposalPrice
        ? Math.round((avgProposalPrice / avgProjectBudget) * 10000) / 100
        : null,
      underBudget,
      overBudget,
      withinBudget,
    },
  };
}
