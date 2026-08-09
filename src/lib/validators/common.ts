import { z } from 'zod';

/**
 * Common pagination schema — reusable across list endpoints
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Common ID param schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'شناسه الزامی است'),
});

/**
 * Common slug param schema
 */
export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1, 'اسلاگ الزامی است')
    .regex(/^[a-z0-9-]+$/, 'اسلاگ نامعتبر است'),
});

/**
 * API error response shape
 */
export const apiErrorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.string()).optional(),
  }),
});

/**
 * API success response shape
 */
export const apiSuccessResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    meta: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      totalPages: z.number().optional(),
    }).optional(),
  });
