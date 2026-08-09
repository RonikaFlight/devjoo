import { z } from 'zod';

/**
 * Admin user list filters
 */
export const adminUserListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'displayName', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminUserListInput = z.infer<typeof adminUserListSchema>;

/**
 * Admin user update schema (activate/deactivate, role management)
 */
export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  addRoles: z.array(z.string()).optional(),
  removeRoles: z.array(z.string()).optional(),
});

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

/**
 * Admin project list filters
 */
export const adminProjectListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  isReported: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminProjectListInput = z.infer<typeof adminProjectListSchema>;

/**
 * Admin project moderation schema
 */
export const adminProjectModerateSchema = z.object({
  status: z.enum(['PUBLISHED', 'REJECTED', 'PAUSED']),
  rejectionReason: z.string().max(500).optional(),
  isFeatured: z.boolean().optional(),
});

export type AdminProjectModerateInput = z.infer<typeof adminProjectModerateSchema>;

/**
 * Admin verification list filters
 */
export const adminVerificationListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  role: z.enum(['freelancer', 'employer']).optional(),
});

export type AdminVerificationListInput = z.infer<typeof adminVerificationListSchema>;

/**
 * Admin blog post schema
 */
export const adminBlogPostSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد').max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'اسلاگ نامعتبر است'),
  excerpt: z.string().max(500).optional(),
  body: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
});

export type AdminBlogPostInput = z.infer<typeof adminBlogPostSchema>;

/**
 * Admin blog category schema
 */
export const adminBlogCategorySchema = z.object({
  name: z.string().min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'اسلاگ نامعتبر است'),
});

export type AdminBlogCategoryInput = z.infer<typeof adminBlogCategorySchema>;

/**
 * Admin redirect schema
 */
export const adminRedirectSchema = z.object({
  fromPath: z.string().min(1, 'مسیر مبدا الزامی است').max(500),
  toPath: z.string().min(1, 'مسیر مقصد الزامی است').max(500),
  type: z.enum(['301', '302']).default('301'),
});

export type AdminRedirectInput = z.infer<typeof adminRedirectSchema>;

/**
 * Admin feature flag update schema
 */
export const adminFeatureFlagSchema = z.object({
  key: z.string().min(1),
  value: z.boolean(),
});

export type AdminFeatureFlagInput = z.infer<typeof adminFeatureFlagSchema>;

/**
 * Admin audit log list filters
 */
export const adminAuditLogListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  actorId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type AdminAuditLogListInput = z.infer<typeof adminAuditLogListSchema>;