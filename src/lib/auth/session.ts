import { db } from '@/lib/db';
import { verifyToken, createToken, TOKEN_NAME, MAX_AGE, type SessionPayload } from './session-edge';

export { TOKEN_NAME, MAX_AGE, verifyToken, type SessionPayload };

/**
 * Create a JWT session token AND store the session in the database.
 * Returns the token string to set as HttpOnly cookie.
 * Node.js runtime only (uses Prisma).
 */
export async function createSession(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<{ token: string; sessionId: string }> {
  const sessionId = crypto.randomUUID();

  // Create DB session
  await db.session.create({
    data: {
      id: sessionId,
      userId,
      token: sessionId,
      expiresAt: new Date(Date.now() + MAX_AGE * 1000),
      ip,
      userAgent,
    },
  });

  // Create JWT
  const token = await createToken(userId, sessionId);

  return { token, sessionId };
}

/**
 * Get the currently authenticated user from a session token.
 * Validates both JWT signature and DB session existence.
 * Node.js runtime only (uses Prisma).
 */
export async function getSessionUser(token: string | null) {
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Check DB session is valid and not expired
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          displayName: true,
          isActive: true,
          roles: {
            include: { role: true },
          },
          profile: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              city: true,
            },
          },
        },
      },
    },
  });

  if (
    !session ||
    !session.user.isActive ||
    session.expiresAt < new Date()
  ) {
    return null;
  }

  return {
    user: session.user,
    session: session,
  };
}

/**
 * Delete a session (logout).
 */
export async function destroySession(sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } });
}

/**
 * Delete all sessions for a user (logout everywhere).
 */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

/**
 * Rotate a session: delete old, create new.
 */
export async function rotateSession(
  oldSessionId: string,
  ip?: string,
  userAgent?: string
): Promise<{ token: string; sessionId: string } | null> {
  const oldSession = await db.session.findUnique({
    where: { id: oldSessionId },
  });
  if (!oldSession) return null;

  const userId = oldSession.userId;
  await destroySession(oldSessionId);
  return createSession(userId, ip, userAgent);
}

/**
 * Get the cookie options for the session token.
 */
export function getSessionCookieOptions(): {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: TOKEN_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  };
}
