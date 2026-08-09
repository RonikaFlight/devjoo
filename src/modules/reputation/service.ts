import { db } from '@/lib/db';
import { VERIFICATION_STATUS, PROJECT_STATUS } from '@/types/enums';

export interface ClientScore {
  totalPosted: number;
  totalHired: number;
  hireRate: number | null;
  averageResponseTimeHours: number | null;
  responseRate: number | null;
  totalReviews: number;
  averageRating: number | null;
  totalSpentRial: number | null;
  verifications: string[];
}

export interface FreelancerReputation {
  totalCompletedProjects: number;
  totalHires: number;
  averageRating: number | null;
  totalReviews: number;
  responseRate: number | null;
  verifications: string[];
  repeatHireRate: number | null;
  onTimeDeliveryRate: number | null;
}

/**
 * Calculate and return the client score (employer trust metrics).
 * This is computed on-read and can be cached later.
 */
export async function getClientScore(userId: string): Promise<ClientScore> {
  // Get employer profile metrics
  const employerProfile = await db.employerProfile.findFirst({
    where: { profile: { userId } },
    select: {
      totalPosted: true,
      totalHired: true,
      hireRate: true,
      responseRate: true,
      averageResponseTimeHours: true,
    },
  });

  // Get reviews received as employer
  const reviews = await db.review.findMany({
    where: {
      revieweeId: userId,
      isHidden: false,
    },
    select: { rating: true },
  });

  // Get total spent from completed projects with accepted proposals
  const completedProjectIds = await db.project.findMany({
    where: {
      employerId: userId,
      status: PROJECT_STATUS.COMPLETED,
    },
    select: { id: true },
  });

  const acceptedProposals = completedProjectIds.length > 0
    ? await db.proposal.findMany({
        where: {
          projectId: { in: completedProjectIds.map((p) => p.id) },
          status: 'ACCEPTED',
        },
        select: { priceRial: true },
      })
    : [];

  const totalSpentRial = acceptedProposals.reduce((sum, p) => sum + (p.priceRial || 0), 0);

  // Get verifications
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  let verifications: string[] = [];
  if (profile) {
    const verifiedRecords = await db.employerVerification.findMany({
      where: {
        profileId: profile.id,
        status: VERIFICATION_STATUS.APPROVED,
      },
      select: { type: true },
    });
    verifications = verifiedRecords.map((v) => v.type);
  }

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
    : null;

  return {
    totalPosted: employerProfile?.totalPosted ?? 0,
    totalHired: employerProfile?.totalHired ?? 0,
    hireRate: employerProfile?.hireRate,
    averageResponseTimeHours: employerProfile?.averageResponseTimeHours,
    responseRate: employerProfile?.responseRate,
    totalReviews: reviews.length,
    averageRating: avgRating,
    totalSpentRial: totalSpentRial || null,
    verifications,
  };
}

/**
 * Calculate freelancer reputation score.
 */
export async function getFreelancerReputation(userId: string): Promise<FreelancerReputation> {
  const freelancerProfile = await db.freelancerProfile.findFirst({
    where: { profile: { userId } },
    select: {
      totalCompletedProjects: true,
      totalHires: true,
      averageRating: true,
      responseRate: true,
    },
  });

  const reviews = await db.review.findMany({
    where: {
      revieweeId: userId,
      isHidden: false,
    },
    select: { rating: true },
  });

  // Calculate repeat hire rate: employers who hired this freelancer more than once
  const acceptedProposals = await db.proposal.findMany({
    where: {
      freelancerId: userId,
      status: 'ACCEPTED',
    },
    select: {
      project: { select: { employerId: true } },
    },
  });

  const employerCounts = new Map<string, number>();
  for (const p of acceptedProposals) {
    const eid = p.project.employerId;
    employerCounts.set(eid, (employerCounts.get(eid) || 0) + 1);
  }
  const repeatEmployers = Array.from(employerCounts.values()).filter((c) => c > 1).length;
  const uniqueEmployers = employerCounts.size;
  const repeatHireRate = uniqueEmployers > 0
    ? Math.round((repeatEmployers / uniqueEmployers) * 100) / 100
    : null;

  // Get verifications
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  let verifications: string[] = [];
  if (profile) {
    const verifiedRecords = await db.freelancerVerification.findMany({
      where: {
        profileId: profile.id,
        status: VERIFICATION_STATUS.APPROVED,
      },
      select: { type: true },
    });
    verifications = verifiedRecords.map((v) => v.type);
  }

  // On-time delivery: completed projects where deadline was met
  // This is a placeholder — real implementation would compare deadline vs actual completion
  const onTimeDeliveryRate: number | null = null;

  return {
    totalCompletedProjects: freelancerProfile?.totalCompletedProjects ?? 0,
    totalHires: freelancerProfile?.totalHires ?? 0,
    averageRating: freelancerProfile?.averageRating ?? (reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
      : null),
    totalReviews: reviews.length,
    responseRate: freelancerProfile?.responseRate,
    verifications,
    repeatHireRate,
    onTimeDeliveryRate,
  };
}

/**
 * Compute a numeric reputation score (0-100) for a freelancer.
 * This combines multiple signals into a single score.
 */
export async function computeReputationScore(userId: string): Promise<number> {
  const rep = await getFreelancerReputation(userId);

  let score = 0;
  let maxScore = 0;

  // Rating signal (weight: 30)
  const ratingWeight = 30;
  maxScore += ratingWeight;
  if (rep.averageRating !== null) {
    score += (rep.averageRating / 5) * ratingWeight;
  }

  // Completion signal (weight: 20)
  const completionWeight = 20;
  maxScore += completionWeight;
  const completionRate = rep.totalHires > 0
    ? Math.min(rep.totalCompletedProjects / rep.totalHires, 1)
    : 0;
  score += completionRate * completionWeight;

  // Review count signal (weight: 15)
  const reviewWeight = 15;
  maxScore += reviewWeight;
  const reviewFactor = Math.min(rep.totalReviews / 10, 1); // Caps at 10 reviews
  score += reviewFactor * reviewWeight;

  // Verification signal (weight: 15)
  const verificationWeight = 15;
  maxScore += verificationWeight;
  const verificationFactor = Math.min(rep.verifications.length / 3, 1); // Caps at 3 verifications
  score += verificationFactor * verificationWeight;

  // Repeat hire signal (weight: 10)
  const repeatWeight = 10;
  maxScore += repeatWeight;
  if (rep.repeatHireRate !== null) {
    score += rep.repeatHireRate * repeatWeight;
  }

  // Response rate signal (weight: 10)
  const responseWeight = 10;
  maxScore += responseWeight;
  if (rep.responseRate !== null) {
    score += rep.responseRate * responseWeight;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Compute a numeric client score (0-100) for an employer.
 */
export async function computeClientScore(userId: string): Promise<number> {
  const metrics = await getClientScore(userId);

  let score = 0;
  let maxScore = 0;

  // Hire rate signal (weight: 25)
  const hireRateWeight = 25;
  maxScore += hireRateWeight;
  if (metrics.hireRate !== null) {
    score += metrics.hireRate * hireRateWeight;
  }

  // Rating signal (weight: 25)
  const ratingWeight = 25;
  maxScore += ratingWeight;
  if (metrics.averageRating !== null) {
    score += (metrics.averageRating / 5) * ratingWeight;
  }

  // Review count signal (weight: 15)
  const reviewWeight = 15;
  maxScore += reviewWeight;
  const reviewFactor = Math.min(metrics.totalReviews / 10, 1);
  score += reviewFactor * reviewWeight;

  // Total spent signal (weight: 15)
  const spentWeight = 15;
  maxScore += spentWeight;
  if (metrics.totalSpentRial !== null) {
    // Logarithmic scale: 10M Rial = full score
    const spentFactor = Math.min(Math.log10(Math.max(metrics.totalSpentRial, 1)) / 7, 1);
    score += spentFactor * spentWeight;
  }

  // Verification signal (weight: 10)
  const verificationWeight = 10;
  maxScore += verificationWeight;
  const verificationFactor = Math.min(metrics.verifications.length / 2, 1);
  score += verificationFactor * verificationWeight;

  // Response rate signal (weight: 10)
  const responseWeight = 10;
  maxScore += responseWeight;
  if (metrics.responseRate !== null) {
    score += metrics.responseRate * responseWeight;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Update employer profile metrics after a project status change.
 * Call this when a project transitions to COMPLETED or IN_PROGRESS.
 */
export async function refreshEmployerMetrics(userId: string): Promise<void> {
  const totalPosted = await db.project.count({
    where: { employerId: userId },
  });

  const completedProjectIds = await db.project.findMany({
    where: {
      employerId: userId,
      status: PROJECT_STATUS.COMPLETED,
    },
    select: { id: true },
  });

  const totalHired = completedProjectIds.length > 0
    ? await db.proposal.count({
        where: {
          projectId: { in: completedProjectIds.map((p) => p.id) },
          status: 'ACCEPTED',
        },
      })
    : 0;

  const hireRate = totalPosted > 0
    ? Math.round((totalHired / totalPosted) * 100) / 100
    : null;

  const profile = await db.profile.findUnique({
    where: { userId },
    select: { employerProfile: { select: { id: true } } },
  });

  if (profile?.employerProfile) {
    await db.employerProfile.update({
      where: { id: profile.employerProfile.id },
      data: { totalPosted, totalHired, hireRate },
    });
  }
}

/**
 * Update freelancer profile metrics after a project completes.
 */
export async function refreshFreelancerMetrics(userId: string): Promise<void> {
  const acceptedProposals = await db.proposal.findMany({
    where: {
      freelancerId: userId,
      status: 'ACCEPTED',
    },
    include: {
      project: { select: { status: true } },
    },
  });

  const totalHires = acceptedProposals.length;
  const completedProjects = acceptedProposals.filter(
    (p) => p.project.status === PROJECT_STATUS.COMPLETED
  ).length;

  const profile = await db.profile.findUnique({
    where: { userId },
    select: { freelancerProfile: { select: { id: true } } },
  });

  if (profile?.freelancerProfile) {
    await db.freelancerProfile.update({
      where: { id: profile.freelancerProfile.id },
      data: {
        totalHires,
        totalCompletedProjects: completedProjects,
      },
    });
  }
}
