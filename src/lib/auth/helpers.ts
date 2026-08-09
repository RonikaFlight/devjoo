import { cookies } from 'next/headers';
import { getSessionUser, TOKEN_NAME, type SessionPayload } from './session';
import { db } from '@/lib/db';
import { USER_ROLES } from '@/types/enums';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  isActive: boolean;
  roles: { role: { name: string; id: string } }[];
  profile: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
  } | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Get the current authenticated user from the request cookies.
 * Returns null if not authenticated.
 * Use this in Server Components and API routes.
 */
export async function getAuthUser(): Promise<{
  user: AuthUser;
  session: AuthSession;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  return getSessionUser(token);
}

/**
 * Require authentication — throws a 401 error if not logged in.
 */
export async function requireAuth(): Promise<{
  user: AuthUser;
  session: AuthSession;
}> {
  const auth = await getAuthUser();
  if (!auth) {
    throw new AuthError('UNAUTHORIZED', 'لطفاً وارد حساب کاربری خود شوید.');
  }
  return auth;
}

/**
 * Require a specific role.
 */
export async function requireRole(
  ...roles: string[]
): Promise<{
  user: AuthUser;
  session: AuthSession;
}> {
  const auth = await requireAuth();
  const userRoles = auth.user.roles.map((r) => r.role.name);
  const hasRole = roles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    throw new AuthError(
      'FORBIDDEN',
      'شما دسترسی لازم برای این عملیات را ندارید.'
    );
  }

  return auth;
}

/**
 * Check if user has a specific role.
 */
export function hasRole(user: AuthUser, role: string): boolean {
  return user.roles.some((r) => r.role.name === role);
}

/**
 * Check if user is a freelancer.
 */
export function isFreelancer(user: AuthUser): boolean {
  return hasRole(user, USER_ROLES.FREELANCER);
}

/**
 * Check if user is an employer.
 */
export function isEmployer(user: AuthUser): boolean {
  return hasRole(user, USER_ROLES.EMPLOYER);
}

/**
 * Check if user is an admin.
 */
export function isAdmin(user: AuthUser): boolean {
  return hasRole(user, USER_ROLES.ADMIN);
}

/**
 * Find or create a user by phone (used after OTP verification).
 */
export async function findOrCreateUserByPhone(phone: string) {
  let user = await db.user.findUnique({
    where: { phone },
    include: {
      roles: { include: { role: true } },
      profile: true,
    },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        phone,
        displayName: phone, // temporary, will be updated in onboarding
      },
      include: {
        roles: { include: { role: true } },
        profile: true,
      },
    });
  }

  return user;
}

/**
 * Assign a role to a user.
 */
export async function assignRole(
  userId: string,
  roleName: string
): Promise<void> {
  // Find or create the role
  let role = await db.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await db.role.create({ data: { name: roleName } });
  }

  // Check if user already has this role
  const existing = await db.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId: role.id },
    },
  });

  if (!existing) {
    await db.userRole.create({
      data: { userId, roleId: role.id },
    });
  }
}

/**
 * Check if user has completed onboarding (has at least one role and profile displayName).
 */
export function isOnboardingComplete(user: AuthUser): boolean {
  if (user.roles.length === 0) return false;
  if (!user.profile?.displayName) return false;
  return true;
}

/**
 * Custom error class for auth errors.
 */
export class AuthError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * API error response helper.
 */
export function authErrorResponse(error: AuthError) {
  return Response.json(
    {
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.statusCode }
  );
}
