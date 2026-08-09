import { z } from 'zod';

/**
 * Create a new portfolio item
 */
export const portfolioCreateSchema = z.object({
  title: z
    .string()
    .min(2, 'عنوان باید حداقل ۲ کاراکتر باشد')
    .max(200, 'عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد'),
  description: z
    .string()
    .max(2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد')
    .optional(),
  imageUrl: z.string().url('آدرس تصویر معتبر نیست').optional().or(z.literal('')),
  projectUrl: z.string().url('آدرس پروژه معتبر نیست').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).default(0),
});

export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;

/**
 * Update an existing portfolio item
 */
export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;

/**
 * Reorder portfolio items — array of { id, displayOrder }
 */
export const portfolioReorderSchema = z.array(
  z.object({
    id: z.string().min(1, 'شناسه الزامی است'),
    displayOrder: z.number().int().min(0),
  })
).min(1, 'حداقل یک آیتم مورد نیاز است');

export type PortfolioReorderInput = z.infer<typeof portfolioReorderSchema>;
