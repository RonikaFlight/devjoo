import { describe, it, expect } from 'vitest';
import { getSecurityHeaders, getCorsHeaders } from '../headers';

describe('getSecurityHeaders', () => {
  it('includes X-Frame-Options: DENY', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  it('includes X-Content-Type-Options: nosniff', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('includes Referrer-Policy', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('includes Permissions-Policy disabling unused features', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).toContain('microphone=()');
  });

  it('includes HSTS in production', () => {
    const headers = getSecurityHeaders({ isProduction: true });
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    expect(headers['Strict-Transport-Security']).toContain('includeSubDomains');
  });

  it('excludes HSTS in development', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['Strict-Transport-Security']).toBeUndefined();
  });

  it('includes CSP frame-ancestors', () => {
    const headers = getSecurityHeaders({ isProduction: false });
    expect(headers['Content-Security-Policy']).toBe("frame-ancestors 'self'");
  });

  it('includes devjoo.ir in production CSP frame-ancestors', () => {
    const headers = getSecurityHeaders({ isProduction: true });
    expect(headers['Content-Security-Policy']).toContain("'self' https://devjoo.ir");
  });
});

describe('getCorsHeaders', () => {
  it('allows localhost in development', () => {
    const headers = getCorsHeaders('http://localhost:3000', false);
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('allows methods', () => {
    const headers = getCorsHeaders('http://localhost:3000', false);
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
    expect(headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(headers['Access-Control-Allow-Methods']).toContain('DELETE');
  });

  it('returns empty in production for unknown origin', () => {
    const headers = getCorsHeaders('https://evil.com', true);
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('allows devjoo.ir in production', () => {
    const headers = getCorsHeaders('https://devjoo.ir', true);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://devjoo.ir');
  });

  it('allows www.devjoo.ir in production', () => {
    const headers = getCorsHeaders('https://www.devjoo.ir', true);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://www.devjoo.ir');
  });
});
