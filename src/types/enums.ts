// DevJoo Enum Constants
// Prisma uses String types (SQLite compatible)
// These constants provide type safety in TypeScript

export const USER_ROLES = {
  FREELANCER: 'FREELANCER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  PAUSED: 'PAUSED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const VALID_PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['PAUSED', 'IN_PROGRESS', 'CANCELLED', 'EXPIRED'],
  PAUSED: ['PUBLISHED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
  REJECTED: ['DRAFT'],
};

export const PROPOSAL_STATUS = {
  SUBMITTED: 'SUBMITTED',
  VIEWED: 'VIEWED',
  SHORTLISTED: 'SHORTLISTED',
  REJECTED: 'REJECTED',
  ACCEPTED: 'ACCEPTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export const WORK_TYPE = {
  REMOTE: 'REMOTE',
  ONSITE: 'ONSITE',
  HYBRID: 'HYBRID',
} as const;

export type WorkType = (typeof WORK_TYPE)[keyof typeof WORK_TYPE];

export const BUDGET_TYPE = {
  FIXED: 'FIXED',
  HOURLY: 'HOURLY',
} as const;

export type BudgetType = (typeof BUDGET_TYPE)[keyof typeof BUDGET_TYPE];

export const EXPERIENCE_LEVEL = {
  JUNIOR: 'JUNIOR',
  MID_LEVEL: 'MID_LEVEL',
  SENIOR: 'SENIOR',
  EXPERT: 'EXPERT',
} as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];

export const AVAILABILITY = {
  AVAILABLE: 'AVAILABLE',
  LIMITED: 'LIMITED',
  BUSY: 'BUSY',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type Availability = (typeof AVAILABILITY)[keyof typeof AVAILABILITY];

export const OAUTH_PROVIDER = {
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
} as const;

export type OAuthProvider = (typeof OAUTH_PROVIDER)[keyof typeof OAUTH_PROVIDER];

export const VERIFICATION_TYPE = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  IDENTITY: 'IDENTITY',
  COMPANY: 'COMPANY',
  PAYMENT: 'PAYMENT',
} as const;

export type VerificationType = (typeof VERIFICATION_TYPE)[keyof typeof VERIFICATION_TYPE];

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const INVITATION_STATUS = {
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

// Persian labels
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'پیش‌نویس',
  PENDING_REVIEW: 'در انتظار بررسی',
  PUBLISHED: 'منتشر شده',
  PAUSED: 'متوقف',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
  EXPIRED: 'منقضی شده',
  REJECTED: 'رد شده',
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  SUBMITTED: 'ارسال شده',
  VIEWED: 'مشاهده شده',
  SHORTLISTED: 'انتخاب اولیه',
  REJECTED: 'رد شده',
  ACCEPTED: 'قبول شده',
  WITHDRAWN: 'بازنشده',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  REMOTE: 'دورکاری',
  ONSITE: 'حضوری',
  HYBRID: 'ترکیبی',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  JUNIOR: 'مبتدی',
  MID_LEVEL: 'متوسط',
  SENIOR: 'ارشد',
  EXPERT: 'حرفه‌ای',
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: 'آماده همکاری',
  LIMITED: 'ظرفیت محدود',
  BUSY: 'مشغول',
  UNAVAILABLE: 'غیرفعال',
};

export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  FIXED: 'ثابت',
  HOURLY: 'ساعتی',
};
