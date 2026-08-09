import { z } from 'zod';

// ============ CONTRACT ============

export const createContractSchema = z.object({
  projectId: z.string().cuid('شناسه پروژه نامعتبر است'),
  amountRial: z.number().int().positive('مبلغ باید عدد مثبت باشد').max(10_000_000_000, 'مبلغ بیش از حد مجاز است'),
  budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  deadline: z.string().datetime().optional(),
  milestones: z.array(z.object({
    title: z.string().min(3, 'عنوان مرحله حداقل ۳ کاراکتر').max(200),
    description: z.string().max(2000).optional(),
    amountRial: z.number().int().positive('مبلغ مرحله باید عدد مثبت باشد'),
    dueDate: z.string().datetime().optional(),
  })).min(1, 'حداقل یک مرحله لازم است').max(20, 'حداکثر ۲۰ مرحله مجاز است'),
});

export type ContractCreateInput = z.infer<typeof createContractSchema>;

export const updateContractStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']),
  cancelReason: z.string().max(1000).optional(),
});

export type ContractStatusUpdateInput = z.infer<typeof updateContractStatusSchema>;

// ============ MILESTONE ============

export const createMilestoneSchema = z.object({
  title: z.string().min(3, 'عنوان مرحله حداقل ۳ کاراکتر').max(200),
  description: z.string().max(2000).optional(),
  amountRial: z.number().int().positive('مبلغ مرحله باید عدد مثبت باشد'),
  dueDate: z.string().datetime().optional(),
});

export type MilestoneCreateInput = z.infer<typeof createMilestoneSchema>;

export const updateMilestoneStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED']),
});

export type MilestoneStatusUpdateInput = z.infer<typeof updateMilestoneStatusSchema>;

export const contractQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ContractQueryInput = z.infer<typeof contractQuerySchema>;
