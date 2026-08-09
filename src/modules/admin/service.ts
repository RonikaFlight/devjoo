import { db } from '@/lib/db';
import { USER_ROLES, PROJECT_STATUS, VERIFICATION_STATUS } from '@/types/enums';
import { auditLog } from './audit';
import { assignRole } from '@/lib/auth/helpers';
import type { AdminUserListInput, AdminUserUpdateInput, AdminProjectListInput, AdminProjectModerateInput, AdminVerificationListInput } from '@/lib/validators/admin';
import type { CategoryCreateInput, CategoryUpdateInput, SkillCreateInput, SkillUpdateInput, SkillSynonymInput } from '@/lib/validators/taxonomy';
import type { AdminBlogPostInput, AdminBlogCategoryInput, AdminRedirectInput } from '@/lib/validators/admin';

// ============ DASHBOARD STATS ============

export async function getAdminDashboardStats() {
  const [
    totalUsers,
    totalProjects,
    publishedProjects,
    pendingReviewProjects,
    pendingFreelancerVerifications,
    pendingEmployerVerifications,
    totalProposals,
    totalContracts,
    disputedContracts,
    totalServiceListings,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.project.count(),
    db.project.count({ where: { status: PROJECT_STATUS.PUBLISHED } }),
    db.project.count({ where: { status: PROJECT_STATUS.PENDING_REVIEW } }),
    db.freelancerVerification.count({ where: { status: VERIFICATION_STATUS.PENDING } }),
    db.employerVerification.count({ where: { status: VERIFICATION_STATUS.PENDING } }),
    db.proposal.count(),
    db.contract.count(),
    db.contract.count({ where: { status: 'DISPUTED' } }),
    db.serviceListing.count(),
  ]);

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSignups = await db.user.count({
    where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
  });

  return {
    users: { total: totalUsers, recentSignups },
    projects: { total: totalProjects, published: publishedProjects, pendingReview: pendingReviewProjects },
    verifications: { pending: pendingFreelancerVerifications + pendingEmployerVerifications },
    proposals: { total: totalProposals },
    contracts: { total: totalContracts, disputed: disputedContracts },
    serviceListings: { total: totalServiceListings },
  };
}

// ============ USER MANAGEMENT ============

export async function listAdminUsers(filters: AdminUserListInput) {
  const { page, limit, search, role, isActive, sortBy, sortOrder } = filters;

  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { displayName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (role) {
    where.roles = { some: { role: { name: role } } };
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const orderBy: Record<string, string> = { [sortBy]: sortOrder };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        roles: { include: { role: { select: { name: true } } } },
        profile: { select: { avatarUrl: true, city: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAdminUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, phone: true, displayName: true, isActive: true,
      createdAt: true, updatedAt: true,
      roles: { include: { role: { select: { name: true } } } },
      profile: { select: { avatarUrl: true, city: true, bio: true } },
      _count: {
        select: {
          postedProjects: true,
          sentProposals: true,
          contractsAsEmployer: true,
          contractsAsFreelancer: true,
          serviceListings: true,
        },
      },
    },
  });

  if (!user) return { error: 'NOT_FOUND', message: 'کاربر یافت نشد.' };
  return { user };
}

export async function updateAdminUser(actorId: string, userId: string, data: AdminUserUpdateInput) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'NOT_FOUND', message: 'کاربر یافت نشد.' };

  const updates: Record<string, unknown> = {};
  if (data.isActive !== undefined) {
    updates.isActive = data.isActive;
  }

  if (Object.keys(updates).length > 0) {
    await db.user.update({ where: { id: userId }, data: updates });
    const action = data.isActive === false ? 'USER_DEACTIVATE' : 'USER_ACTIVATE';
    await auditLog({ actorId, action, resourceType: 'USER', resourceId: userId, metadata: updates });
  }

  // Role management
  if (data.addRoles && data.addRoles.length > 0) {
    for (const role of data.addRoles) {
      await assignRole(userId, role);
    }
    await auditLog({ actorId, action: 'USER_ROLE_ADD', resourceType: 'USER', resourceId: userId, metadata: { roles: data.addRoles } });
  }

  if (data.removeRoles && data.removeRoles.length > 0) {
    for (const roleName of data.removeRoles) {
      const role = await db.role.findUnique({ where: { name: roleName } });
      if (role) {
        await db.userRole.deleteMany({ where: { userId, roleId: role.id } });
      }
    }
    await auditLog({ actorId, action: 'USER_ROLE_REMOVE', resourceType: 'USER', resourceId: userId, metadata: { roles: data.removeRoles } });
  }

  // Return updated user
  const updated = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, phone: true, displayName: true, isActive: true,
      createdAt: true, roles: { include: { role: { select: { name: true } } } },
    },
  });

  return { user: updated };
}

// ============ PROJECT MODERATION ============

export async function listAdminProjects(filters: AdminProjectListInput) {
  const { page, limit, status, categoryId, search, sortBy, sortOrder } = filters;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
  }

  const orderBy: Record<string, string> = { [sortBy]: sortOrder };

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, slug: true, status: true, isFeatured: true,
        budgetType: true, fixedPriceRial: true, budgetMinRial: true, budgetMaxRial: true,
        qualityScore: true, createdAt: true, publishedAt: true,
        category: { select: { name: true, slug: true } },
        employer: { select: { id: true, displayName: true } },
        _count: { select: { proposals: true } },
      },
    }),
    db.project.count({ where }),
  ]);

  return {
    projects,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function moderateProject(actorId: string, projectId: string, data: AdminProjectModerateInput) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'NOT_FOUND', message: 'پروژه یافت نشد.' };

  const updates: Record<string, unknown> = { status: data.status };
  if (data.status === PROJECT_STATUS.PUBLISHED && !project.publishedAt) {
    updates.publishedAt = new Date();
  }
  if (data.status === PROJECT_STATUS.REJECTED) {
    updates.rejectionReason = data.rejectionReason || null;
  }
  if (data.isFeatured !== undefined) {
    updates.isFeatured = data.isFeatured;
  }

  const updated = await db.project.update({
    where: { id: projectId },
    data: updates,
    select: { id: true, title: true, slug: true, status: true, isFeatured: true },
  });

  await auditLog({
    actorId, action: 'PROJECT_MODERATE', resourceType: 'PROJECT',
    resourceId: projectId, metadata: { ...data, previousStatus: project.status },
  });

  if (data.isFeatured !== undefined && data.isFeatured !== project.isFeatured) {
    await auditLog({
      actorId, action: 'PROJECT_FEATURE', resourceType: 'PROJECT',
      resourceId: projectId, metadata: { isFeatured: data.isFeatured },
    });
  }

  return { project: updated };
}

// ============ VERIFICATION MANAGEMENT ============

export async function listAdminVerifications(filters: AdminVerificationListInput) {
  const { page, limit, type, status, role } = filters;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const [freelancerV, employerV] = await Promise.all([
    role !== 'employer'
      ? db.freelancerVerification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        })
      : [],
    role !== 'freelancer'
      ? db.employerVerification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        })
      : [],
  ]);

  // Enrich with user info
  const profileIds = [
    ...freelancerV.map(v => v.profileId),
    ...employerV.map(v => v.profileId),
  ];
  const profiles = profileIds.length > 0
    ? await db.profile.findMany({
        where: { id: { in: profileIds } },
        select: { id: true, userId: true, user: { select: { displayName: true, phone: true, email: true } } },
      })
    : [];
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  // Combine and sort
  const all = [
    ...freelancerV.map((v) => ({ ...v, _role: 'freelancer' as const })),
    ...employerV.map((v) => ({ ...v, _role: 'employer' as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { verifications: all.slice(0, limit) };
}

export async function adminUpdateVerification(
  actorId: string,
  verificationId: string,
  role: 'freelancer' | 'employer',
  status: 'APPROVED' | 'REJECTED'
) {
  const model = role === 'freelancer' ? db.freelancerVerification : db.employerVerification;
  const verification = await (model as typeof db.freelancerVerification).findUnique({
    where: { id: verificationId },
  });

  if (!verification) return { error: 'NOT_FOUND', message: 'درخواست تاییدیه یافت نشد.' };
  if (verification.status !== VERIFICATION_STATUS.PENDING) {
    return { error: 'NOT_PENDING', message: 'فقط درخواست‌های در انتظار قابل تغییر هستند.' };
  }

  const updated = await (model as typeof db.freelancerVerification).update({
    where: { id: verificationId },
    data: {
      status,
      verifiedAt: status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
    },
  });

  const action = status === 'APPROVED' ? 'VERIFICATION_APPROVE' : 'VERIFICATION_REJECT';
  await auditLog({ actorId, action, resourceType: 'VERIFICATION', resourceId: verificationId, metadata: { role, status } });

  return { verification: updated };
}

// ============ CATEGORY MANAGEMENT ============

export async function listAdminCategories() {
  return db.category.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { skills: true, projects: true } }, parent: { select: { name: true } } },
  });
}

export async function createAdminCategory(actorId: string, data: CategoryCreateInput) {
  const category = await db.category.create({ data });
  await auditLog({ actorId, action: 'CATEGORY_CREATE', resourceType: 'CATEGORY', resourceId: category.id, metadata: { name: data.name, slug: data.slug } });
  return { category };
}

export async function updateAdminCategory(actorId: string, categoryId: string, data: CategoryUpdateInput) {
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'NOT_FOUND', message: 'دسته‌بندی یافت نشد.' };

  const updated = await db.category.update({ where: { id: categoryId }, data });
  await auditLog({ actorId, action: 'CATEGORY_UPDATE', resourceType: 'CATEGORY', resourceId: categoryId, metadata: data });
  return { category: updated };
}

export async function deleteAdminCategory(actorId: string, categoryId: string) {
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'NOT_FOUND', message: 'دسته‌بندی یافت نشد.' };

  // Check for dependent skills/projects
  const skillCount = await db.skill.count({ where: { categoryId } });
  if (skillCount > 0) {
    return { error: 'HAS_DEPENDENCIES', message: `این دسته‌بندی دارای ${skillCount} مهارت وابسته است.` };
  }

  await db.category.delete({ where: { id: categoryId } });
  await auditLog({ actorId, action: 'CATEGORY_DELETE', resourceType: 'CATEGORY', resourceId: categoryId, metadata: { name: category.name } });
  return { success: true };
}

// ============ SKILL MANAGEMENT ============

export async function listAdminSkills(categoryId?: string) {
  const where = categoryId ? { categoryId } : {};

  return db.skill.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { synonyms: true, userSkills: true } },
    },
  });
}

export async function createAdminSkill(actorId: string, data: SkillCreateInput) {
  const skill = await db.skill.create({ data });
  await auditLog({ actorId, action: 'SKILL_CREATE', resourceType: 'SKILL', resourceId: skill.id, metadata: { name: data.name, slug: data.slug } });
  return { skill };
}

export async function updateAdminSkill(actorId: string, skillId: string, data: SkillUpdateInput) {
  const skill = await db.skill.findUnique({ where: { id: skillId } });
  if (!skill) return { error: 'NOT_FOUND', message: 'مهارت یافت نشد.' };

  const updated = await db.skill.update({ where: { id: skillId }, data });
  await auditLog({ actorId, action: 'SKILL_UPDATE', resourceType: 'SKILL', resourceId: skillId, metadata: data });
  return { skill: updated };
}

export async function deleteAdminSkill(actorId: string, skillId: string) {
  const skill = await db.skill.findUnique({ where: { id: skillId } });
  if (!skill) return { error: 'NOT_FOUND', message: 'مهارت یافت نشد.' };

  await db.skillSynonym.deleteMany({ where: { skillId } });
  await db.projectSkill.deleteMany({ where: { skillId } });
  await db.skill.delete({ where: { id: skillId } });
  await auditLog({ actorId, action: 'SKILL_DELETE', resourceType: 'SKILL', resourceId: skillId, metadata: { name: skill.name } });
  return { success: true };
}

export async function createSkillSynonym(actorId: string, data: SkillSynonymInput) {
  const skill = await db.skill.findUnique({ where: { id: data.skillId } });
  if (!skill) return { error: 'NOT_FOUND', message: 'مهارت یافت نشد.' };

  const synonym = await db.skillSynonym.create({ data: { skillId: data.skillId, name: data.name, normalized: data.name.trim().toLowerCase() } });
  return { synonym };
}

export async function deleteSkillSynonym(synonymId: string) {
  await db.skillSynonym.delete({ where: { id: synonymId } });
  return { success: true };
}

export async function listSkillSynonyms(skillId: string) {
  return db.skillSynonym.findMany({ where: { skillId }, orderBy: { name: 'asc' } });
}

// ============ BLOG MANAGEMENT ============

export async function listAdminBlogPosts(page = 1, limit = 20) {
  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { name: true } } },
    }),
    db.blogPost.count(),
  ]);

  return { posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function createAdminBlogPost(actorId: string, data: AdminBlogPostInput) {
  const post = await db.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      body: data.body || null,
      coverUrl: data.coverUrl || null,
      categoryId: data.categoryId || null,
      isPublished: data.isPublished ?? false,
      publishedAt: data.isPublished ? new Date() : null,
    },
  });
  await auditLog({ actorId, action: 'BLOG_POST_CREATE', resourceType: 'BLOG_POST', resourceId: post.id, metadata: { title: data.title, slug: data.slug } });
  return { post };
}

export async function updateAdminBlogPost(actorId: string, postId: string, data: Partial<AdminBlogPostInput>) {
  const post = await db.blogPost.findUnique({ where: { id: postId } });
  if (!post) return { error: 'NOT_FOUND', message: 'پست بلاگ یافت نشد.' };

  const updateData: Record<string, unknown> = { ...data };
  if (data.isPublished && !post.isPublished) {
    updateData.publishedAt = new Date();
  } else if (data.isPublished === false && post.isPublished) {
    updateData.publishedAt = null;
  }

  const updated = await db.blogPost.update({ where: { id: postId }, data: updateData });
  await auditLog({ actorId, action: 'BLOG_POST_UPDATE', resourceType: 'BLOG_POST', resourceId: postId, metadata: data });
  return { post: updated };
}

export async function deleteAdminBlogPost(actorId: string, postId: string) {
  const post = await db.blogPost.findUnique({ where: { id: postId } });
  if (!post) return { error: 'NOT_FOUND', message: 'پست بلاگ یافت نشد.' };

  await db.blogPost.delete({ where: { id: postId } });
  await auditLog({ actorId, action: 'BLOG_POST_DELETE', resourceType: 'BLOG_POST', resourceId: postId, metadata: { title: post.title } });
  return { success: true };
}

// Blog Categories

export async function listAdminBlogCategories() {
  return db.blogCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  });
}

export async function createAdminBlogCategory(actorId: string, data: AdminBlogCategoryInput) {
  const category = await db.blogCategory.create({ data });
  await auditLog({ actorId, action: 'BLOG_CATEGORY_CREATE', resourceType: 'BLOG_CATEGORY', resourceId: category.id, metadata: data });
  return { category };
}

export async function updateAdminBlogCategory(actorId: string, categoryId: string, data: Partial<AdminBlogCategoryInput>) {
  const category = await db.blogCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'NOT_FOUND', message: 'دسته بلاگ یافت نشد.' };

  const updated = await db.blogCategory.update({ where: { id: categoryId }, data });
  await auditLog({ actorId, action: 'BLOG_CATEGORY_UPDATE', resourceType: 'BLOG_CATEGORY', resourceId: categoryId, metadata: data });
  return { category: updated };
}

export async function deleteAdminBlogCategory(actorId: string, categoryId: string) {
  const category = await db.blogCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'NOT_FOUND', message: 'دسته بلاگ یافت نشد.' };

  await db.blogCategory.delete({ where: { id: categoryId } });
  await auditLog({ actorId, action: 'BLOG_CATEGORY_DELETE', resourceType: 'BLOG_CATEGORY', resourceId: categoryId, metadata: { name: category.name } });
  return { success: true };
}

// ============ REDIRECT MANAGEMENT ============

export async function listAdminRedirects() {
  return db.redirect.findMany({ orderBy: { fromPath: 'asc' } });
}

export async function createAdminRedirect(actorId: string, data: AdminRedirectInput) {
  const redirect = await db.redirect.create({ data });
  await auditLog({ actorId, action: 'REDIRECT_CREATE', resourceType: 'REDIRECT', resourceId: redirect.id, metadata: data });
  return { redirect };
}

export async function updateAdminRedirect(actorId: string, redirectId: string, data: Partial<AdminRedirectInput>) {
  const redirect = await db.redirect.findUnique({ where: { id: redirectId } });
  if (!redirect) return { error: 'NOT_FOUND', message: 'تغییرمسیر یافت نشد.' };

  const updated = await db.redirect.update({ where: { id: redirectId }, data });
  await auditLog({ actorId, action: 'REDIRECT_UPDATE', resourceType: 'REDIRECT', resourceId: redirectId, metadata: data });
  return { redirect: updated };
}

export async function deleteAdminRedirect(actorId: string, redirectId: string) {
  await db.redirect.delete({ where: { id: redirectId } });
  await auditLog({ actorId, action: 'REDIRECT_DELETE', resourceType: 'REDIRECT', resourceId: redirectId });
  return { success: true };
}

// ============ FEATURE FLAGS ============

export function getFeatureFlags() {
  return {
    payments: Boolean(process.env.FEATURE_PAYMENTS_ENABLED),
    paidTrial: Boolean(process.env.FEATURE_PAID_TRIAL_ENABLED),
    aiProjectBuilder: Boolean(process.env.FEATURE_AI_PROJECT_BUILDER_ENABLED),
    aiProposalAssistant: Boolean(process.env.FEATURE_AI_PROPOSAL_ASSISTANT_ENABLED),
    teamMode: Boolean(process.env.FEATURE_TEAM_MODE_ENABLED),
    messaging: Boolean(process.env.FEATURE_MESSAGING_ENABLED),
    githubIntegration: Boolean(process.env.FEATURE_GITHUB_INTEGRATION_ENABLED),
    darkMode: true,
  };
}

// Feature flags are read from env at runtime — updating .env is a dev-only action.
// In production, use a config service or database-backed flags.
// This endpoint returns the current state and accepts updates for dev convenience.
export function getFeatureFlagInfo() {
  const flags = getFeatureFlags();
  return Object.entries(flags).map(([key, value]) => ({
    key,
    value,
    envKey: `FEATURE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}_ENABLED`,
    description: {
      payments: 'پرداخت‌ها',
      paidTrial: 'آزمایش پولی',
      aiProjectBuilder: 'ساخت پروژه با هوش مصنوعی',
      aiProposalAssistant: 'دستیار پیشنهاد هوش مصنوعی',
      teamMode: 'حالت تیمی',
      messaging: 'پیام‌رسانی',
      githubIntegration: 'یکپارچه‌سازی گیت‌هاب',
      darkMode: 'حالت تاریک',
    }[key] || key,
  }));
}

// ============ AUDIT LOG ============

export async function listAuditLogs(filters: {
  page: number;
  limit: number;
  actorId?: string;
  action?: string;
  resourceType?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.action) where.action = filters.action;
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.fromDate || filters.toDate) {
    where.createdAt = {} as Record<string, unknown>;
    if (filters.fromDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.fromDate);
    if (filters.toDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.toDate);
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: {
        id: true,
        actorId: true,
        action: true,
        resourceType: true,
        resourceId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    logs,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}
