import { db } from '@/lib/db';
import { TEAM_MEMBER_ROLE } from '@/types/enums';
import type { TeamCreateInput, TeamUpdateInput, AddTeamMemberInput, UpdateTeamMemberRoleInput, TeamQueryInput } from '@/lib/validators/team';
import { generateSlug, uniqueSlug } from '@/lib/utils/slug';

/**
 * Create a new team (freelancer only).
 */
export async function createTeam(leaderId: string, data: TeamCreateInput) {
  // Verify freelancer profile
  const profile = await db.profile.findUnique({
    where: { userId: leaderId },
    select: { freelancerProfile: { select: { id: true } } },
  });
  if (!profile?.freelancerProfile) {
    return { error: 'FORBIDDEN', message: 'فقط فریلنسرها می‌توانند تیم ایجاد کنند' };
  }

  // Check team count limit (max 5 teams per user)
  const teamCount = await db.team.count({ where: { leaderId } });
  if (teamCount >= 5) {
    return { error: 'LIMIT_EXCEEDED', message: 'شما حداکثر ۵ تیم می‌توانید داشته باشید' };
  }

  // Generate unique slug
  let slug = generateSlug(data.name);
  let existing = await db.team.findUnique({ where: { slug } });
  let attempts = 0;
  while (existing && attempts < 5) {
    slug = uniqueSlug(slug);
    existing = await db.team.findUnique({ where: { slug } });
    attempts++;
  }

  const team = await db.team.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      leaderId,
      members: {
        create: {
          userId: leaderId,
          role: TEAM_MEMBER_ROLE.LEADER,
        },
      },
    },
    include: {
      leader: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true } } } } } },
      members: {
        include: {
          user: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true, experienceLevel: true } } } } } },
        },
      },
    },
  });

  return { team };
}

/**
 * Get a team by ID or slug.
 */
export async function getTeam(identifier: string) {
  // Try by ID first, then by slug
  const team = await db.team.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier },
      ],
    },
    include: {
      leader: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true, experienceLevel: true, averageRating: true, totalCompletedProjects: true } } } } } },
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, city: true, freelancerProfile: { select: { headline: true, experienceLevel: true, averageRating: true } } } } } },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });
  if (!team) return { error: 'NOT_FOUND', message: 'تیم یافت نشد' };
  return { team };
}

/**
 * List teams with optional search.
 */
export async function listTeams(query: TeamQueryInput) {
  const where: Record<string, unknown> = { isActive: true };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  const [teams, total] = await Promise.all([
    db.team.findMany({
      where,
      include: {
        leader: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        _count: { select: { members: { where: { leftAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.team.count({ where }),
  ]);

  return { teams, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

/**
 * List my teams.
 */
export async function listMyTeams(userId: string) {
  // Teams where user is leader or active member
  const memberships = await db.teamMember.findMany({
    where: { userId, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map((m) => m.teamId);

  if (teamIds.length === 0) return { teams: [] };

  const teams = await db.team.findMany({
    where: { id: { in: teamIds } },
    include: {
      leader: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { teams };
}

/**
 * Update a team (leader only).
 */
export async function updateTeam(teamId: string, userId: string, data: TeamUpdateInput) {
  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: 'NOT_FOUND', message: 'تیم یافت نشد' };
  if (team.leaderId !== userId) return { error: 'FORBIDDEN', message: 'فقط رهبر تیم می‌تواند ویرایش کند' };

  const updated = await db.team.update({
    where: { id: teamId },
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });

  return { team: updated };
}

/**
 * Add a member to a team (leader only).
 */
export async function addTeamMember(teamId: string, leaderId: string, data: AddTeamMemberInput) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { members: { where: { leftAt: null } } },
  });
  if (!team) return { error: 'NOT_FOUND', message: 'تیم یافت نشد' };
  if (team.leaderId !== leaderId) return { error: 'FORBIDDEN', message: 'فقط رهبر تیم می‌تواند عضو اضافه کند' };

  // Check member limit (max 20)
  const activeMembers = team.members.length;
  if (activeMembers >= 20) {
    return { error: 'LIMIT_EXCEEDED', message: 'تیم حداکثر ۲۰ عضو می‌تواند داشته باشد' };
  }

  // Verify target user is a freelancer
  const targetProfile = await db.profile.findUnique({
    where: { userId: data.userId },
    select: { freelancerProfile: { select: { id: true } } },
  });
  if (!targetProfile?.freelancerProfile) {
    return { error: 'FORBIDDEN', message: 'کاربر مورد نظر فریلنسر نیست' };
  }

  // Check if already a member
  const existing = await db.teamMember.findFirst({
    where: { teamId, userId: data.userId, leftAt: null },
  });
  if (existing) return { error: 'CONFLICT', message: 'این کاربر قبلا عضو تیم است' };

  const member = await db.teamMember.create({
    data: {
      teamId,
      userId: data.userId,
      role: data.role,
    },
    include: {
      user: { select: { id: true, displayName: true, profile: { select: { avatarUrl: true, freelancerProfile: { select: { headline: true, experienceLevel: true } } } } } },
    },
  });

  return { member };
}

/**
 * Remove a member from a team.
 */
export async function removeTeamMember(teamId: string, memberId: string, userId: string) {
  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: 'NOT_FOUND', message: 'تیم یافت نشد' };
  if (team.leaderId !== userId) return { error: 'FORBIDDEN', message: 'فقط رهبر تیم می‌تواند عضو حذف کند' };

  const member = await db.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.teamId !== teamId) return { error: 'NOT_FOUND', message: 'عضو یافت نشد' };
  if (member.role === TEAM_MEMBER_ROLE.LEADER) {
    return { error: 'FORBIDDEN', message: 'رهبر تیم نمی‌تواند حذف شود' };
  }

  const updated = await db.teamMember.update({
    where: { id: memberId },
    data: { leftAt: new Date() },
  });

  return { member: updated };
}

/**
 * Update a team member's role (leader only).
 */
export async function updateTeamMemberRole(teamId: string, memberId: string, userId: string, data: UpdateTeamMemberRoleInput) {
  const team = await db.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: 'NOT_FOUND', message: 'تیم یافت نشد' };
  if (team.leaderId !== userId) return { error: 'FORBIDDEN', message: 'فقط رهبر تیم می‌تواند نقش را تغییر دهد' };

  const member = await db.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.teamId !== teamId) return { error: 'NOT_FOUND', message: 'عضو یافت نشد' };

  const updated = await db.teamMember.update({
    where: { id: memberId },
    data: { role: data.role },
  });

  return { member: updated };
}