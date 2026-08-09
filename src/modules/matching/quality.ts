import { db } from '@/lib/db';
import { normalizePersian } from '@/lib/utils/persian-normalize';

/**
 * Compute a quality score (0-100) for a project.
 * Higher quality projects get better visibility.
 *
 * Signals:
 * - Description length (0-25)
 * - Skills count (0-15)
 * - Budget specified (0-15)
 * - Category set (0-10)
 * - Experience level set (0-5)
 * - Deadline set (0-5)
 * - Estimated duration (0-5)
 * - Title quality (0-10)
 * - Not urgent spam signals (-10)
 */
export function computeProjectQualityScore(project: {
  title: string;
  description: string;
  categoryId: string | null;
  budgetType: string;
  fixedPriceRial: number | null;
  budgetMinRial: number | null;
  budgetMaxRial: number | null;
  experienceLevel: string | null;
  deadline: Date | null;
  estimatedDuration: string | null;
  skills: { skillId: string }[];
  isUrgent: boolean;
}): number {
  let score = 0;

  // 1. Description length (0-25)
  const descLen = project.description.length;
  if (descLen >= 500) score += 25;
  else if (descLen >= 300) score += 20;
  else if (descLen >= 150) score += 12;
  else if (descLen >= 50) score += 5;

  // 2. Skills count (0-15)
  const skillCount = project.skills.length;
  if (skillCount >= 5) score += 15;
  else if (skillCount >= 3) score += 12;
  else if (skillCount >= 2) score += 8;
  else if (skillCount >= 1) score += 4;

  // 3. Budget specified (0-15)
  if (project.budgetType === 'FIXED' && project.fixedPriceRial && project.fixedPriceRial > 0) {
    score += 15;
  } else if (
    project.budgetType === 'HOURLY' &&
    project.budgetMinRial && project.budgetMaxRial &&
    project.budgetMinRial > 0 && project.budgetMaxRial > 0
  ) {
    score += 15;
  } else {
    score += 3; // Budget type set but no amount
  }

  // 4. Category set (0-10)
  if (project.categoryId) score += 10;

  // 5. Experience level (0-5)
  if (project.experienceLevel) score += 5;

  // 6. Deadline set (0-5)
  if (project.deadline) score += 5;

  // 7. Estimated duration (0-5)
  if (project.estimatedDuration && project.estimatedDuration.length > 2) score += 5;

  // 8. Title quality (0-10)
  const titleWords = project.title.trim().split(/\s+/).length;
  if (titleWords >= 5 && project.title.length >= 20) score += 10;
  else if (titleWords >= 3 && project.title.length >= 15) score += 7;
  else if (project.title.length >= 10) score += 4;

  // 9. Urgent flag — slight penalty to prevent abuse
  if (project.isUrgent) score -= 3;

  return Math.max(0, Math.min(score, 100));
}

/**
 * Check for duplicate projects by the same employer.
 * Returns true if a similar project exists (published in last 7 days with high title similarity).
 */
export async function detectDuplicateProject(
  employerId: string,
  title: string,
  description: string,
  excludeProjectId?: string
): Promise<{ isDuplicate: boolean; similarProject?: { id: string; title: string; slug: string; createdAt: Date } }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentProjects = await db.project.findMany({
    where: {
      employerId,
      status: { in: ['PUBLISHED', 'DRAFT', 'PAUSED'] },
      createdAt: { gte: sevenDaysAgo },
      ...(excludeProjectId ? { id: { not: excludeProjectId } } : {}),
    },
    select: { id: true, title: true, slug: true, description: true, createdAt: true },
  });

  const normalizedTitle = normalizePersian(title).toLowerCase().trim();
  const normalizedDesc = normalizePersian(description).toLowerCase().trim();

  for (const existing of recentProjects) {
    const existingTitle = normalizePersian(existing.title as string).toLowerCase().trim();
    const titleSimilarity = stringSimilarity(normalizedTitle, existingTitle);

    if (titleSimilarity >= 0.85) {
      return { isDuplicate: true, similarProject: { id: existing.id, title: existing.title as string, slug: existing.slug, createdAt: existing.createdAt } };
    }

    // Also check description for near-duplicates
    const existingDesc = normalizePersian(existing.description as string).toLowerCase().trim();
    const descSimilarity = stringSimilarity(normalizedDesc, existingDesc);
    if (titleSimilarity >= 0.6 && descSimilarity >= 0.85) {
      return { isDuplicate: true, similarProject: { id: existing.id, title: existing.title as string, slug: existing.slug, createdAt: existing.createdAt } };
    }
  }

  return { isDuplicate: false };
}

/**
 * Simple bigram-based string similarity (0-1).
 * Fast enough for small-scale duplicate detection.
 */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  if (bigramsA.size === 0 && bigramsB.size === 0) return 1;

  let intersection = 0;
  for (const bigram of bigramsA) {
    if (bigramsB.has(bigram)) intersection++;
  }

  const union = bigramsA.size + bigramsB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  const cleaned = str.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < cleaned.length - 1; i++) {
    bigrams.add(cleaned.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Estimate hiring probability for a freelancer on a project.
 * Returns 0-100 based on multiple signals.
 */
export function estimateHiringProbability(params: {
  matchScore: number;
  proposalCount: number;
  proposalLimit: number;
  freelancerReputation: number;
  clientScore: number;
  hasPortfolio: boolean;
  hasVerifications: boolean;
}): number {
  let probability = 0;

  // Match score is the strongest signal (0-35)
  probability += (params.matchScore / 100) * 35;

  // Fewer competing proposals = higher chance (0-20)
  const competitionFactor = 1 - Math.min(params.proposalCount / Math.max(params.proposalLimit, 1), 1);
  probability += competitionFactor * 20;

  // Freelancer reputation (0-20)
  probability += (params.freelancerReputation / 100) * 20;

  // Portfolio bonus (0-10)
  if (params.hasPortfolio) probability += 10;

  // Verification bonus (0-5)
  if (params.hasVerifications) probability += 5;

  // Client score bonus — good clients are more likely to hire (0-10)
  probability += (params.clientScore / 100) * 10;

  return Math.max(0, Math.min(Math.round(probability), 100));
}
