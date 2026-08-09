import { z } from 'zod';

/**
 * Submit a verification request
 */
export const verificationRequestSchema = z.object({
  type: z.enum(['PHONE', 'EMAIL', 'IDENTITY', 'COMPANY', 'PAYMENT'], {
    message: 'نوع تاییدیه نامعتبر است',
  }),
  evidence: z
    .string()
    .max(5000, 'مستندات نباید بیشتر از ۵۰۰۰ کاراکتر باشد')
    .optional(),
});

export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;

/**
 * Admin: update verification status
 */
export const verificationUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    message: 'وضعیت نامعتبر است',
  }),
});

export type VerificationUpdateInput = z.infer<typeof verificationUpdateSchema>;
