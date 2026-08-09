import { db } from '@/lib/db';
import { PROJECT_STATUS, INVITATION_STATUS } from '@/types/enums';
import type { InvitationCreateInput, InvitationRespondInput, InvitationFiltersInput } from '@/lib/validators/invitation';
import { dispatchInvitationReceived, dispatchInvitationResponded } from '@/modules/notifications/dispatcher';

/**
 * Create a project invitation (employer invites a freelancer).
 */
export async function createInvitation(
  employerId: string,
  data: InvitationCreateInput
) {
  const project = await db.project.findUnique({
    where: { id: data.projectId },
    select: { id: true, employerId: true, status: true },
  });

  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  if (project.employerId !== employerId) return { error: 'FORBIDDEN', message: 'شما صاحب این پروژه نیستید.' };
  if (project.status !== PROJECT_STATUS.PUBLISHED && project.status !== PROJECT_STATUS.IN_PROGRESS) {
    return { error: 'PROJECT_NOT_OPEN', message: 'این پروژه در حال حاضر فعال نیست.' };
  }
  if (data.freelancerId === employerId) {
    return { error: 'SELF_INVITE', message: 'نمی‌توانید خودتان را دعوت کنید.' };
  }

  // Check if already invited or proposed
  const existing = await db.projectInvitation.findUnique({
    where: {
      projectId_freelancerId: {
        projectId: data.projectId,
        freelancerId: data.freelancerId,
      },
    },
  });
  if (existing && existing.status === INVITATION_STATUS.SENT) {
    return { error: 'ALREADY_INVITED', message: 'این فریلنسر قبلاً دعوت شده است.' };
  }
  if (existing && existing.status === INVITATION_STATUS.ACCEPTED) {
    return { error: 'ALREADY_ACCEPTED', message: 'این فریلنسر قبلاً دعوت را پذیرفته است.' };
  }

  // Check if freelancer already proposed
  const existingProposal = await db.proposal.findFirst({
    where: {
      projectId: data.projectId,
      freelancerId: data.freelancerId,
    },
  });
  if (existingProposal) {
    return { error: 'ALREADY_PROPOSED', message: 'این فریلنسر قبلاً پیشنهاد ارسال کرده است.' };
  }

  const invitation = await db.projectInvitation.create({
    data: {
      projectId: data.projectId,
      freelancerId: data.freelancerId,
      message: data.message,
      status: INVITATION_STATUS.SENT,
    },
    include: {
      project: { select: { id: true, title: true, slug: true } },
      freelancer: {
        select: {
          id: true, displayName: true,
          profile: { select: { avatarUrl: true, headline: true } },
        },
      },
    },
  });

  // Notify freelancer (non-blocking)
  dispatchInvitationReceived(invitation.id).catch(() => {});

  return { invitation };
}

/**
 * Respond to an invitation (freelancer accepts/declines).
 */
export async function respondToInvitation(
  invitationId: string,
  freelancerId: string,
  data: InvitationRespondInput
) {
  const invitation = await db.projectInvitation.findUnique({
    where: { id: invitationId },
    include: { project: { select: { id: true, status: true, slug: true } } },
  });

  if (!invitation) return { error: 'NOT_FOUND', message: 'دعوت‌نامه یافت نشد.' };
  if (invitation.freelancerId !== freelancerId) {
    return { error: 'FORBIDDEN', message: 'این دعوت‌نامه متعلق به شما نیست.' };
  }
  if (invitation.status !== INVITATION_STATUS.SENT) {
    return { error: 'NOT_PENDING', message: 'این دعوت‌نامه دیگر در انتظار پاسخ نیست.' };
  }

  const updated = await db.projectInvitation.update({
    where: { id: invitationId },
    data: { status: data.status, respondedAt: new Date() },
  });

  // Notify employer (non-blocking)
  dispatchInvitationResponded(invitationId, data.status).catch(() => {});

  return { invitation: updated };
}

/**
 * List invitations sent by an employer for a project.
 */
export async function listProjectInvitations(
  projectId: string,
  employerId: string,
  filters: InvitationFiltersInput
) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, employerId: true },
  });

  if (!project || project.employerId !== employerId) {
    return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  }

  const where: Record<string, unknown> = { projectId };
  if (filters.status) where.status = filters.status;

  const [invitations, total] = await Promise.all([
    db.projectInvitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        freelancer: {
          select: {
            id: true, displayName: true,
            profile: { select: { avatarUrl: true, headline: true, city: true } },
          },
        },
      },
    }),
    db.projectInvitation.count({ where }),
  ]);

  return {
    invitations,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}

/**
 * List invitations received by a freelancer.
 */
export async function listFreelancerInvitations(
  freelancerId: string,
  filters: InvitationFiltersInput
) {
  const where: Record<string, unknown> = { freelancerId };
  if (filters.status) where.status = filters.status;

  const [invitations, total] = await Promise.all([
    db.projectInvitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        project: {
          select: {
            id: true, title: true, slug: true, status: true,
            budgetType: true, fixedPriceRial: true,
            category: { select: { name: true } },
            skills: { include: { skill: { select: { name: true } } }, take: 3 },
            employer: {
              select: {
                id: true, displayName: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
      },
    }),
    db.projectInvitation.count({ where }),
  ]);

  return {
    invitations,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}
