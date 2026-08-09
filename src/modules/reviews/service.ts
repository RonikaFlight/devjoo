import { db } from '@/lib/db';
import { PROJECT_STATUS } from '@/types/enums';
import type { ReviewCreateInput, ReviewFiltersInput } from '@/lib/validators/review';

/**
 * Submit a review for a completed project.
 * Only the employer can review the freelancer, and vice versa.
 */
export async function createReview(
  reviewerId: string,
  data: ReviewCreateInput
) {
  const project = await db.project.findUnique({
    where: { id: data.projectId },
    select: {
      id: true,
      employerId: true,
      status: true,
    },
  });

  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  if (project.status !== PROJECT_STATUS.COMPLETED) {
    return { error: 'PROJECT_NOT_COMPLETED', message: 'فقط پروژه‌های تکمیل‌شده قابل بررسی هستند.' };
  }
  if (project.employerId === reviewerId) {
    // Employer reviews freelancer — need the accepted proposal
    const acceptedProposal = await db.proposal.findFirst({
      where: {
        projectId: project.id,
        status: 'ACCEPTED',
      },
      select: { freelancerId: true },
    });
    if (!acceptedProposal) {
      return { error: 'NO_FREELANCER', message: 'هیچ فریلنسر پذیرفته‌شده‌ای برای این پروژه وجود ندارد.' };
    }
    // Check if already reviewed
    const existingReview = await db.review.findUnique({
      where: {
        projectId_reviewerId: {
          projectId: project.id,
          reviewerId,
        },
      },
    });
    if (existingReview) {
      return { error: 'ALREADY_REVIEWED', message: 'شما قبلاً برای این پروژه نظر ثبت کرده‌اید.' };
    }

    const review = await db.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          projectId: project.id,
          reviewerId,
          revieweeId: acceptedProposal.freelancerId,
          rating: data.rating,
          quality: data.quality,
          communication: data.communication,
          deadline: data.deadline,
          professionalism: data.professionalism,
          comment: data.comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              displayName: true,
              profile: { select: { avatarUrl: true } },
            },
          },
          project: { select: { id: true, title: true, slug: true } },
        },
      });

      // Update freelancer profile average rating
      const reviews = await tx.review.findMany({
        where: { revieweeId: acceptedProposal.freelancerId, isHidden: false },
        select: { rating: true },
      });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const profile = await tx.profile.findUnique({
        where: { userId: acceptedProposal.freelancerId },
        select: { freelancerProfile: { select: { id: true } } },
      });
      if (profile?.freelancerProfile) {
        await tx.freelancerProfile.update({
          where: { id: profile.freelancerProfile.id },
          data: { averageRating: Math.round(avgRating * 100) / 100 },
        });
      }

      return created;
    });

    return { review };
  } else {
    // Freelancer reviews employer
    const freelancerProposal = await db.proposal.findFirst({
      where: {
        projectId: project.id,
        freelancerId: reviewerId,
        status: 'ACCEPTED',
      },
      select: { id: true },
    });
    if (!freelancerProposal) {
      return { error: 'NOT_PARTICIPANT', message: 'شما فریلنسر پذیرفته‌شده این پروژه نیستید.' };
    }

    const existingReview = await db.review.findUnique({
      where: {
        projectId_reviewerId: {
          projectId: project.id,
          reviewerId,
        },
      },
    });
    if (existingReview) {
      return { error: 'ALREADY_REVIEWED', message: 'شما قبلاً برای این پروژه نظر ثبت کرده‌اید.' };
    }

    const review = await db.review.create({
      data: {
        projectId: project.id,
        reviewerId,
        revieweeId: project.employerId,
        rating: data.rating,
        quality: data.quality,
        communication: data.communication,
        deadline: data.deadline,
        professionalism: data.professionalism,
        comment: data.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            displayName: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        project: { select: { id: true, title: true, slug: true } },
      },
    });

    return { review };
  }
}

/**
 * List reviews received by a user (profile).
 */
export async function listReceivedReviews(
  profileId: string,
  filters: ReviewFiltersInput
) {
  const where = {
    revieweeId: profileId,
    isHidden: false,
  };

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        reviewer: {
          select: {
            id: true,
            displayName: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        project: { select: { id: true, title: true, slug: true } },
      },
    }),
    db.review.count({ where }),
  ]);

  return {
    reviews,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

/**
 * Get review statistics for a profile.
 */
export async function getReviewStats(profileId: string) {
  const reviews = await db.review.findMany({
    where: { revieweeId: profileId, isHidden: false },
    select: { rating: true, quality: true, communication: true, deadline: true, professionalism: true },
  });

  if (reviews.length === 0) {
    return {
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: { quality: 0, communication: 0, deadline: 0, professionalism: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  }

  const avg = (field: 'quality' | 'communication' | 'deadline' | 'professionalism') => {
    const vals = reviews.map((r) => r[field]).filter((v): v is number => v !== null);
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
  };

  return {
    totalCount: reviews.length,
    averageRating: Math.round((totalRating / reviews.length) * 100) / 100,
    ratingDistribution: distribution,
    categoryAverages: {
      quality: avg('quality'),
      communication: avg('communication'),
      deadline: avg('deadline'),
      professionalism: avg('professionalism'),
    },
  };
}
