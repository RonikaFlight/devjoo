import { z } from 'zod';

// ============ TEAM ============

export const createTeamSchema = z.object({
  name: z.string().min(3, 'نام تیم حداقل ۳ کاراکتر').max(100),
  description: z.string().max(2000, 'توضیحات حداکثر ۲۰۰۰ کاراکتر').optional(),
});

export type TeamCreateInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().min(3, 'نام تیم حداقل ۳ کاراکتر').max(100).optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

export type TeamUpdateInput = z.infer<typeof updateTeamSchema>;

export const addTeamMemberSchema = z.object({
  userId: z.string().cuid('شناسه کاربر نامعتبر است'),
  role: z.enum(['SENIOR', 'MEMBER']).default('MEMBER'),
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['SENIOR', 'MEMBER']),
});

export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>;

export const teamQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().max(200).optional(),
});

export type TeamQueryInput = z.infer<typeof teamQuerySchema>;
