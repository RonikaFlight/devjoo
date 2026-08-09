import { db } from '@/lib/db';
import { createNotification } from './service';
import { NOTIFICATION_TYPE } from '@/types/enums';

// ============ EMAIL JOB QUEUE ============

type EmailJob = {
  to: string;
  subject: string;
  htmlBody: string;
  createdAt: Date;
};

const emailQueue: EmailJob[] = [];

export function enqueueEmail(to: string, subject: string, htmlBody: string) {
  emailQueue.push({ to, subject, htmlBody, createdAt: new Date() });
}

/**
 * Process email queue. In production, replace with BullMQ + Redis.
 * Currently logs to console in dev mode.
 */
export async function processEmailQueue() {
  const batch = emailQueue.splice(0, emailQueue.length);
  for (const job of batch) {
    // Dev: log instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL JOB] to=${job.to} subject="${job.subject}"`);
    }
    // Production: await sendEmail(job.to, job.subject, job.htmlBody);
  }
  return { processed: batch.length };
}

// ============ SMS JOB QUEUE ============

type SmsJob = {
  to: string;
  message: string;
  createdAt: Date;
};

const smsQueue: SmsJob[] = [];

export function enqueueSms(to: string, message: string) {
  smsQueue.push({ to, message, createdAt: new Date() });
}

/**
 * Process SMS queue. In production, replace with BullMQ + Redis.
 * Currently logs to console in dev mode.
 */
export async function processSmsQueue() {
  const batch = smsQueue.splice(0, smsQueue.length);
  for (const job of batch) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SMS JOB] to=${job.to} message="${job.message}"`);
    }
    // Production: await sendSms(job.to, job.message);
  }
  return { processed: batch.length };
}

// ============ NOTIFICATION DISPATCHER ============

/**
 * Dispatch notifications based on domain events.
 * This is the central event bus for all notification-triggering events.
 */

/**
 * Dispatch: New project published → notify matching freelancers.
 * Finds freelancers whose skills overlap with the project's skills.
 */
export async function dispatchProjectPublished(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      skills: { select: { skillId: true } },
      category: { select: { name: true } },
      employer: {
        select: {
          id: true,
          displayName: true,
          profile: { select: { employerProfile: { select: { companyName: true } } } },
        },
      },
    },
  });

  if (!project) return;

  const projectSkillIds = project.skills.map((ps) => ps.skillId);
  if (projectSkillIds.length === 0) return;

  // Find freelancers with matching skills (limited for performance)
  const matchingFreelancers = await db.userSkill.findMany({
    where: {
      skillId: { in: projectSkillIds },
      profile: {
        user: {
          isActive: true,
          roles: { some: { role: { name: 'FREELANCER' } } },
        },
      },
    },
    select: {
      userId: true,
      skillId: true,
    },
    take: 200,
  });

  // Deduplicate by userId, count matching skills
  const freelancerMatchCount = new Map<string, number>();
  for (const match of matchingFreelancers) {
    const count = freelancerMatchCount.get(match.userId) || 0;
    freelancerMatchCount.set(match.userId, count + 1);
  }

  // Notify freelancers with at least 1 matching skill (excluding the employer)
  const employerName = project.employer.profile?.employerProfile?.companyName || project.employer.displayName || 'کارفرما';
  const body = `پروژه جدید: ${project.title} — ${employerName}`;

  const items: Array<{
    userId: string;
    type: string;
    title: string;
    body: string;
    dataJson: Record<string, unknown>;
  }> = [];

  for (const [userId, matchCount] of freelancerMatchCount) {
    if (userId === project.employerId) continue;

    items.push({
      userId,
      type: NOTIFICATION_TYPE.PROJECT_PUBLISHED,
      title: 'پروژه جدید مرتبط با مهارت‌های شما',
      body,
      dataJson: {
        projectId: project.id,
        projectSlug: project.slug,
        matchScore: matchCount,
      },
    });
  }

  // Batch create
  if (items.length > 0) {
    const { createNotificationsBatch } = await import('./service');
    await createNotificationsBatch(items);
  }
}

/**
 * Dispatch: New proposal received → notify employer.
 */
export async function dispatchProposalReceived(proposalId: string) {
  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: {
      project: { select: { id: true, title: true, slug: true, employerId: true } },
      freelancer: {
        select: {
          id: true,
          displayName: true,
          profile: { select: { freelancerProfile: { select: { headline: true } } } },
        },
      },
    },
  });

  if (!proposal) return;

  const freelancerName = proposal.freelancer.displayName || 'فریلنسر';

  await createNotification({
    userId: proposal.project.employerId,
    type: NOTIFICATION_TYPE.PROPOSAL_RECEIVED,
    title: 'پیشنهاد جدید دریافت شد',
    body: `${freelancerName} برای پروژه «${proposal.project.title}» پیشنهاد ارسال کرد.`,
    dataJson: {
      projectId: proposal.project.id,
      projectSlug: proposal.project.slug,
      proposalId: proposal.id,
      freelancerId: proposal.freelancerId,
    },
  });

  // Queue email if preference enabled
  const emailPref = await db.notificationPreference.findUnique({
    where: {
      userId_type_channel: {
        userId: proposal.project.employerId,
        type: NOTIFICATION_TYPE.PROPOSAL_RECEIVED,
        channel: 'EMAIL',
      },
    },
  });

  if (emailPref?.enabled) {
    const employer = await db.user.findUnique({
      where: { id: proposal.project.employerId },
      select: { email: true },
    });
    if (employer?.email) {
      enqueueEmail(
        employer.email,
        'پیشنهاد جدید برای پروژه شما',
        `<p>${freelancerName} برای پروژه «${proposal.project.title}» پیشنهاد ارسال کرد.</p>`
      );
    }
  }
}

/**
 * Dispatch: Proposal status changed → notify freelancer.
 */
export async function dispatchProposalStatusChanged(
  proposalId: string,
  newStatus: string
) {
  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: {
      project: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!proposal) return;

  const statusMessages: Record<string, string> = {
    VIEWED: 'پیشنهاد شما مشاهده شد',
    SHORTLISTED: 'پیشنهاد شما در لیست انتخاب قرار گرفت',
    ACCEPTED: 'تبریک! پیشنهاد شما پذیرفته شد',
    REJECTED: 'متاسفانه پیشنهاد شما رد شد',
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  await createNotification({
    userId: proposal.freelancerId,
    type: NOTIFICATION_TYPE.PROPOSAL_STATUS_CHANGED,
    title: msg,
    body: `پیشنهاد شما برای پروژه «${proposal.project.title}» ${msg.replace('پیشنهاد شما ', '')}.`,
    dataJson: {
      projectId: proposal.project.id,
      projectSlug: proposal.project.slug,
      proposalId,
      newStatus,
    },
  });
}

/**
 * Dispatch: Invitation received → notify freelancer.
 */
export async function dispatchInvitationReceived(invitationId: string) {
  const invitation = await db.projectInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) return;

  const project = await db.project.findUnique({
    where: { id: invitation.projectId },
    select: { id: true, title: true, slug: true, employerId: true },
  });
  if (!project) return;

  const employer = await db.user.findUnique({
    where: { id: project.employerId },
    select: { displayName: true, profile: { select: { employerProfile: { select: { companyName: true } } } } },
  });
  const employerName = employer?.profile?.employerProfile?.companyName || employer?.displayName || 'کارفرما';

  await createNotification({
    userId: invitation.freelancerId,
    type: NOTIFICATION_TYPE.INVITATION_RECEIVED,
    title: 'دعوت‌نامه جدید',
    body: `${employerName} شما را برای پروژه «${project.title}» دعوت کرده است.`,
    dataJson: {
      projectId: project.id,
      projectSlug: project.slug,
      invitationId,
    },
  });
}

/**
 * Dispatch: Invitation responded → notify employer.
 */
export async function dispatchInvitationResponded(
  invitationId: string,
  status: string
) {
  const invitation = await db.projectInvitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) return;

  const project = await db.project.findUnique({
    where: { id: invitation.projectId },
    select: { id: true, title: true, slug: true, employerId: true },
  });
  if (!project) return;

  const freelancer = await db.user.findUnique({
    where: { id: invitation.freelancerId },
    select: { displayName: true },
  });
  const freelancerName = freelancer?.displayName || 'فریلنسر';

  const isAccepted = status === 'ACCEPTED';

  await createNotification({
    userId: project.employerId,
    type: NOTIFICATION_TYPE.INVITATION_RESPONDED,
    title: isAccepted ? 'دعوت‌نامه پذیرفته شد' : 'دعوت‌نامه رد شد',
    body: `${freelancerName} دعوت‌نامه شما برای پروژه «${project.title}» ${isAccepted ? 'پذیرفت' : 'رد کرد'}.`,
    dataJson: {
      projectId: project.id,
      projectSlug: project.slug,
      invitationId,
      status,
    },
  });
}

/**
 * Dispatch: New review received → notify reviewee.
 */
export async function dispatchReviewReceived(reviewId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: {
      reviewer: {
        select: { displayName: true },
      },
    },
  });

  if (!review) return;

  const reviewerName = review.reviewer.displayName || 'کاربر';

  // Fetch project title/slug for the notification body
  const project = await db.project.findUnique({
    where: { id: review.projectId },
    select: { title: true, slug: true },
  });
  const projectTitle = project?.title || 'پروژه';
  const projectSlug = project?.slug || '';

  await createNotification({
    userId: review.revieweeId,
    type: NOTIFICATION_TYPE.REVIEW_RECEIVED,
    title: 'نظر جدید دریافت شد',
    body: `${reviewerName} برای پروژه «${projectTitle}» نظری ثبت کرد.`,
    dataJson: {
      projectId: review.projectId,
      projectSlug,
      reviewId,
      rating: review.rating,
    },
  });
}

/**
 * Dispatch: Message received → notify other conversation members.
 */
export async function dispatchMessageReceived(
  conversationId: string,
  senderId: string,
  messageId: string
) {
  const members = await db.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const recipientIds = members
    .filter((m) => m.userId !== senderId)
    .map((m) => m.userId);

  if (recipientIds.length === 0) return;

  const sender = await db.user.findUnique({
    where: { id: senderId },
    select: { displayName: true },
  });
  const senderName = sender?.displayName || 'کاربر';

  const { createNotificationsBatch } = await import('./service');
  await createNotificationsBatch(
    recipientIds.map((userId) => ({
      userId,
      type: NOTIFICATION_TYPE.MESSAGE_RECEIVED,
      title: 'پیام جدید',
      body: `${senderName} پیامی ارسال کرد.`,
      dataJson: {
        conversationId,
        messageId,
        senderId,
      },
    }))
  );
}

/**
 * Dispatch: Project status changed → notify relevant users.
 */
export async function dispatchProjectStatusChanged(
  projectId: string,
  newStatus: string
) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      proposals: { select: { freelancerId: true } },
    },
  });

  if (!project) return;

  const statusMessages: Record<string, string> = {
    IN_PROGRESS: 'پروژه شروع شد',
    COMPLETED: 'پروژه تکمیل شد',
    PAUSED: 'پروژه متوقف شد',
    CANCELLED: 'پروژه لغو شد',
    EXPIRED: 'پروژه منقضی شد',
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  // Notify all proposaled freelancers
  const items = project.proposals.map((p) => ({
    userId: p.freelancerId,
    type: NOTIFICATION_TYPE.PROJECT_STATUS_CHANGED,
    title: msg,
    body: `وضعیت پروژه «${project.title}» به «${msg}» تغییر کرد.`,
    dataJson: {
      projectId: project.id,
      projectSlug: project.slug,
      newStatus,
    },
  }));

  if (items.length > 0) {
    const { createNotificationsBatch } = await import('./service');
    await createNotificationsBatch(items);
  }
}
