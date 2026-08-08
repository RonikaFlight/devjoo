import { z } from 'zod';

/**
 * Iranian mobile phone validation (09xx xxx xxxx)
 */
const iranianPhone = z
  .string()
  .regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست (فرمت: 09xxxxxxxxx)');

/**
 * Email validation
 */
const email = z.string().email('ایمیل معتبر نیست');

/**
 * Password validation — minimum 8 chars, must have letter + number
 */
const password = z
  .string()
  .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
  .regex(/[a-zA-Z]/, 'رمز عبور باید حداقل یک حرف داشته باشد')
  .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد');

// ============ REQUEST SCHEMAS ============

/**
 * POST /api/v1/auth/otp/request
 */
export const otpRequestSchema = z.object({
  phone: iranianPhone,
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

/**
 * POST /api/v1/auth/otp/verify
 */
export const otpVerifySchema = z.object({
  phone: iranianPhone,
  code: z
    .string()
    .length(5, 'کد تایید باید ۵ رقمی باشد')
    .regex(/^[0-9]{5}$/, 'کد تایید فقط شامل اعداد است'),
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/**
 * POST /api/v1/auth/register — complete registration after OTP/OAuth
 */
export const registerSchema = z.object({
  displayName: z
    .string()
    .min(2, 'نام نمایشی باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام نمایشی نباید بیشتر از ۵۰ کاراکتر باشد'),
  role: z.enum(['FREELANCER', 'EMPLOYER'], {
    message: 'نقش باید فریلنسر یا کارفرما باشد',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * POST /api/v1/auth/login (email + password)
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * POST /api/v1/auth/password/set — set password for OTP/OAuth users
 */
export const setPasswordSchema = z.object({
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

/**
 * POST /api/v1/auth/password/change
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: password,
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'رمز عبور جدید نباید با رمز فعلی یکسان باشد',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * POST /api/v1/auth/otp/resend
 */
export const otpResendSchema = z.object({
  phone: iranianPhone,
});

export type OtpResendInput = z.infer<typeof otpResendSchema>;
