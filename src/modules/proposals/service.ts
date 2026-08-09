import { db } from '@/lib/db';
import type { ProposalSubmitInput, ProposalFiltersInput } from '@/lib/validators/proposal';
import { dispatchProposalReceived, dispatchProposalStatusChanged } from '@/modules/notifications/dispatcher';

/**
 * Submit a proposal for a project.
 */
export async function submitProposal(
  freelancerId: string,
  projectSlug: string,
  data: ProposalSubmitInput
) {
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    select: {
      id: true, employerId: true, status: true,
      proposalLimit: true, currentProposalCount: true,
    },
  });

  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  if (project.status !== 'PUBLISHED') return { error: 'PROJECT_NOT_OPEN', message: 'این پروژه در حال حاضر دریافت پیشنهاد نمی‌کند.' };
  if (project.employerId === freelancerId) return { error: 'SELF_PROPOSAL', message: 'نمی‌توانید برای پروژه خودتان پیشنهاد ارسال کنید.' };
  if (project.currentProposalCount >= project.proposalLimit) return { error: 'PROPOSAL_LIMIT', message: 'تعداد پیشنهادهای این پروژه به حد نصاب رسیده است.' };

  const existing = await db.proposal.findUnique({
    where: { projectId_freelancerId: { projectId: project.id, freelancerId } },
  });
  if (existing) return { error: 'ALREADY_PROPOSED', message: 'شما قبلاً برای این پروژه پیشنهاد ارسال کرده‌اید.' };

  const proposal = await db.$transaction(async (tx) => {
    const created = await tx.proposal.create({
      data: {
        projectId: project.id, freelancerId,
        priceRial: data.priceRial,
        estimatedDuration: data.estimatedDuration,
        coverLetter: data.coverLetter,
      },
      include: {
        freelancer: {
          select: {
            id: true, displayName: true,
            profile: { select: { avatarUrl: true, headline: true, city: true } },
          },
        },
      },
    });
    await tx.project.update({
      where: { id: project.id },
      data: { currentProposalCount: { increment: 1 } },
    });
    return created;
  });

  // Notify employer (non-blocking)
  dispatchProposalReceived(proposal.id).catch(() => {});

  return { proposal };
}

/**
 * List proposals for a project (employer view).
 */
export async function listProjectProposals(
  projectSlug: string,
  employerId: string,
  filters: ProposalFiltersInput
) {
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, employerId: true },
  });

  if (!project || project.employerId !== employerId) {
    return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  }

  const where: Record<string, unknown> = { projectId: project.id };
  if (filters.status) where.status = filters.status;

  const orderBy = filters.sort === 'price_low'
    ? { priceRial: 'asc' as const }
    : filters.sort === 'price_high'
      ? { priceRial: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [proposals, total] = await Promise.all([
    db.proposal.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        freelancer: {
          select: {
            id: true, displayName: true,
            profile: { select: { avatarUrl: true, headline: true, city: true, hourlyRateRial: true } },
          },
        },
      },
    }),
    db.proposal.count({ where }),
  ]);

  return {
    proposals,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}

/**
 * Update proposal status (employer action).
 */
export async function updateProposalStatus(
  proposalId: string,
  employerId: string,
  status: string,
  rejectionReason?: string
) {
  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { project: { select: { employerId: true } } },
  });

  if (!proposal || proposal.project.employerId !== employerId) {
    return { error: 'NOT_FOUND', message: 'پیشنهاد یافت نشد.' };
  }

  await db.$transaction(async (tx) => {
    await tx.proposalStatusEvent.create({
      data: { proposalId, status, actorId: employerId },
    });
    await tx.proposal.update({
      where: { id: proposalId },
      data: { status, rejectionReason },
    });
  });

  // Notify freelancer (non-blocking)
  dispatchProposalStatusChanged(proposalId, status).catch(() => {});

  return { success: true };
}

/**
 * List proposals submitted by a freelancer.
 */
export async function listFreelancerProposals(freelancerId: string, page = 1, limit = 20) {
  const [proposals, total] = await Promise.all([
    db.proposal.findMany({
      where: { freelancerId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: {
          select: {
            id: true, title: true, slug: true, status: true,
            budgetType: true, fixedPriceRial: true,
            budgetMinRial: true, budgetMaxRial: true,
            category: { select: { name: true } },
            skills: { include: { skill: { select: { name: true } } }, take: 3 },
          },
        },
      },
    }),
    db.proposal.count({ where: { freelancerId } }),
  ]);

  return {
    proposals,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
