import { db } from '@/lib/db';
import { PROJECT_STATUS } from '@/types/enums';
import type { ProjectFiltersInput } from '@/lib/validators/project';

export interface FeedItem {
  project: {
    id: string;
    title: string;
    slug: string;
    description: string;
    budgetType: string;
    fixedPriceRial: number | null;
    budgetMinRial: number | null;
    budgetMaxRial: number | null;
    experienceLevel: string | null;
    workType: string;
    city: string | null;
    createdAt: Date;
    category: { name: string; slug: string } | null;
    skills: { skill: { name: string; slug: string } }[];
    employer: {
      id: string;
      displayName: string | null;
      profile: { avatarUrl: string | null; city: string | null } | null;
    };
    _matchScore?: number | null;
  };
}

/**
 * Get personalized project feed for a freelancer.
 * Combines match-based ranking with recency and quality.
 */
export async function getSmartFeed(
  freelancerId: string,
  filters: ProjectFiltersInput
): Promise<{ feed: FeedItem[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const { page, limit, sort, search } = filters;

  // Get freelancer's skills
  const userSkills = await db.userSkill.findMany({
    where: { userId: freelancerId },
    select: { skillId: true },
  });
  const freelancerSkillIds = userSkills.map((s) => s.skillId);

  // Build where clause for published projects
  const where: Record<string, unknown> = { status: PROJECT_STATUS.PUBLISHED };

  // Exclude projects the freelancer already proposed to
  const proposedProjects = await db.proposal.findMany({
    where: { freelancerId },
    select: { projectId: true },
  });
  const proposedIds = new Set(proposedProjects.map((p) => p.projectId));

  // Exclude projects the freelancer already saved (optional — they can see saved)
  // Exclude own projects
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.budgetType) where.budgetType = filters.budgetType;
  if (filters.experienceLevel) where.experienceLevel = filters.experienceLevel;
  if (filters.workType) where.workType = filters.workType;
  if (filters.city) where.city = filters.city;
  if (filters.skills && filters.skills.length > 0) {
    where.skills = { some: { skillId: { in: filters.skills } } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Get projects with optional skill-based boosting
  let projects;
  let total;

  if (freelancerSkillIds.length > 0 && !filters.skills) {
    // Use match scores for ranking
    const matchWhere = {
      ...where,
      id: { notIn: Array.from(proposedIds) },
    };

    // Get projects that match freelancer's skills
    const skillMatchProjects = await db.project.findMany({
      where: {
        ...matchWhere,
        skills: { some: { skillId: { in: freelancerSkillIds } } },
      },
      include: {
        category: { select: { name: true, slug: true } },
        skills: { include: { skill: { select: { name: true, slug: true } } } },
        employer: {
          select: {
            id: true, displayName: true,
            profile: { select: { avatarUrl: true, city: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit * 3, // Fetch more for re-ranking
    });

    // Also get recent non-matching projects
    const recentProjects = await db.project.findMany({
      where: {
        ...matchWhere,
        id: { notIn: [...Array.from(proposedIds), ...skillMatchProjects.map((p) => p.id)] },
      },
      include: {
        category: { select: { name: true, slug: true } },
        skills: { include: { skill: { select: { name: true, slug: true } } } },
        employer: {
          select: {
            id: true, displayName: true,
            profile: { select: { avatarUrl: true, city: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    // Combine and re-rank: skill-matching projects first (sorted by match quality), then recent
    const allProjects = [
      ...skillMatchProjects.map((p) => ({
        ...p,
        _matchScore: computeQuickScore(p, freelancerSkillIds),
      })),
      ...recentProjects.map((p) => ({
        ...p,
        _matchScore: null,
      })),
    ];

    // Sort: match-scored projects by score desc, then by publishedAt desc
    allProjects.sort((a, b) => {
      // Projects with match scores come first
      if (a._matchScore !== null && b._matchScore === null) return -1;
      if (a._matchScore === null && b._matchScore !== null) return 1;
      if (a._matchScore !== null && b._matchScore !== null) {
        return b._matchScore - a._matchScore;
      }
      // Both null: sort by date
      return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
    });

    total = allProjects.length;
    const paginated = allProjects.slice((page - 1) * limit, page * limit);
    projects = paginated;
  } else {
    // No freelancer skills or explicit skill filter — use standard listing
    if (proposedIds.size > 0) {
      (where as Record<string, unknown>).id = { notIn: Array.from(proposedIds) };
    }

    let orderBy: Record<string, string> = { publishedAt: 'desc' };
    if (sort === 'oldest') orderBy = { publishedAt: 'asc' };
    else if (sort === 'budget_low') orderBy = { fixedPriceRial: 'asc' };
    else if (sort === 'budget_high') orderBy = { fixedPriceRial: 'desc' };
    else if (sort === 'most_proposals') orderBy = { currentProposalCount: 'desc' };

    const [result, count] = await Promise.all([
      db.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          skills: { include: { skill: { select: { name: true, slug: true } } } },
          employer: {
            select: {
              id: true, displayName: true,
              profile: { select: { avatarUrl: true, city: true } },
            },
          },
        },
      }),
      db.project.count({ where }),
    ]);

    projects = result;
    total = count;
  }

  return {
    feed: projects.map((p) => ({ project: p })),
    meta: {
      page,
      limit,
      total: total || 0,
      totalPages: Math.ceil((total || 0) / limit),
    },
  };
}

/**
 * Quick inline score for feed ranking (no DB calls per item).
 * Simple skill overlap ratio, weighted with quality score.
 */
function computeQuickScore(
  project: { skills: { skillId: string }[]; qualityScore: number | null; isUrgent: boolean; publishedAt: Date | null },
  freelancerSkillIds: string[]
): number {
  const projectSkillIds = project.skills.map((s) => s.skillId);
  const matchCount = projectSkillIds.filter((id) => freelancerSkillIds.includes(id)).length;
  const skillRatio = projectSkillIds.length > 0 ? matchCount / projectSkillIds.length : 0;

  // Skill overlap: 0-70 points
  let score = skillRatio * 70;

  // Quality bonus: 0-15 points
  if (project.qualityScore) {
    score += (project.qualityScore / 100) * 15;
  }

  // Recency bonus: 0-15 points (decays over 7 days)
  if (project.publishedAt) {
    const hoursOld = (Date.now() - project.publishedAt.getTime()) / (1000 * 60 * 60);
    const recencyFactor = Math.max(0, 1 - hoursOld / 168); // 7 days
    score += recencyFactor * 15;
  }

  // Urgent boost: +5
  if (project.isUrgent) score += 5;

  return Math.min(score, 100);
}
