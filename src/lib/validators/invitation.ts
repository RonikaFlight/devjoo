import { z } from 'zod';

/**
 * Create a project invitation (employer invites a freelancer)
 */
export const invitationCreateSchema = z.object({
  projectId: z.string().min(1, 'شناسه پروژه الزامی است'),
  freelancerId: z.string().min(1, 'شناسه فریلنسر الزامی است'),
  message: z
    .string()
    .max(1000, 'پیام نباید بیشتر از ۱۰۰۰ کاراکتر باشد')
    .optional(),
});

export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>;

/**
 * Respond to an invitation (freelancer accepts/declines)
 */
export const invitationRespondSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED'], {
    message: 'وضعیت نامعتبر است. فقط ACCEPTED یا DECLINED مجاز است.',
  }),
});

export type InvitationRespondInput = z.infer<typeof invitationRespondSchema>;

/**
 * Filters for listing invitations
 */
export const invitationFiltersSchema = z.object({
  status: z.enum(['SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type InvitationFiltersInput = z.infer<typeof invitationFiltersSchema>;