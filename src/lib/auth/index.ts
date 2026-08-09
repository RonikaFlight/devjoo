export { hashPassword, verifyPassword } from './password';
export {
  createSession,
  verifyToken,
  getSessionUser,
  destroySession,
  destroyAllUserSessions,
  rotateSession,
  getSessionCookieOptions,
  TOKEN_NAME,
  type SessionPayload,
} from './session';
export {
  requestOtp,
  verifyOtp,
  cleanupExpiredOtps,
  type OtpRequestResult,
  type OtpVerifyResult,
} from './otp';
export {
  getAuthUser,
  requireAuth,
  requireRole,
  hasRole,
  isFreelancer,
  isEmployer,
  isAdmin,
  findOrCreateUserByPhone,
  assignRole,
  isOnboardingComplete,
  AuthError,
  authErrorResponse,
  type AuthUser,
  type AuthSession,
} from './helpers';
