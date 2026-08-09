import { z } from 'zod';

/**
 * Category creation schema (admin)
 */
export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد'),
  slug: z
    .string()
    .min(2, 'اسلاگ باید حداقل ۲ کاراکتر باشد')
    .max(100, 'اسلاگ نامعتبر است')
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط شامل حروف انگلیسی، اعداد و خط تیره است'),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  icon: z.string().max(100).optional(),
  displayOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

/**
 * Category update schema
 */
export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/**
 * Skill creation schema (admin)
 */
export const skillCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'نام مهارت باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام مهارت نباید بیشتر از ۱۰۰ کاراکتر باشد'),
  slug: z
    .string()
    .min(2, 'اسلاگ باید حداقل ۲ کاراکتر باشد')
    .max(100, 'اسلاگ نامعتبر است')
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط شامل حروف انگلیسی، اعداد و خط تیره است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  icon: z.string().max(100).optional(),
  displayOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});

export type SkillCreateInput = z.infer<typeof skillCreateSchema>;

/**
 * Skill update schema
 */
export const skillUpdateSchema = skillCreateSchema.partial();

export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;

/**
 * Skill synonym schema (admin)
 */
export const skillSynonymSchema = z.object({
  skillId: z.string().min(1, 'شناسه مهارت الزامی است'),
  name: z
    .string()
    .min(2, 'نام مترادف باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام مترادف نامعتبر است'),
});

export type SkillSynonymInput = z.infer<typeof skillSynonymSchema>;