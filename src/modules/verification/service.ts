import { db } from '@/lib/db';
import { VERIFICATION_TYPE, VERIFICATION_STATUS } from '@/types/enums';
import type { VerificationRequestInput, VerificationUpdateInput } from '@/lib/validators/verification';

/**
 * Request a verification for a freelancer profile.
 */
export async function requestFreelancerVerification(
  profileId: string,
  data: VerificationRequestInput
) {
  // Check for existing pending/approved verification of same type
  const existing = await db.freelancerVerification.findFirst({
    where: {
      profileId,
      type: data.type,
      status: { in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.APPROVED] },
    },
  });

  if (existing) {
    if (existing.status === VERIFICATION_STATUS.APPROVED) {
      return { error: 'ALREADY_VERIFIED', message: 'این نوع تاییدیه قبلاً انجام شده است.' };
    }
    return { error: 'PENDING_EXISTS', message: 'درخواست تاییدیه قبلی هنوز در حال بررسی است.' };
  }

  const verification = await db.freelancerVerification.create({
    data: {
      profileId,
      type: data.type,
      evidence: data.evidence,
      status: VERIFICATION_STATUS.PENDING,
    },
  });

  return { verification };
}

/**
 * Request a verification for an employer profile.
 */
export async function requestEmployerVerification(
  profileId: string,
  data: VerificationRequestInput
) {
  const existing = await db.employerVerification.findFirst({
    where: {
      profileId,
      type: data.type,
      status: { in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.APPROVED] },
    },
  });

  if (existing) {
    if (existing.status === VERIFICATION_STATUS.APPROVED) {
      return { error: 'ALREADY_VERIFIED', message: 'این نوع تاییدیه قبلاً انجام شده است.' };
    }
    return { error: 'PENDING_EXISTS', message: 'درخواست تاییدیه قبلی هنوز در حال بررسی است.' };
  }

  const verification = await db.employerVerification.create({
    data: {
      profileId,
      type: data.type,
      evidence: data.evidence,
      status: VERIFICATION_STATUS.PENDING,
    },
  });

  return { verification };
}

/**
 * Update verification status (admin/moderator action).
 */
export async function updateVerificationStatus(
  verificationId: string,
  role: 'freelancer' | 'employer',
  data: VerificationUpdateInput
) {
  const model = role === 'freelancer' ? db.freelancerVerification : db.employerVerification;
  const verification = await (model as typeof db.freelancerVerification).findUnique({
    where: { id: verificationId },
  });

  if (!verification) return { error: 'NOT_FOUND', message: 'درخواست تاییدیه یافت نشد.' };
  if (verification.status !== VERIFICATION_STATUS.PENDING) {
    return { error: 'NOT_PENDING', message: 'فقط درخواست‌های در انتظار قابل تغییر هستند.' };
  }

  const updated = await (model as typeof db.freelancerVerification).update({
    where: { id: verificationId },
    data: {
      status: data.status,
      verifiedAt: data.status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
    },
  });

  return { verification: updated };
}

/**
 * List verifications for a profile.
 */
export async function listFreelancerVerifications(profileId: string) {
  return db.freelancerVerification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listEmployerVerifications(profileId: string) {
  return db.employerVerification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get verification badges summary for a profile.
 */
export async function getVerificationSummary(profileId: string, role: 'freelancer' | 'employer') {
  const model = role === 'freelancer'
    ? db.freelancerVerification
    : db.employerVerification;

  const verifications = await (model as typeof db.freelancerVerification).findMany({
    where: { profileId },
    select: { type: true, status: true },
  });

  const approved = new Set<string>();
  const pending = new Set<string>();

  for (const v of verifications) {
    if (v.status === VERIFICATION_STATUS.APPROVED) approved.add(v.type);
    else if (v.status === VERIFICATION_STATUS.PENDING) pending.add(v.type);
  }

  return {
    verifiedTypes: Array.from(approved),
    pendingTypes: Array.from(pending),
    totalVerified: approved.size,
  };
}
