import { describe, it, expect } from 'vitest';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '../rate-limiter';

describe('checkRateLimit', () => {
  it('allows requests under limit', () => {
    const result = checkRateLimit('test-user', { maxRequests: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('rejects requests over limit', () => {
    checkRateLimit('test-user-2', { maxRequests: 1, windowSeconds: 60 });
    const result = checkRateLimit('test-user-2', { maxRequests: 1, windowSeconds: 60 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('provides correct remaining count', () => {
    const config = { maxRequests: 5, windowSeconds: 60 };
    expect(checkRateLimit('test-user-3', config).remaining).toBe(4);
    expect(checkRateLimit('test-user-3', config).remaining).toBe(3);
    expect(checkRateLimit('test-user-3', config).remaining).toBe(2);
  });

  it('provides reset time', () => {
    const result = checkRateLimit('test-user-4', { maxRequests: 10, windowSeconds: 60 });
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.limit).toBe(10);
  });

  it('isolates different identifiers', () => {
    const config = { maxRequests: 1, windowSeconds: 60 };
    expect(checkRateLimit('user-a', config).success).toBe(true);
    expect(checkRateLimit('user-b', config).success).toBe(true);
  });
});

describe('RATE_LIMITS presets', () => {
  it('has auth preset', () => {
    expect(RATE_LIMITS.auth.maxRequests).toBe(10);
    expect(RATE_LIMITS.auth.windowSeconds).toBe(60);
  });

  it('has otp preset', () => {
    expect(RATE_LIMITS.otp.maxRequests).toBe(2);
  });

  it('has ai preset', () => {
    expect(RATE_LIMITS.ai.maxRequests).toBe(10);
  });

  it('has passwordChange preset', () => {
    expect(RATE_LIMITS.passwordChange.maxRequests).toBe(3);
    expect(RATE_LIMITS.passwordChange.windowSeconds).toBe(3600);
  });
});

describe('getClientIp', () => {
  it('extracts from x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('returns 127.0.0.1 as default', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('127.0.0.1');
  });
});
