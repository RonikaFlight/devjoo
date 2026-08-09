import { z } from 'zod';

// ============ PAYMENT ============

export const createPaymentSchema = z.object({
  contractId: z.string().cuid('شناسه قرارداد نامعتبر است'),
  milestoneId: z.string().cuid().optional(),
  amountRial: z.number().int().positive('مبلغ باید عدد مثبت باشد').max(10_000_000_000, 'مبلغ بیش از حد مجاز است'),
  provider: z.enum(['INTERNAL', 'ZARINPAL', 'IDPAY', 'PAYIR', 'BANK_TRANSFER']).default('INTERNAL'),
  description: z.string().max(500).optional(),
});

export type PaymentCreateInput = z.infer<typeof createPaymentSchema>;

export const paymentQuerySchema = z.object({
  contractId: z.string().cuid().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
