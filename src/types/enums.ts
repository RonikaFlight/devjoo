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

export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

export const REVIEW_CATEGORIES = {
  QUALITY: 'کیفیت کار',
  COMMUNICATION: 'ارتباطات',
  DEADLINE: 'رعایت زمان‌بندی',
  PROFESSIONALISM: 'حرفه‌ای‌گری',
} as const;

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  PHONE: 'تایید شماره تلفن',
  EMAIL: 'تایید ایمیل',
  IDENTITY: 'تایید هویت',
  COMPANY: 'تایید شرکت',
  PAYMENT: 'تایید اطلاعات پرداخت',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  PENDING: 'در انتظار بررسی',
  APPROVED: 'تایید شده',
  REJECTED: 'رد شده',
};

export const COMPANY_SIZE = {
  MICRO: 'MICRO',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type CompanySize = (typeof COMPANY_SIZE)[keyof typeof COMPANY_SIZE];

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  MICRO: '۱ تا ۱۰ نفر',
  SMALL: '۱۱ تا ۵۰ نفر',
  MEDIUM: '۵۱ تا ۲۰۰ نفر',
  LARGE: '۲۰۱ تا ۵۰۰ نفر',
  ENTERPRISE: 'بیش از ۵۰۰ نفر',
};

export const PROFICIENCY_LEVEL = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVEL)[keyof typeof PROFICIENCY_LEVEL];

export const PROFICIENCY_LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
  EXPERT: 'حرفه‌ای',
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  SENT: 'ارسال شده',
  VIEWED: 'مشاهده شده',
  ACCEPTED: 'قبول شده',
  DECLINED: 'رد شده',
  EXPIRED: 'منقضی شده',
};

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

// ============ COMMUNICATION ============

export const CONVERSATION_TYPE = {
  DIRECT: 'DIRECT',
  PROJECT: 'PROJECT',
  GROUP: 'GROUP',
} as const;

export type ConversationType = (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE];

export const MESSAGE_TYPE = {
  TEXT: 'TEXT',
  SYSTEM: 'SYSTEM',
  FILE: 'FILE',
  PROPOSAL_REFERENCE: 'PROPOSAL_REFERENCE',
  PROJECT_REFERENCE: 'PROJECT_REFERENCE',
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  DIRECT: 'مستقیم',
  PROJECT: 'پروژه‌ای',
  GROUP: 'گروهی',
};

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  TEXT: 'متن',
  SYSTEM: 'سیستمی',
  FILE: 'فایل',
  PROPOSAL_REFERENCE: 'ارجاع به پیشنهاد',
  PROJECT_REFERENCE: 'ارجاع به پروژه',
};

// ============ NOTIFICATIONS ============

export const NOTIFICATION_TYPE = {
  PROJECT_PUBLISHED: 'PROJECT_PUBLISHED',
  PROPOSAL_RECEIVED: 'PROPOSAL_RECEIVED',
  PROPOSAL_STATUS_CHANGED: 'PROPOSAL_STATUS_CHANGED',
  INVITATION_RECEIVED: 'INVITATION_RECEIVED',
  INVITATION_RESPONDED: 'INVITATION_RESPONDED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  VERIFICATION_STATUS_CHANGED: 'VERIFICATION_STATUS_CHANGED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  MILESTONE_COMPLETED: 'MILESTONE_COMPLETED',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_CHANNEL = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
} as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  PROJECT_PUBLISHED: 'پروژه جدید',
  PROPOSAL_RECEIVED: 'پیشنهاد جدید',
  PROPOSAL_STATUS_CHANGED: 'تغییر وضعیت پیشنهاد',
  INVITATION_RECEIVED: 'دعوت‌نامه جدید',
  INVITATION_RESPONDED: 'پاسخ به دعوت‌نامه',
  REVIEW_RECEIVED: 'نظر جدید',
  VERIFICATION_STATUS_CHANGED: 'تغییر وضعیت تایید',
  MESSAGE_RECEIVED: 'پیام جدید',
  PROJECT_STATUS_CHANGED: 'تغییر وضعیت پروژه',
  PAYMENT_RECEIVED: 'پرداخت جدید',
  MILESTONE_COMPLETED: 'تکمیل مرحله',
  SYSTEM: 'اعلان سیستمی',
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  IN_APP: 'درون‌برنامه‌ای',
  EMAIL: 'ایمیل',
  SMS: 'پیامک',
  PUSH: 'اعلان پوش',
};

// ============ CONTRACTS ============

export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export const VALID_CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'DISPUTED'],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: ['IN_PROGRESS', 'CANCELLED', 'COMPLETED'],
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'پیش‌نویس',
  ACTIVE: 'فعال',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
  DISPUTED: 'زیر اختلاف',
};

// ============ MILESTONES ============

export const MILESTONE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type MilestoneStatus = (typeof MILESTONE_STATUS)[keyof typeof MILESTONE_STATUS];

export const VALID_MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: ['IN_PROGRESS', 'CANCELLED'],
  CANCELLED: [],
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PENDING: 'در انتظار',
  IN_PROGRESS: 'در حال انجام',
  SUBMITTED: 'تحویل داده شده',
  APPROVED: 'تایید شده',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده',
};

// ============ PAYMENTS ============

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'در انتظار',
  PROCESSING: 'در حال پردازش',
  COMPLETED: 'تکمیل شده',
  FAILED: 'ناموفق',
  REFUNDED: 'بازپرداخت شده',
  CANCELLED: 'لغو شده',
};

export const PAYMENT_PROVIDER = {
  INTERNAL: 'INTERNAL',
  ZARINPAL: 'ZARINPAL',
  IDPAY: 'IDPAY',
  PAYIR: 'PAYIR',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  INTERNAL: 'پرداخت داخلی',
  ZARINPAL: 'زرین‌پال',
  IDPAY: 'آیدی‌پی',
  PAYIR: 'پی‌آی‌آر',
  BANK_TRANSFER: 'انتقال بانکی',
};

// ============ SERVICE MARKETPLACE ============

export const SERVICE_LISTING_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ServiceListingStatus = (typeof SERVICE_LISTING_STATUS)[keyof typeof SERVICE_LISTING_STATUS];

export const SERVICE_LISTING_STATUS_LABELS: Record<ServiceListingStatus, string> = {
  DRAFT: 'پیش‌نویس',
  PUBLISHED: 'منتشر شده',
  PAUSED: 'متوقف',
  ARCHIVED: 'بایگانی شده',
};

export const SERVICE_ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERED: 'DELIVERED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUS)[keyof typeof SERVICE_ORDER_STATUS];

export const VALID_SERVICE_ORDER_TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'REVISION_REQUESTED'],
  REVISION_REQUESTED: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  PENDING: 'در انتظار تایید',
  ACCEPTED: 'قبول شده',
  IN_PROGRESS: 'در حال انجام',
  DELIVERED: 'تحویل داده شده',
  REVISION_REQUESTED: 'درخواست اصلاح',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
  REFUNDED: 'بازپرداخت شده',
};

// ============ TEAMS ============

export const TEAM_MEMBER_ROLE = {
  LEADER: 'LEADER',
  SENIOR: 'SENIOR',
  MEMBER: 'MEMBER',
} as const;

export type TeamMemberRole = (typeof TEAM_MEMBER_ROLE)[keyof typeof TEAM_MEMBER_ROLE];

export const TEAM_MEMBER_ROLE_LABELS: Record<TeamMemberRole, string> = {
  LEADER: 'رهبر تیم',
  SENIOR: 'عضو ارشد',
  MEMBER: 'عضو',
};
