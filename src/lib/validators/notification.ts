import { z } from 'zod';

/**
 * Filters for listing notifications
 */
export const notificationFiltersSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(30),
});

export type NotificationFiltersInput = z.infer<typeof notificationFiltersSchema>;

/**
 * Mark notifications as read (single or all)
 */
export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1).optional(),
  markAll: z.boolean().default(false),
});

export type NotificationMarkReadInput = z.infer<typeof notificationMarkReadSchema>;

/**
 * Update a notification preference
 */
export const notificationPreferenceSchema = z.object({
  type: z.string().min(1, 'نوع اعلان الزامی است'),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']),
  enabled: z.boolean(),
});

export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;

/**
 * Batch update notification preferences
 */
export const notificationPreferencesBatchSchema = z.object({
  preferences: z.array(notificationPreferenceSchema).min(1).max(50),
});

export type NotificationPreferencesBatchInput = z.infer<typeof notificationPreferencesBatchSchema>;
