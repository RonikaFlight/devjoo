import crypto from 'crypto';
import { db } from '@/lib/db';

const OTP_LENGTH = 5;
const OTP_EXPIRY_MINUTES = 2;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 1;
const MAX_OTP_PER_WINDOW = 2;

/**
 * In development mode, the OTP is always 12345.
 * This allows testing without a real SMS provider.
 */
function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Generate a random numeric OTP code.
 */
function generateOtpCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += digits[crypto.randomInt(0, digits.length)];
  }
  return code;
}

/**
 * Hash an OTP code for secure storage.
 */
function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export interface OtpRequestResult {
  success: boolean;
  error?: string;
  /** In dev mode, returns the actual code for testing */
  devCode?: string;
}

/**
 * Request an OTP code for the given phone number.
 * Enforces rate limiting per phone number.
 */
export async function requestOtp(phone: string): Promise<OtpRequestResult> {
  // Rate limiting: check recent OTP requests
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  );

  const recentOtps = await db.otpRequest.count({
    where: {
      phone,
      createdAt: { gte: windowStart },
    },
  });

  if (recentOtps >= MAX_OTP_PER_WINDOW) {
    return {
      success: false,
      error:
        'تعداد درخواست کد بیش از حد مجاز است. لطفاً ' +
        RATE_LIMIT_WINDOW_MINUTES +
        ' دقیقه صبر کنید.',
    };
  }

  const code = isDevMode() ? '12345' : generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.otpRequest.create({
    data: {
      phone,
      codeHash,
      expiresAt,
      maxAttempts: MAX_ATTEMPTS,
    },
  });

  // In production, send via SMS provider here
  // For now, we only log in dev mode
  if (isDevMode()) {
    console.log(`[DEV OTP] Phone: ${phone}, Code: ${code}`);
  }

  return {
    success: true,
 devCode: isDevMode() ? code : undefined,
  };
}

export interface OtpVerifyResult {
  success: boolean;
  error?: string;
  otpRequestId?: string;
}

/**
 * Verify an OTP code for the given phone number.
 * Finds the latest unverified OTP and checks the code.
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<OtpVerifyResult> {
  // Find the latest unverified OTP for this phone
  const otpRequest = await db.otpRequest.findFirst({
    where: {
      phone,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRequest) {
    return {
      success: false,
      error: 'کد تایید یافت نشد. لطفاً دوباره درخواست دهید.',
    };
  }

  // Check expiry
  if (otpRequest.expiresAt < new Date()) {
    return {
      success: false,
      error: 'کد تایید منقضی شده است. لطفاً دوباره درخواست دهید.',
    };
  }

  // Check attempt limit
  if (otpRequest.attempts >= otpRequest.maxAttempts) {
    return {
      success: false,
      error: 'تعداد دفعات تلاش بیش از حد مجاز است. لطفاً کد جدید درخواست دهید.',
    };
  }

  // Increment attempt counter
  await db.otpRequest.update({
    where: { id: otpRequest.id },
    data: { attempts: { increment: 1 } },
  });

  // Verify code
  const codeHash = hashOtp(code);
  if (codeHash !== otpRequest.codeHash) {
    return {
      success: false,
      error: 'کد تایید نادرست است.',
    };
  }

  // Mark as verified
  await db.otpRequest.update({
    where: { id: otpRequest.id },
    data: { verified: true },
  });

  return {
    success: true,
    otpRequestId: otpRequest.id,
  };
}

/**
 * Clean up expired OTP requests (call periodically).
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await db.otpRequest.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}
