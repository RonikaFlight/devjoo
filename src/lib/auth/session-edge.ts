/**
 * Edge-safe session utilities.
 * Only uses jose (no Prisma, no Node.js-only APIs).
 * Used by middleware for lightweight token verification.
 */
import { SignJWT, jwtVerify } from 'jose';

export const TOKEN_NAME = 'devjoo.session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  sessionId: string;
}

/**
 * Verify a JWT session token and return its payload.
 * Edge-safe: no database access, only cryptographic verification.
 */
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a JWT session token.
 * Edge-safe: only creates the JWT, does NOT store in DB.
 * Use createSession() from session.ts for the full flow (JWT + DB).
 */
export async function createToken(
  userId: string,
  sessionId: string
): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export { MAX_AGE };