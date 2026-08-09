import { db } from '@/lib/db';
import { PROJECT_STATUS, AVAILABILITY } from '@/types/enums';
import { computeReputationScore } from '@/modules/reputation/service';

export interface MatchBreakdown {
  skillOverlap: number;
  budgetFit: number;
  availabilityFit: number;
  experienceFit: number;
  reputationBonus: number;
}

export interface MatchResult {
  freelancerId: string;
  score: number;
  breakdown: MatchBreakdown;
  freelancer?: {
    id: string;
    displayName: string | null;
    profile: {
      avatarUrl: string | null;
      headline: string | null;
      city: string | null;
    } | null;
    freelancerProfile?: {
      hourlyRateRial: number | null;
      availability: string;
      averageRating: number | null;
      totalCompletedProjects: number;
    } | null;
  };
}

/**
 * Compute match score between a project and a single freelancer.
 * Returns 0-100 score with breakdown.
 */
export async function scoreMatch(
  projectId: string,
  freelancerId: string
): Promise<{ score: number; breakdown: MatchBreakdown } | null> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      skills: { select: { skillId: true } },
    },
  });

  if (!project) return null;

  // Get freelancer skills
  const userSkills = await db.userSkill.findMany({
    where: { userId: freelancerId },
    select: { skillId: true, proficiencyLevel: true },
  });

  const freelancerSkillIds = new Set(userSkills.map((s) => s.skillId));
  const projectSkillIds = project.skills.map((s) => s.skillId);

  // 1. Skill Overlap (0-40 points)
  const skillOverlap = computeSkillOverlap(projectSkillIds, freelancerSkillIds, userSkills);

  // 2. Budget Fit (0-20 points)
  const budgetFit = computeBudgetFit(project, freelancerId);

  // 3. Availability Fit (0-15 points)
  const availabilityFit = await computeAvailabilityFit(project, freelancerId);

  // 4. Experience Fit (0-10 points)
  const experienceFit = computeExperienceFit(project, freelancerId);

  // 5. Reputation Bonus (0-15 points)
  const reputationScore = await computeReputationScore(freelancerId);
  const reputationBonus = reputationScore / 100 * 15;

  const totalScore = Math.round(skillOverlap + budgetFit + availabilityFit + experienceFit + reputationBonus);

  return {
    score: Math.min(totalScore, 100),
    breakdown: {
      skillOverlap: Math.round(skillOverlap * 10) / 10,
      budgetFit: Math.round(budgetFit * 10) / 10,
      availabilityFit: Math.round(availabilityFit * 10) / 10,
      experienceFit: Math.round(experienceFit * 10) / 10,
      reputationBonus: Math.round(reputationBonus * 10) / 10,
    },
  };
}

/**
 * Get top matches for a project (used by employers for reverse hiring).
 */
export async function getProjectMatches(
  projectId: string,
  limit = 20
): Promise<MatchResult[]> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { skills: { select: { skillId: true } } },
  });

  if (!project) return [];

  const projectSkillIds = project.skills.map((s) => s.skillId);

  if (projectSkillIds.length === 0) return [];

  // Find freelancers who have at least one matching skill
  const candidates = await db.userSkill.findMany({
    where: {
      skillId: { in: projectSkillIds },
    },
    distinct: ['userId'],
    select: { userId: true },
    take: 100, // Cap candidates to avoid heavy computation
  });

  // Filter out the project owner and already-invited freelancers
  const existingInvitations = await db.projectInvitation.findMany({
    where: { projectId, status: { in: ['SENT', 'ACCEPTED'] } },
    select: { freelancerId: true },
  });
  const invitedIds = new Set(existingInvitations.map((i) => i.freelancerId));

  const existingProposals = await db.proposal.findMany({
    where: { projectId },
    select: { freelancerId: true },
  });
  const proposedIds = new Set(existingProposals.map((p) => p.freelancerId));

  const eligible = candidates.filter(
    (c) =>
      c.userId !== project.employerId &&
      !invitedIds.has(c.userId) &&
      !proposedIds.has(c.userId)
  );

  // Score each candidate
  const scored: MatchResult[] = [];
  for (const candidate of eligible) {
    const result = await scoreMatch(projectId, candidate.userId);
    if (result && result.score > 0) {
      const freelancer = await db.user.findUnique({
        where: { id: candidate.userId },
        select: {
          id: true,
          displayName: true,
          profile: {
            select: { avatarUrl: true, headline: true, city: true,
              freelancerProfile: {
                select: {
                  hourlyRateRial: true, availability: true,
                  averageRating: true, totalCompletedProjects: true,
                },
              },
            },
          },
        },
      });
      scored.push({
        freelancerId: candidate.userId,
        score: result.score,
        breakdown: result.breakdown,
        freelancer: freelancer ? {
          id: freelancer.id,
          displayName: freelancer.displayName,
          profile: freelancer.profile,
        } : undefined,
      });
    }
  }

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Compute and persist match scores for a project (called after project publish).
 */
export async function computeAndStoreMatches(projectId: string): Promise<number> {
  const matches = await getProjectMatches(projectId, 50);

  // Upsert match scores
  await db.$transaction(
    matches.map((m) =>
      db.matchScore.upsert({
        where: { projectId_freelancerId: { projectId, freelancerId: m.freelancerId } },
        create: {
          projectId,
          freelancerId: m.freelancerId,
          score: m.score,
          breakdown: JSON.stringify(m.breakdown),
        },
        update: {
          score: m.score,
          breakdown: JSON.stringify(m.breakdown),
        },
      })
    )
  );

  return matches.length;
}

/**
 * Get stored match scores for a freelancer (for their smart feed).
 */
export async function getFreelancerMatchScores(
  freelancerId: string,
  page = 1,
  limit = 20
) {
  const where = {
    freelancerId,
    project: { status: PROJECT_STATUS.PUBLISHED },
  };

  const [matches, total] = await Promise.all([
    db.matchScore.findMany({
      where,
      orderBy: { score: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: {
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
        },
      },
    }),
    db.matchScore.count({ where }),
  ]);

  return {
    matches,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// --- Internal scoring functions ---

function computeSkillOverlap(
  projectSkillIds: string[],
  freelancerSkillIds: Set<string>,
  userSkills: { skillId: string; proficiencyLevel: string | null }[]
): number {
  if (projectSkillIds.length === 0) return 0;

  const proficiencyWeights: Record<string, number> = {
    BEGINNER: 0.6,
    INTERMEDIATE: 0.8,
    ADVANCED: 0.95,
    EXPERT: 1.0,
  };

  let weightedMatch = 0;
  let totalWeight = 0;

  for (const skillId of projectSkillIds) {
    totalWeight += 1;
    if (freelancerSkillIds.has(skillId)) {
      const userSkill = userSkills.find((s) => s.skillId === skillId);
      const profWeight = userSkill?.proficiencyLevel
        ? (proficiencyWeights[userSkill.proficiencyLevel] ?? 0.7)
        : 0.7;
      weightedMatch += profWeight;
    }
  }

  return totalWeight > 0 ? (weightedMatch / totalWeight) * 40 : 0;
}

async function computeBudgetFit(
  project: { budgetType: string; fixedPriceRial: number | null; budgetMinRial: number | null; budgetMaxRial: number | null },
  freelancerId: string
): number {
  const freelancerProfile = await db.freelancerProfile.findFirst({
    where: { profile: { userId: freelancerId } },
    select: { hourlyRateRial: true },
  });

  if (!freelancerProfile?.hourlyRateRial) return 10; // Neutral if no rate set

  const rate = freelancerProfile.hourlyRateRial;

  if (project.budgetType === 'FIXED' && project.fixedPriceRial) {
    // For fixed price: assume ~40 hours, check if rate is within range
    const impliedHourly = project.fixedPriceRial / 40;
    const ratio = rate / impliedHourly;
    if (ratio >= 0.5 && ratio <= 1.5) return 20;
    if (ratio >= 0.3 && ratio <= 2.0) return 12;
    return 4;
  }

  if (project.budgetType === 'HOURLY' && project.budgetMinRial && project.budgetMaxRial) {
    if (rate >= project.budgetMinRial && rate <= project.budgetMaxRial) return 20;
    // Within 20% of range
    const range = project.budgetMaxRial - project.budgetMinRial;
    if (rate >= project.budgetMinRial - range * 0.2 && rate <= project.budgetMaxRial + range * 0.2) return 12;
    return 4;
  }

  return 10;
}

async function computeAvailabilityFit(
  project: { status: string },
  freelancerId: string
): number {
  const freelancerProfile = await db.freelancerProfile.findFirst({
    where: { profile: { userId: freelancerId } },
    select: { availability: true },
  });

  if (!freelancerProfile) return 5;

  switch (freelancerProfile.availability) {
    case AVAILABILITY.AVAILABLE: return 15;
    case AVAILABILITY.LIMITED: return 10;
    case AVAILABILITY.BUSY: return 3;
    case AVAILABILITY.UNAVAILABLE: return 0;
    default: return 5;
  }
}

function computeExperienceFit(
  project: { experienceLevel: string | null },
  _freelancerId: string
): number {
  // If no level specified, full fit
  if (!project.experienceLevel) return 10;

  // For now, return neutral since we don't have a freelancer-declared level vs project-required level
  // This will be enhanced when freelancer profiles have a selfDeclaredLevel vs calculatedLevel
  return 7;
}
