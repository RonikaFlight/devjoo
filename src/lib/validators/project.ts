import { z } from 'zod';

/**
 * Project creation schema
 */
export const projectCreateSchema = z.object({
  title: z
    .string()
    .min(10, 'عنوان پروژه باید حداقل ۱۰ کاراکتر باشد')
    .max(150, 'عنوان پروژه نباید بیشتر از ۱۵۰ کاراکتر باشد'),
  description: z
    .string()
    .min(30, 'توضیحات پروژه باید حداقل ۳۰ کاراکتر باشد')
    .max(10000, 'توضیحات پروژه نباید بیشتر از ۱۰,۰۰۰ کاراکتر باشد'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  skills: z
    .array(z.string().min(1))
    .min(1, 'حداقل یک مهارت انتخاب کنید')
    .max(10, 'حداکثر ۱۰ مهارت می‌توانید انتخاب کنید'),
  budgetType: z.enum(['FIXED', 'HOURLY']),
  budgetMinRial: z
    .number()
    .int('مبلغ باید عدد صحیح باشد (ریال)')
    .min(100_000, 'حداقل بودجه ۱۰۰,۰۰۰ ریال است')
    .max(100_000_000_000, 'بودجه بیش از حد مجاز است')
    .optional(),
  budgetMaxRial: z
    .number()
    .int('مبلغ باید عدد صحیح باشد (ریال)')
    .min(100_000, 'حداقل بودجه ۱۰۰,۰۰۰ ریال است')
    .max(100_000_000_000, 'بودجه بیش از حد مجاز است')
    .optional(),
  fixedPriceRial: z
    .number()
    .int('مبلغ باید عدد صحیح باشد (ریال)')
    .min(100_000, 'حداقل مبلغ ۱۰۰,۰۰۰ ریال است')
    .max(100_000_000_000, 'مبلغ بیش از حد مجاز است')
    .optional(),
  estimatedDuration: z.string().max(100).optional(),
  experienceLevel: z.enum(['JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXPERT']).optional(),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).default('REMOTE'),
  city: z.string().max(100).optional(),
  deadline: z.string().datetime().optional(),
  proposalLimit: z
    .number()
    .int()
    .min(3, 'حداقل تعداد پیشنهاد ۳ است')
    .max(20, 'حداکثر تعداد پیشنهاد ۲۰ است')
    .default(10),
});

/**
 * Refine: budget must make sense for budget type
 */
export const projectCreateRefined = projectCreateSchema
  .refine(
    (data) => {
      if (data.budgetType === 'FIXED') {
        return data.fixedPriceRial !== undefined && data.fixedPriceRial > 0;
      }
      return true;
    },
    {
      message: 'برای پروژه با قیمت ثابت، مبلغ الزامی است',
      path: ['fixedPriceRial'],
    }
  )
  .refine(
    (data) => {
      if (data.budgetType === 'HOURLY') {
        return (
          data.budgetMinRial !== undefined &&
          data.budgetMaxRial !== undefined &&
          data.budgetMinRial > 0 &&
          data.budgetMaxRial > 0
        );
      }
      return true;
    },
    {
      message: 'برای پروژه ساعتی، حداقل و حداکثر نرخ الزامی است',
      path: ['budgetMinRial'],
    }
  )
  .refine(
    (data) => {
      if (data.budgetType === 'HOURLY' && data.budgetMinRial && data.budgetMaxRial) {
        return data.budgetMaxRial >= data.budgetMinRial;
      }
      return true;
    },
    {
      message: 'حداکثر نرخ نباید کمتر از حداقل باشد',
      path: ['budgetMaxRial'],
    }
  );

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

/**
 * Project update schema (partial — all fields optional)
 */
export const projectUpdateSchema = z.object({
  title: z
    .string()
    .min(10)
    .max(150)
    .optional(),
  description: z
    .string()
    .min(30)
    .max(10000)
    .optional(),
  categoryId: z.string().min(1).optional(),
  skills: z.array(z.string().min(1)).min(1).max(10).optional(),
  budgetType: z.enum(['FIXED', 'HOURLY']).optional(),
  budgetMinRial: z.number().int().min(100_000).max(100_000_000_000).optional(),
  budgetMaxRial: z.number().int().min(100_000).max(100_000_000_000).optional(),
  fixedPriceRial: z.number().int().min(100_000).max(100_000_000_000).optional(),
  estimatedDuration: z.string().max(100).optional(),
  experienceLevel: z.enum(['JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXPERT']).optional(),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  city: z.string().max(100).optional(),
  deadline: z.string().datetime().optional(),
  proposalLimit: z.number().int().min(3).max(20).optional(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

/**
 * Project filters (for listing)
 */
export const projectFiltersSchema = z.object({
  categoryId: z.string().optional(),
  skills: z.array(z.string()).optional(),
  budgetType: z.enum(['FIXED', 'HOURLY']).optional(),
  experienceLevel: z.enum(['JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXPERT']).optional(),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  minBudget: z.number().int().positive().optional(),
  maxBudget: z.number().int().positive().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  sort: z
    .enum(['newest', 'oldest', 'budget_low', 'budget_high', 'most_proposals'])
    .default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  search: z.string().max(200).optional(),
});

export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>;

/**
 * Project status transition schema
 */
export const projectStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PENDING_REVIEW',
    'PUBLISHED',
    'PAUSED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ]),
});

export type ProjectStatusInput = z.infer<typeof projectStatusSchema>;