import { z } from 'zod';

// ============ SERVICE LISTING ============

export const createServiceListingSchema = z.object({
  title: z.string().min(10, 'عنوان سرویس حداقل ۱۰ کاراکتر').max(150),
  description: z.string().min(30, 'توضیحات سرویس حداقل ۳۰ کاراکتر').max(5000),
  categoryId: z.string().cuid('شناسه دسته‌بندی نامعتبر است').optional(),
  priceRial: z.number().int().positive('قیمت باید عدد مثبت باشد').max(10_000_000_000, 'قیمت بیش از حد مجاز است'),
  deliveryDays: z.number().int().min(1, 'زمان تحویل حداقل ۱ روز').max(365, 'زمان تحویل حداکثر ۳۶۵ روز'),
  revisions: z.number().int().min(0, 'تعداد اصلاحات نمی‌تواند منفی باشد').max(20, 'حداکثر ۲۰ اصلاح مجاز است').default(1),
  trialPriceRial: z.number().int().positive('قیمت آزمایشی باید عدد مثبت باشد').max(10_000_000_000).optional(),
  trialDays: z.number().int().min(1, 'مدت آزمایشی حداقل ۱ روز').max(14, 'مدت آزمایشی حداکثر ۱۴ روز').optional(),
  skillIds: z.array(z.string().cuid()).max(10, 'حداکثر ۱۰ مهارت مجاز است').optional(),
});

export type ServiceListingCreateInput = z.infer<typeof createServiceListingSchema>;

export const updateServiceListingSchema = z.object({
  title: z.string().min(10, 'عنوان سرویس حداقل ۱۰ کاراکتر').max(150).optional(),
  description: z.string().min(30, 'توضیحات سرویس حداقل ۳۰ کاراکتر').max(5000).optional(),
  categoryId: z.string().cuid().nullable().optional(),
  priceRial: z.number().int().positive().max(10_000_000_000).optional(),
  deliveryDays: z.number().int().min(1).max(365).optional(),
  revisions: z.number().int().min(0).max(20).optional(),
  trialPriceRial: z.number().int().positive().max(10_000_000_000).nullable().optional(),
  trialDays: z.number().int().min(1).max(14).nullable().optional(),
  skillIds: z.array(z.string().cuid()).max(10).optional(),
});

export type ServiceListingUpdateInput = z.infer<typeof updateServiceListingSchema>;

export const serviceListingStatusSchema = z.object({
  status: z.enum(['PUBLISHED', 'PAUSED', 'ARCHIVED']),
});

export type ServiceListingStatusInput = z.infer<typeof serviceListingStatusSchema>;

export const serviceListingQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  skillId: z.string().cuid().optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().max(200).optional(),
});

export type ServiceListingQueryInput = z.infer<typeof serviceListingQuerySchema>;

// ============ SERVICE ORDER ============

export const createServiceOrderSchema = z.object({
  serviceId: z.string().cuid('شناسه سرویس نامعتبر است'),
  requirements: z.string().max(3000, 'الزامات حداکثر ۳۰۰۰ کاراکتر').optional(),
  isTrial: z.boolean().default(false),
});

export type ServiceOrderCreateInput = z.infer<typeof createServiceOrderSchema>;

export const updateServiceOrderStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
  cancelReason: z.string().max(1000).optional(),
});

export type ServiceOrderStatusInput = z.infer<typeof updateServiceOrderStatusSchema>;

export const serviceOrderQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ServiceOrderQueryInput = z.infer<typeof serviceOrderQuerySchema>;
