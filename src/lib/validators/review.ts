import { z } from 'zod';

/**
 * Submit a review for a completed project
 */
export const reviewCreateSchema = z.object({
  projectId: z.string().min(1, 'شناسه پروژه الزامی است'),
  rating: z
    .number()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است'),
  quality: z
    .number()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است')
    .optional(),
  communication: z
    .number()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است')
    .optional(),
  deadline: z
    .number()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است')
    .optional(),
  professionalism: z
    .number()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است')
    .optional(),
  comment: z
    .string()
    .min(10, 'دیدگاه باید حداقل ۱۰ کاراکتر باشد')
    .max(2000, 'دیدگاه نباید بیشتر از ۲۰۰۰ کاراکتر باشد'),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

/**
 * Filters for listing reviews
 */
export const reviewFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;

/**
 * Review reply schema (reviewee can reply once)
 */
export const reviewReplySchema = z.object({
  reply: z
    .string()
    .min(5, 'پاسخ باید حداقل ۵ کاراکتر باشد')
    .max(1000, 'پاسخ نباید بیشتر از ۱۰۰۰ کاراکتر باشد'),
});

export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;
