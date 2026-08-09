import { db } from '@/lib/db';
import { SERVICE_LISTING_STATUS, SERVICE_ORDER_STATUS, VALID_SERVICE_ORDER_TRANSITIONS } from '@/types/enums';
import type { ServiceListingCreateInput, ServiceListingUpdateInput, ServiceListingStatusInput, ServiceListingQueryInput, ServiceOrderCreateInput, ServiceOrderStatusInput, ServiceOrderQueryInput } from '@/lib/validators/service';
import { generateSlug, uniqueSlug } from '@/lib/utils/slug';

/**
 * Create a new service listing (freelancer only).
 */
export async function createServiceListing(freelancerId: string, data: ServiceListingCreateInput) {
  // Verify freelancer profile exists
  const profile = await db.profile.findUnique({
    where: { userId: freelancerId },
    select: { freelancerProfile: { select: { id: true } } },
  });
  if (!profile?.freelancerProfile) {
    return { error: 'FORBIDDEN', message: 'فقط فریلنسرها می‌توانند سرویس ایجاد کنند' };
  }

  // Validate category if provided
  if (data.categoryId) {
    const category = await db.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return { error: 'NOT_FOUND', message: 'دسته‌بندی یافت نشد' };
  }

  // Validate skills if provided
  if (data.skillIds && data.skillIds.length > 0) {
    const skillCount = await db.skill.count({ where: { id: { in: data.skillIds } } });
    if (skillCount !== data.skillIds.length) {
      return { error: 'NOT_FOUND', message: 'برخی مهارت‌ها یافت نشدند' };
    }
  }

  // Generate unique slug
  let slug = generateSlug(data.title);
  let existing = await db.serviceListing.findUnique({ where: { slug } });
  let attempts = 0;
  while (existing && attempts < 5) {
    slug = uniqueSlug(slug);
    existing = await db.serviceListing.findUnique({ where: { slug } });
    attempts++;
  }

  const service = await db.serviceListing.create({
    data: {
      freelancerId,
      title: data.title,
      slug,
      description: data.description,
      categoryId: data.categoryId,
      priceRial: data.priceRial,
      deliveryDays: data.deliveryDays,
      revisions: data.revisions,
      trialPriceRial: data.trialPriceRial || null,
      trialDays: data.trialDays || null,
      status: SERVICE_LISTING_STATUS.DRAFT,
      skills: data.skillIds ? {
        create: data.skillIds.map((skillId) => ({ skillId })),
      } : undefined,
    },
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { id: true, name: true, slug: true } } } },
      freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true } } } } } },
    },
  });

  return { service };
}

/**
 * Get a single service listing by slug.
 */
export async function getServiceListing(slug: string) {
  const service = await db.serviceListing.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { id: true, name: true, slug: true } } } },
      freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, city: true, freelancerProfile: { select: { headline: true, averageRating: true, totalCompletedProjects: true } } } } } },
    },
  });
  if (!service) return { error: 'NOT_FOUND', message: 'سرویس یافت نشد' };
  return { service };
}

/**
 * List published service listings with filters.
 */
export async function listServiceListings(query: ServiceListingQueryInput) {
  const where: Record<string, unknown> = { status: SERVICE_LISTING_STATUS.PUBLISHED };

  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.skillId) {
    where.skills = { some: { skillId: query.skillId } };
  }
  if (query.minPrice || query.maxPrice) {
    where.priceRial = {} as Record<string, unknown>;
    if (query.minPrice) (where.priceRial as Record<string, unknown>).gte = query.minPrice;
    if (query.maxPrice) (where.priceRial as Record<string, unknown>).lte = query.maxPrice;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (query.sort) {
    case 'price_asc': orderBy.priceRial = 'asc'; break;
    case 'price_desc': orderBy.priceRial = 'desc'; break;
    case 'rating': orderBy.averageRating = 'desc'; break;
    case 'popular': orderBy.totalOrders = 'desc'; break;
    default: orderBy.createdAt = 'desc'; break;
  }

  const [services, total] = await Promise.all([
    db.serviceListing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        skills: { include: { skill: { select: { name: true, slug: true } } } },
        freelancer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true } } } } } },
      },
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.serviceListing.count({ where }),
  ]);

  return { services, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

/**
 * List own service listings (freelancer).
 */
export async function listMyServiceListings(freelancerId: string, status?: string) {
  const where: Record<string, unknown> = { freelancerId };
  if (status) where.status = status;

  const services = await db.serviceListing.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { services };
}

/**
 * Update a service listing.
 */
export async function updateServiceListing(serviceId: string, freelancerId: string, data: ServiceListingUpdateInput) {
  const service = await db.serviceListing.findUnique({ where: { id: serviceId } });
  if (!service) return { error: 'NOT_FOUND', message: 'سرویس یافت نشد' };
  if (service.freelancerId !== freelancerId) return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.priceRial !== undefined) updateData.priceRial = data.priceRial;
  if (data.deliveryDays !== undefined) updateData.deliveryDays = data.deliveryDays;
  if (data.revisions !== undefined) updateData.revisions = data.revisions;
  if (data.trialPriceRial !== undefined) updateData.trialPriceRial = data.trialPriceRial;
  if (data.trialDays !== undefined) updateData.trialDays = data.trialDays;

  // Handle skill updates
  if (data.skillIds !== undefined) {
    await db.serviceListingSkill.deleteMany({ where: { serviceListingId: serviceId } });
    if (data.skillIds.length > 0) {
      await db.serviceListingSkill.createMany({
        data: data.skillIds.map((skillId) => ({ serviceListingId: serviceId, skillId })),
      });
    }
  }

  const updated = await db.serviceListing.update({
    where: { id: serviceId },
    data: updateData,
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
    },
  });

  return { service: updated };
}

/**
 * Update service listing status.
 */
export async function updateServiceListingStatus(serviceId: string, freelancerId: string, data: ServiceListingStatusInput) {
  const service = await db.serviceListing.findUnique({ where: { id: serviceId } });
  if (!service) return { error: 'NOT_FOUND', message: 'سرویس یافت نشد' };
  if (service.freelancerId !== freelancerId) return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };

  const updated = await db.serviceListing.update({
    where: { id: serviceId },
    data: { status: data.status },
  });

  return { service: updated };
}

/**
 * Place an order for a service (employer only).
 */
export async function createServiceOrder(employerId: string, data: ServiceOrderCreateInput) {
  const service = await db.serviceListing.findUnique({
    where: { id: data.serviceId },
    include: { freelancer: { select: { id: true } } },
  });
  if (!service) return { error: 'NOT_FOUND', message: 'سرویس یافت نشد' };
  if (service.status !== SERVICE_LISTING_STATUS.PUBLISHED) {
    return { error: 'INVALID_STATE', message: 'سرویس در دسترس نیست' };
  }
  if (service.freelancerId === employerId) {
    return { error: 'FORBIDDEN', message: 'شما نمی‌توانید سفارش خودتان را ثبت کنید' };
  }

  // Handle trial order
  let orderPriceRial = service.priceRial;
  let orderDeliveryDays = service.deliveryDays;
  if (data.isTrial) {
    if (!service.trialPriceRial || !service.trialDays) {
      return { error: 'FORBIDDEN', message: 'سرویس آزمایشی موجود نیست' };
    }
    orderPriceRial = service.trialPriceRial;
    orderDeliveryDays = service.trialDays;
  }

  const order = await db.serviceOrder.create({
    data: {
      serviceId: data.serviceId,
      employerId,
      priceRial: orderPriceRial,
      requirements: data.requirements,
      deliveryDays: orderDeliveryDays,
      revisions: service.revisions,
      status: SERVICE_ORDER_STATUS.PENDING,
    },
    include: {
      service: { select: { id: true, title: true, slug: true, priceRial: true } },
      employer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
    },
  });

  // Increment total orders
  await db.serviceListing.update({
    where: { id: data.serviceId },
    data: { totalOrders: { increment: 1 } },
  });

  return { order };
}

/**
 * List service orders for a user (employer's orders or freelancer's received orders).
 */
export async function listServiceOrders(userId: string, role: 'employer' | 'freelancer', query: ServiceOrderQueryInput) {
  const where: Record<string, unknown> = {};
  if (role === 'employer') {
    where.employerId = userId;
  } else {
    where.service = { freelancerId: userId };
  }
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    db.serviceOrder.findMany({
      where,
      include: {
        service: { select: { id: true, title: true, slug: true, priceRial: true, freelancerId: true } },
        employer: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.serviceOrder.count({ where }),
  ]);

  return { orders, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

/**
 * Update service order status with state machine validation.
 */
export async function updateServiceOrderStatus(orderId: string, userId: string, role: 'employer' | 'freelancer', data: ServiceOrderStatusInput) {
  const order = await db.serviceOrder.findUnique({
    where: { id: orderId },
    include: { service: { select: { freelancerId: true } } },
  });
  if (!order) return { error: 'NOT_FOUND', message: 'سفارش یافت نشد' };

  const isEmployer = order.employerId === userId;
  const isFreelancer = order.service.freelancerId === userId;
  if (!isEmployer && !isFreelancer) return { error: 'FORBIDDEN', message: 'شما دسترسی ندارید' };

  // Role-based restrictions
  if (data.status === SERVICE_ORDER_STATUS.ACCEPTED && !isFreelancer) {
    return { error: 'FORBIDDEN', message: 'فقط فریلنسر می‌تواند سفارش را بپذیرد' };
  }
  if (data.status === SERVICE_ORDER_STATUS.IN_PROGRESS && !isFreelancer) {
    return { error: 'FORBIDDEN', message: 'فقط فریلنسر می‌تواند شروع به کار کند' };
  }
  if (data.status === SERVICE_ORDER_STATUS.DELIVERED && !isFreelancer) {
    return { error: 'FORBIDDEN', message: 'فقط فریلنسر می‌تواند تحویل دهد' };
  }
  if (data.status === SERVICE_ORDER_STATUS.COMPLETED && !isEmployer) {
    return { error: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند تایید نهایی کند' };
  }
  if (data.status === SERVICE_ORDER_STATUS.REVISION_REQUESTED && !isEmployer) {
    return { error: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند درخواست اصلاح کند' };
  }

  // State machine
  const allowed = VALID_SERVICE_ORDER_TRANSITIONS[order.status as keyof typeof VALID_SERVICE_ORDER_TRANSITIONS];
  if (!allowed || !allowed.includes(data.status)) {
    return { error: 'INVALID_TRANSITION', message: 'تغییر وضعیت نامعتبر است' };
  }

  const updateData: Record<string, unknown> = { status: data.status };
  if (data.status === SERVICE_ORDER_STATUS.ACCEPTED) updateData.acceptedAt = new Date();
  if (data.status === SERVICE_ORDER_STATUS.IN_PROGRESS) updateData.startedAt = new Date();
  if (data.status === SERVICE_ORDER_STATUS.COMPLETED) updateData.completedAt = new Date();
  if (data.status === SERVICE_ORDER_STATUS.CANCELLED) {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = data.cancelReason || null;
  }

  const updated = await db.serviceOrder.update({
    where: { id: orderId },
    data: updateData,
    include: {
      service: { select: { id: true, title: true, slug: true } },
    },
  });

  return { order: updated };
}
