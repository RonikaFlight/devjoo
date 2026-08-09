import { z } from 'zod';

/**
 * Create or find a conversation
 */
export const conversationCreateSchema = z.object({
  participantId: z.string().min(1, 'شناسه شرکت‌کننده الزامی است'),
  projectId: z.string().optional(),
  type: z.enum(['DIRECT', 'PROJECT']).optional(),
});

export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;

/**
 * Filters for listing conversations
 */
export const conversationFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ConversationFiltersInput = z.infer<typeof conversationFiltersSchema>;
