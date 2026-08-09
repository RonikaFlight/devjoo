import { z } from 'zod';

/**
 * Profile update schema (shared fields)
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'نام نمایشی باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام نمایشی نباید بیشتر از ۵۰ کاراکتر باشد')
    .optional(),
  bio: z
    .string()
    .max(2000, 'بیوگرافی نباید بیشتر از ۲۰۰۰ کاراکتر باشد')
    .optional(),
  city: z
    .string()
    .max(100, 'نام شهر معتبر نیست')
    .optional(),
  websiteUrl: z
    .string()
    .url('آدرس وب‌سایت معتبر نیست')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Freelancer profile update schema
 */
export const freelancerProfileUpdateSchema = z.object({
  headline: z
    .string()
    .min(5, 'عنوان باید حداقل ۵ کاراکتر باشد')
    .max(100, 'عنوان نباید بیشتر از ۱۰۰ کاراکتر باشد')
    .optional(),
  bio: z
    .string()
    .max(5000, 'بیوگرافی نباید بیشتر از ۵۰۰۰ کاراکتر باشد')
    .optional(),
  hourlyRateRial: z
    .number()
    .int('نرخ ساعتی باید عدد صحیح باشد')
    .min(0, 'نرخ ساعتی نمی‌تواند منفی باشد')
    .max(10_000_000_000, 'نرخ ساعتی بیش از حد مجاز است')
    .optional(),
  availability: z
    .enum(['AVAILABLE', 'LIMITED', 'BUSY', 'UNAVAILABLE'])
    .optional(),
  hoursPerWeek: z
    .number()
    .int()
    .min(1, 'حداقل ۱ ساعت در هفته')
    .max(80, 'حداکثر ۸۰ ساعت در هفته')
    .optional(),
  experienceLevel: z
    .enum(['JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXPERT'])
    .optional(),
});

export type FreelancerProfileUpdateInput = z.infer<typeof freelancerProfileUpdateSchema>;

/**
 * Employer profile update schema
 */
export const employerProfileUpdateSchema = z.object({
  companyName: z
    .string()
    .min(2, 'نام شرکت باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام شرکت نباید بیشتر از ۱۰۰ کاراکتر باشد')
    .optional(),
  industry: z
    .string()
    .max(100, 'صنعت نامعتبر است')
    .optional(),
  websiteUrl: z
    .string()
    .url('آدرس وب‌سایت معتبر نیست')
    .optional()
    .or(z.literal('')),
  companySize: z
    .enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'])
    .optional(),
});

export type EmployerProfileUpdateInput = z.infer<typeof employerProfileUpdateSchema>;

/**
 * Skill add/remove schema
 */
export const userSkillSchema = z.object({
  skillId: z.string().min(1, 'شناسه مهارت الزامی است'),
  proficiencyLevel: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .optional(),
});

export type UserSkillInput = z.infer<typeof userSkillSchema>;

/**
 * Portfolio item schema
 */
export const portfolioItemSchema = z.object({
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

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;