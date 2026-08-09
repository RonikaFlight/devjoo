import { z } from 'zod';

/**
 * Send a message in a conversation
 */
export const messageSendSchema = z.object({
  content: z
    .string()
    .min(1, 'محتوای پیام نمی‌تواند خالی باشد')
    .max(5000, 'پیام نباید بیشتر از ۵۰۰۰ کاراکتر باشد'),
  type: z.enum(['TEXT', 'FILE', 'PROPOSAL_REFERENCE', 'PROJECT_REFERENCE']).default('TEXT'),
});

export type MessageSendInput = z.infer<typeof messageSendSchema>;

/**
 * Filters for listing messages
 */
export const messageFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;