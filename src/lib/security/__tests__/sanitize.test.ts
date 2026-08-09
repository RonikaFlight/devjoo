import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  escapeHtml,
  sanitizeForUrl,
  stripControlChars,
  sanitizeForLogging,
  truncate,
} from '../sanitize';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('removes script tags', () => {
    expect(stripHtml('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('handles nested tags', () => {
    expect(stripHtml('<div><b>bold</b> text</div>')).toBe('bold text');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('handles string without HTML', () => {
    expect(stripHtml('plain text')).toBe('plain text');
  });
});

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });
});

describe('sanitizeForUrl', () => {
  it('removes angle brackets and keeps inner text', () => {
    expect(sanitizeForUrl('test<script>')).toBe('testscript');
  });

  it('removes quotes', () => {
    expect(sanitizeForUrl('test"value')).toBe('testvalue');
  });

  it('removes control characters', () => {
    expect(sanitizeForUrl('test\x00value')).toBe('testvalue');
  });

  it('trims whitespace', () => {
    expect(sanitizeForUrl('  hello  ')).toBe('hello');
  });
});

describe('stripControlChars', () => {
  it('removes null bytes', () => {
    expect(stripControlChars('hello\x00world')).toBe('helloworld');
  });

  it('preserves normal characters', () => {
    expect(stripControlChars('سلام دنیا')).toBe('سلام دنیا');
  });

  it('preserves tab and newline (\x09, \x0A)', () => {
    expect(stripControlChars('hello\tworld\n')).toBe('hello\tworld\n');
  });
});

describe('sanitizeForLogging', () => {
  it('redacts password fields', () => {
    const input = { user: 'test', password: 'secret123' };
    const result = sanitizeForLogging(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.user).toBe('test');
  });

  it('redacts token fields', () => {
    const input = { accessToken: 'abc123', name: 'test' };
    const result = sanitizeForLogging(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('redacts nested sensitive fields', () => {
    const input = { user: { name: 'test', phone_number: '09123456789' } };
    const result = sanitizeForLogging(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    expect(user.phone_number).toBe('[REDACTED]');
    expect(user.name).toBe('test');
  });

  it('redacts in arrays', () => {
    const input = [{ password: 'secret' }, { name: 'public' }];
    const result = sanitizeForLogging(input) as Record<string, unknown>[];
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('public');
  });

  it('handles primitive values', () => {
    expect(sanitizeForLogging('hello')).toBe('hello');
    expect(sanitizeForLogging(42)).toBe(42);
    expect(sanitizeForLogging(null)).toBe(null);
    expect(sanitizeForLogging(true)).toBe(true);
  });

  it('limits recursion depth', () => {
    const deep: Record<string, unknown> = { a: 1 };
    let current = deep;
    for (let i = 0; i < 10; i++) {
      current.nested = {};
      current = current.nested as Record<string, unknown>;
    }
    const result = sanitizeForLogging(deep, 3);
    expect(JSON.stringify(result)).toContain('[REDACTED]');
  });
});

describe('truncate', () => {
  it('returns original if under max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates to max length', () => {
    expect(truncate('hello world', 5)).toBe('hello');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});
