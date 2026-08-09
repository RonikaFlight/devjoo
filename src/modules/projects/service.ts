import { db } from '@/lib/db';
import { VALID_PROJECT_TRANSITIONS, PROJECT_STATUS } from '@/types/enums';
import { generateSlug, uniqueSlug } from '@/lib/utils/slug';
import type { ProjectCreateInput, ProjectUpdateInput, ProjectFiltersInput } from '@/lib/validators/project';
import { computeProjectQualityScore } from '@/modules/matching/quality';
import { dispatchProjectPublished, dispatchProjectStatusChanged } from '@/modules/notifications/dispatcher';

/**
 * Create a new project.
 */
export async function createProject(employerId: string, data: ProjectCreateInput) {
  // Generate unique slug
  let slug = generateSlug(data.title);
  let existing = await db.project.findUnique({ where: { slug } });
  let attempts = 0;
  while (existing && attempts < 5) {
    slug = uniqueSlug(slug);
    existing = await db.project.findUnique({ where: { slug } });
    attempts++;
  }

  // Create project with skills
  const project = await db.project.create({
    data: {
      employerId,
      title: data.title,
      slug,
      description: data.description,
      categoryId: data.categoryId,
      budgetType: data.budgetType,
      budgetMinRial: data.budgetMinRial,
      budgetMaxRial: data.budgetMaxRial,
      fixedPriceRial: data.fixedPriceRial,
      estimatedDuration: data.estimatedDuration,
      experienceLevel: data.experienceLevel,
      workType: data.workType,
      city: data.city,
      deadline: data.deadline ? new Date(data.deadline) : null,
      proposalLimit: data.proposalLimit,
      status: PROJECT_STATUS.DRAFT,
      skills: {
        create: data.skills.map((skillId) => ({ skillId })),
      },
    },
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
      employer: {
        select: {
          id: true,
          displayName: true,
          profile: {
            select: { avatarUrl: true, city: true },
          },
        },
      },
    },
  });

  return project;
}

/**
 * Get a list of published projects with filters.
 */
export async function listProjects(filters: ProjectFiltersInput) {
  const { categoryId, skills, budgetType, experienceLevel, workType, minBudget, maxBudget, city, sort, page, limit, search } = filters;

  // Build where clause
  const where: Record<string, unknown> = { status: PROJECT_STATUS.PUBLISHED };

  if (categoryId) where.categoryId = categoryId;
  if (budgetType) where.budgetType = budgetType;
  if (experienceLevel) where.experienceLevel = experienceLevel;
  if (workType) where.workType = workType;
  if (city) where.city = city;

  if (skills && skills.length > 0) {
    where.skills = { some: { skillId: { in: skills } } };
  }

  if (minBudget || maxBudget) {
    where.OR = [];
    if (minBudget && !maxBudget) {
      where.OR.push(
        { fixedPriceRial: { gte: minBudget } },
        { budgetMinRial: { gte: minBudget } }
      );
    } else if (maxBudget && !minBudget) {
      where.OR.push(
        { fixedPriceRial: { lte: maxBudget } },
        { budgetMaxRial: { lte: maxBudget } }
      );
    } else {
      where.OR.push(
        { fixedPriceRial: { gte: minBudget, lte: maxBudget } },
        { budgetMinRial: { gte: minBudget }, budgetMaxRial: { lte: maxBudget } }
      );
    }
  }

  if (search) {
    where.OR = Array.isArray(where.OR) ? where.OR : [];
    where.OR.push(
      { title: { contains: search } },
      { description: { contains: search } }
    );
  }

  // Build order by
  let orderBy: Record<string, string> = { publishedAt: 'desc' };
  if (sort === 'oldest') orderBy = { publishedAt: 'asc' };
  else if (sort === 'budget_low') orderBy = { fixedPriceRial: 'asc' };
  else if (sort === 'budget_high') orderBy = { fixedPriceRial: 'desc' };
  else if (sort === 'most_proposals') orderBy = { currentProposalCount: 'desc' };

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        skills: { include: { skill: { select: { name: true, slug: true } } } },
        employer: {
          select: {
            id: true,
            displayName: true,
            profile: { select: { avatarUrl: true, city: true } },
          },
        },
      },
    }),
    db.project.count({ where }),
  ]);

  return {
    projects,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single project by slug (public).
 */
export async function getProjectBySlug(slug: string, userId?: string) {
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
      employer: {
        select: {
          id: true,
          displayName: true,
          profile: {
            select: { avatarUrl: true, city: true, bio: true },
          },
        },
      },
      statusEvents: {
        orderBy: { createdAt: 'asc' },
        take: 20,
      },
      ...(userId
        ? {
            savedBy: {
              where: { userId },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
  });

  if (!project) return null;

  return {
    ...project,
    isSaved: project.savedBy ? project.savedBy.length > 0 : false,
  };
}

/**
 * Transition project status.
 */
export async function transitionProjectStatus(
  projectId: string,
  actorId: string,
  newStatus: string
) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };

  const currentStatus = project.status as keyof typeof VALID_PROJECT_TRANSITIONS;
  const allowed = VALID_PROJECT_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return { error: 'INVALID_TRANSITION', message: `تغییر وضعیت از ${currentStatus} به ${newStatus} مجاز نیست.` };
  }

  const updated = await db.$transaction(async (tx) => {
    await tx.projectStatusEvent.create({
      data: { projectId, status: newStatus, actorId },
    });

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'PUBLISHED') {
      data.publishedAt = new Date();

      // Compute quality score on publish
      const projectWithSkills = await tx.project.findUnique({
        where: { id: projectId },
        include: { skills: { select: { skillId: true } } },
      });
      if (projectWithSkills) {
        data.qualityScore = computeProjectQualityScore(projectWithSkills);
      }
    }

    return tx.project.update({
      where: { id: projectId },
      data,
    });
  });

  // Dispatch notifications after successful transition
  if (newStatus === 'PUBLISHED') {
    dispatchProjectPublished(projectId).catch(() => {
      // Non-blocking: notification dispatch failure should not break publish
    });
  } else if (['IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED', 'EXPIRED'].includes(newStatus)) {
    dispatchProjectStatusChanged(projectId, newStatus).catch(() => {});
  }

  return { project: updated };
}

/**
 * Update a project (employer, draft only).
 */
export async function updateProject(projectId: string, employerId: string, data: ProjectUpdateInput) {
  const project = await db.project.findFirst({
    where: { id: projectId, employerId },
  });

  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };
  if (project.status !== 'DRAFT' && project.status !== 'REJECTED') {
    return { error: 'FORBIDDEN', message: 'فقط پروژه‌های پیش‌نویس قابل ویرایش هستند.' };
  }

  const updated = await db.project.update({
    where: { id: projectId },
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      budgetType: data.budgetType,
      budgetMinRial: data.budgetMinRial,
      budgetMaxRial: data.budgetMaxRial,
      fixedPriceRial: data.fixedPriceRial,
      estimatedDuration: data.estimatedDuration,
      experienceLevel: data.experienceLevel,
      workType: data.workType,
      city: data.city,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      proposalLimit: data.proposalLimit,
    },
    include: {
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
    },
  });

  // Update skills if provided
  if (data.skills) {
    await db.projectSkill.deleteMany({ where: { projectId } });
    await db.projectSkill.createMany({
      data: data.skills.map((skillId) => ({ projectId, skillId })),
    });
  }

  return { project: updated };
}

/**
 * Save/unsave (bookmark) a project.
 */
export async function toggleSaveProject(userId: string, projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };

  const existing = await db.savedProject.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existing) {
    await db.savedProject.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await db.savedProject.create({ data: { userId, projectId } });
    return { saved: true };
  }
}

/**
 * Get projects saved by a user.
 */
export async function getSavedProjects(userId: string, page = 1, limit = 20) {
  const [saved, total] = await Promise.all([
    db.savedProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: {
          include: {
            category: { select: { name: true, slug: true } },
            skills: { include: { skill: { select: { name: true, slug: true } } } },
            employer: {
              select: {
                id: true,
                displayName: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
      },
    }),
    db.savedProject.count({ where: { userId } }),
  ]);

  return {
    projects: saved.map((s) => s.project),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
