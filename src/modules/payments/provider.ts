import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@/types/enums';

// ============ PAYMENT PROVIDER INTERFACE ============

export interface PaymentProviderResult {
  success: boolean;
  transactionId: string;
  redirectUrl?: string;
  message?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: string;
  message: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** Create a payment request — returns redirect URL or transaction ID */
  createPayment(params: CreatePaymentParams): Promise<PaymentProviderResult>;
  /** Verify a completed payment */
  verifyPayment(transactionId: string, amountRial: number): Promise<PaymentVerifyResult>;
  /** Refund a payment */
  refundPayment(transactionId: string, amountRial: number): Promise<PaymentVerifyResult>;
}

export interface CreatePaymentParams {
  amountRial: number;
  description?: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}

// ============ INTERNAL (DEV) PROVIDER ============

/**
 * Internal/dev payment provider that simulates payments.
 * In production, replace with ZarinPal, IDPay, etc.
 */
class InternalPaymentProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDER.INTERNAL;

  async createPayment(params: CreatePaymentParams): Promise<PaymentProviderResult> {
    // Simulate instant success in dev mode
    return {
      success: true,
      transactionId: `internal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message: 'پرداخت داخلی (توسعه)',
    };
  }

  async verifyPayment(transactionId: string, amountRial: number): Promise<PaymentVerifyResult> {
    return {
      success: true,
      status: PAYMENT_STATUS.COMPLETED,
      message: 'پرداخت داخلی تایید شد',
    };
  }

  async refundPayment(transactionId: string, amountRial: number): Promise<PaymentVerifyResult> {
    return {
      success: true,
      status: PAYMENT_STATUS.REFUNDED,
      message: 'بازپرداخت داخلی انجام شد',
    };
  }
}

// ============ PROVIDER FACTORY ============

const providers: Record<string, PaymentProvider> = {
 [PAYMENT_PROVIDER.INTERNAL]: new InternalPaymentProvider(),
};

/**
 * Get a payment provider by name.
 * Currently only INTERNAL is implemented.
 * Future: ZarinPal, IDPay, Payir providers.
 */
export function getPaymentProvider(name: string): PaymentProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`پرداخت‌ساز ${name} پشتیبانی نمی‌شود`);
  }
  return provider;
}

/**
 * Get the configured default payment provider.
 */
export function getDefaultPaymentProvider(): PaymentProvider {
  const envProvider = process.env.PAYMENT_PROVIDER || PAYMENT_PROVIDER.INTERNAL;
  return getPaymentProvider(envProvider);
}

/**
 * Check if a real (non-internal) payment provider is configured.
 */
export function isRealPaymentConfigured(): boolean {
  const provider = process.env.PAYMENT_PROVIDER || PAYMENT_PROVIDER.INTERNAL;
  return provider !== PAYMENT_PROVIDER.INTERNAL;
}
