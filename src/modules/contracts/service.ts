import { db } from '@/lib/db';
import { CONTRACT_STATUS, MILESTONE_STATUS, VALID_CONTRACT_TRANSITIONS, VALID_MILESTONE_TRANSITIONS, PROPOSAL_STATUS, PROJECT_STATUS } from '@/types/enums';
import type { ContractCreateInput, MilestoneCreateInput, ContractStatusUpdateInput, MilestoneStatusUpdateInput, ContractQueryInput } from '@/lib/validators/contract';
import { generateSlug, uniqueSlug } from '@/lib/utils/slug';

/**
 * Create a contract from an accepted proposal.
 * Validates the proposal is ACCEPTED and no contract exists yet for the project.
 */
export async function createContract(freelancerId: string, employerId: string, data: ContractCreateInput) {
  // Validate project exists and belongs to employer
  const project = await db.project.findUnique({
    where: { id: data.projectId },
    select: { id: true, employerId: true, status: true, title: true, slug: true },
  });
  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد' };
  if (project.employerId !== employerId) return { error: 'FORBIDDEN', message: 'شما دسترسی به این پروژه ندارید' };

  // Validate an accepted proposal exists
  const proposal = await db.proposal.findFirst({
    where: { projectId: data.projectId, freelancerId, status: PROPOSAL_STATUS.ACCEPTED },
  });
  if (!proposal) return { error: 'NOT_FOUND', message: 'پیشنهاد تایید شده‌ای یافت نشد' };

  // Validate no contract exists for project
  const existingContract = await db.contract.findUnique({ where: { projectId: data.projectId } });
  if (existingContract) return { error: 'CONFLICT', message: 'برای این پروژه قرارداد وجود دارد' };

  // Validate milestones sum matches contract amount
  const milestonesTotal = data.milestones.reduce((sum, m) => sum + m.amountRial, 0);
  if (milestonesTotal !== data.amountRial) {
    return { error: 'VALIDATION_ERROR', message: 'مجموع مبالغ مراحل باید برابر مبلغ قرارداد باشد' };
  }

  const contract = await db.contract.create({
    data: {
      projectId: data.projectId,
      freelancerId,
      employerId,
      amountRial: data.amountRial,
      budgetType: data.budgetType,
      deadline: data.deadline ? new Date(data.deadline) : null,
      milestones: {
        create: data.milestones.map((m, i) => ({
          title: m.title,
          description: m.description,
          amountRial: m.amountRial,
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
        })),
      },
    },
    include: {
      project: { select: { id: true, title: true, slug: true } },
      milestones: true,
      freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
      employer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, employerProfile: { select: { companyName: true } } } } } },
    },
  });

  // Update project status to IN_PROGRESS
  await db.project.update({
    where: { id: data.projectId },
    data: { status: PROJECT_STATUS.IN_PROGRESS },
  });

  return { contract };
}

/**
 * Get a contract by ID with full details.
 */
export async function getContract(contractId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
    include: {
      project: { select: { id: true, title: true, slug: true, status: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true, experienceLevel: true } } } } } },
      employer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, employerProfile: { select: { companyName: true } } } } } },
    },
  });
  if (!contract) return { error: 'NOT_FOUND', message: 'قرارداد یافت نشد' };
  return { contract };
}

/**
 * List contracts for a user (as freelancer or employer).
 */
export async function listContracts(userId: string, role: 'freelancer' | 'employer', query: ContractQueryInput) {
  const where: Record<string, unknown> = {};
  if (role === 'freelancer') {
    where.freelancerId = userId;
  } else {
    where.employerId = userId;
  }
  if (query.status) where.status = query.status;

  const [contracts, total] = await Promise.all([
    db.contract.findMany({
      where,
      include: {
        project: { select: { id: true, title: true, slug: true, status: true } },
        freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        employer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.contract.count({ where }),
  ]);

  return { contracts, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

/**
 * Update contract status with state machine validation.
 */
export async function updateContractStatus(contractId: string, userId: string, data: ContractStatusUpdateInput) {
  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: 'NOT_FOUND', message: 'قرارداد یافت نشد' };

  // Authorization: only employer or freelancer can update
  if (contract.freelancerId !== userId && contract.employerId !== userId) {
    return { error: 'FORBIDDEN', message: 'شما دسترسی به این قرارداد ندارید' };
  }

  // State machine validation
  const allowed = VALID_CONTRACT_TRANSITIONS[contract.status as keyof typeof VALID_CONTRACT_TRANSITIONS];
  if (!allowed || !allowed.includes(data.status)) {
    return { error: 'INVALID_TRANSITION', message: 'تغییر وضعیت نامعتبر است' };
  }

  const updateData: Record<string, unknown> = { status: data.status };
  if (data.status === CONTRACT_STATUS.ACTIVE) updateData.startedAt = new Date();
  if (data.status === CONTRACT_STATUS.COMPLETED) updateData.completedAt = new Date();
  if (data.status === CONTRACT_STATUS.CANCELLED) {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = data.cancelReason || null;
  }

  const updated = await db.contract.update({
    where: { id: contractId },
    data: updateData,
    include: {
      project: { select: { id: true, title: true, slug: true } },
      milestones: true,
    },
  });

  // If completed, update project status
  if (data.status === CONTRACT_STATUS.COMPLETED) {
    await db.project.update({
      where: { id: contract.projectId },
      data: { status: PROJECT_STATUS.COMPLETED },
    });
  }

  return { contract: updated };
}

/**
 * Add a milestone to an existing contract.
 */
export async function addMilestone(contractId: string, userId: string, data: MilestoneCreateInput) {
  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: 'NOT_FOUND', message: 'قرارداد یافت نشد' };
  if (contract.freelancerId !== userId && contract.employerId !== userId) {
    return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };
  }
  if (contract.status === CONTRACT_STATUS.COMPLETED || contract.status === CONTRACT_STATUS.CANCELLED) {
    return { error: 'INVALID_STATE', message: 'امکان افزودن مرحله به قرارداد تکمیل‌شده یا لغوشده نیست' };
  }

  const milestone = await db.milestone.create({
    data: {
      contractId,
      title: data.title,
      description: data.description,
      amountRial: data.amountRial,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  return { milestone };
}

/**
 * Update milestone status with state machine validation.
 */
export async function updateMilestoneStatus(milestoneId: string, userId: string, data: MilestoneStatusUpdateInput) {
  const milestone = await db.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: { select: { freelancerId: true, employerId: true } } },
  });
  if (!milestone) return { error: 'NOT_FOUND', message: 'مرحله یافت نشد' };

  // Authorization
  const { contract } = milestone;
  const isFreelancer = contract.freelancerId === userId;
  const isEmployer = contract.employerId === userId;
  if (!isFreelancer && !isEmployer) {
    return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };
  }

  // Role-based restrictions
  if (data.status === MILESTONE_STATUS.APPROVED && !isEmployer) {
    return { error: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند مرحله را تایید کند' };
  }
  if (data.status === MILESTONE_STATUS.REJECTED && !isEmployer) {
    return { error: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند مرحله را رد کند' };
  }

  // State machine
  const allowed = VALID_MILESTONE_TRANSITIONS[milestone.status as keyof typeof VALID_MILESTONE_TRANSITIONS];
  if (!allowed || !allowed.includes(data.status)) {
    return { error: 'INVALID_TRANSITION', message: 'تغییر وضعیت نامعتبر است' };
  }

  const updateData: Record<string, unknown> = { status: data.status };
  if (data.status === MILESTONE_STATUS.APPROVED) updateData.approvedAt = new Date();
  if (data.status === MILESTONE_STATUS.REJECTED) updateData.rejectedAt = new Date();

  const updated = await db.milestone.update({
    where: { id: milestoneId },
    data: updateData,
  });

  return { milestone: updated };
}
