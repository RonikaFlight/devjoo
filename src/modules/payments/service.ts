import { db } from '@/lib/db';
import { PAYMENT_STATUS, PAYMENT_PROVIDER } from '@/types/enums';
import type { PaymentCreateInput, PaymentQueryInput } from '@/lib/validators/payment';
import { getPaymentProvider, getDefaultPaymentProvider, isRealPaymentConfigured } from './provider';

/**
 * Create a payment for a contract/milestone.
 * Uses the configured payment provider.
 */
export async function createPayment(userId: string, data: PaymentCreateInput) {
  // Validate contract
  const contract = await db.contract.findUnique({
    where: { id: data.contractId },
    include: { project: { select: { employerId: true } } },
  });
  if (!contract) return { error: 'NOT_FOUND', message: 'قرارداد یافت نشد' };
  if (contract.employerId !== userId) return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };

  // Validate milestone if provided
  if (data.milestoneId) {
    const milestone = await db.milestone.findFirst({
      where: { id: data.milestoneId, contractId: data.contractId },
    });
    if (!milestone) return { error: 'NOT_FOUND', message: 'مرحله یافت نشد' };
    if (milestone.amountRial !== data.amountRial) {
      return { error: 'VALIDATION_ERROR', message: 'مبلغ پرداخت با مبلغ مرحله مطابقت ندارد' };
    }
  }

  // Validate amount matches contract if no milestone
  if (!data.milestoneId && data.amountRial > contract.amountRial) {
    return { error: 'VALIDATION_ERROR', message: 'مبلغ پرداخت نمی‌تواند بیشتر از مبلغ قرارداد باشد' };
  }

  // Use provider
  const provider = getPaymentProvider(data.provider);
  const result = await provider.createPayment({
    amountRial: data.amountRial,
    description: data.description,
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/v1/payments/callback`,
  });

  if (!result.success) {
    return { error: 'PAYMENT_FAILED', message: result.message || 'خطا در ایجاد پرداخت' };
  }

  // Create payment record
  const payment = await db.payment.create({
    data: {
      contractId: data.contractId,
      milestoneId: data.milestoneId || null,
      amountRial: data.amountRial,
      status: isRealPaymentConfigured() ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.COMPLETED,
      provider: data.provider,
      description: data.description,
      transactions: {
        create: {
          provider: data.provider,
          externalId: result.transactionId,
          status: isRealPaymentConfigured() ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.COMPLETED,
          amountRial: data.amountRial,
        },
      },
    },
    include: {
      contract: { select: { id: true, projectId: true } },
      transactions: true,
    },
  });

  return { payment, redirectUrl: result.redirectUrl };
}

/**
 * Get a payment by ID.
 */
export async function getPayment(paymentId: string, userId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      contract: {
        select: {
          id: true, projectId: true, freelancerId: true, employerId: true,
          project: { select: { title: true } },
        },
      },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!payment) return { error: 'NOT_FOUND', message: 'پرداخت یافت نشد' };

  // Only contract parties can view
  if (payment.contract.freelancerId !== userId && payment.contract.employerId !== userId) {
    return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };
  }

  return { payment };
}

/**
 * List payments for a user (contracts they're part of).
 */
export async function listPayments(userId: string, query: PaymentQueryInput) {
  const where: Record<string, unknown> = {
    contract: {
      OR: [
        { freelancerId: userId },
        { employerId: userId },
      ],
    },
  };
  if (query.contractId) where.contractId = query.contractId;
  if (query.status) where.status = query.status;

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      include: {
        contract: { select: { id: true, projectId: true, freelancerId: true, employerId: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.payment.count({ where }),
  ]);

  return { payments, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}
