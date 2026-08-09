import { z } from 'zod';

/**
 * AI Project Builder — input validation
 */
export const buildProjectSchema = z.object({
  brief: z
    .string()
    .min(10, 'توضیحات پروژه باید حداقل ۱۰ کاراکتر باشد')
    .max(2000, 'توضیحات پروژه نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد'),
  categoryId: z.string().cuid().optional(),
  budgetType: z.enum(['FIXED', 'HOURLY']).optional(),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
});

export type BuildProjectInput = z.infer<typeof buildProjectSchema>;

/**
 * AI Proposal Assistant — input validation
 */
export const generateProposalSchema = z.object({
  projectId: z.string().cuid('شناسه پروژه نامعتبر است'),
  freelancerId: z.string().cuid('شناسه فریلنسر نامعتبر است'),
  additionalNotes: z.string().max(1000).optional(),
  proposedPriceRial: z
    .number()
    .int('قیمت باید عدد صحیح باشد')
    .positive('قیمت باید مثبت باشد')
    .max(10_000_000_000, 'قیمت پیشنهادی بسیار بالا است')
    .optional(),
});

export type GenerateProposalInput = z.infer<typeof generateProposalSchema>;
