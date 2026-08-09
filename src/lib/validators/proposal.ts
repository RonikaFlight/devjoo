import { z } from 'zod';

/**
 * Proposal submission schema
 */
export const proposalSubmitSchema = z.object({
  priceRial: z
    .number()
    .int('مبلغ باید عدد صحیح باشد (ریال)')
    .min(100_000, 'حداقل مبلغ ۱۰۰,۰۰۰ ریال است')
    .max(100_000_000_000, 'مبلغ بیش از حد مجاز است'),
  estimatedDuration: z
    .string()
    .min(1, 'مدت زمان تخمینی الزامی است')
    .max(100, 'مدت زمان نامعتبر است'),
  coverLetter: z
    .string()
    .min(50, 'متن پیشنهاد باید حداقل ۵۰ کاراکتر باشد')
    .max(5000, 'متن پیشنهاد نباید بیشتر از ۵,۰۰۰ کاراکتر باشد'),
});

export type ProposalSubmitInput = z.infer<typeof proposalSubmitSchema>;

/**
 * Proposal status change schema (employer actions)
 */
export const proposalStatusSchema = z.object({
  status: z.enum(['VIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']),
  rejectionReason: z.string().max(500).optional(),
});

export type ProposalStatusInput = z.infer<typeof proposalStatusSchema>;

/**
 * Proposal filters (employer listing)
 */
export const proposalFiltersSchema = z.object({
  status: z
    .enum(['SUBMITTED', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'])
    .optional(),
  sort: z.enum(['newest', 'price_low', 'price_high']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ProposalFiltersInput = z.infer<typeof proposalFiltersSchema>;
