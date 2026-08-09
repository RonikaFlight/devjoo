import { describe, it, expect } from 'vitest';
import { normalizePersian, generateSlug, truncate } from '../persian-normalize';

describe('normalizePersian', () => {
  it('converts Arabic yeh to Persian yeh', () => {
    expect(normalizePersian('ي')).toBe('ی');
  });

  it('converts Arabic keheh to Persian keheh', () => {
    expect(normalizePersian('ك')).toBe('ک');
  });

  it('normalizes spaces', () => {
    expect(normalizePersian('hello   world')).toBe('hello world');
  });

  it('converts Persian digits to English', () => {
    expect(normalizePersian('۱۲۳')).toBe('123');
  });

  it('lowercases English text', () => {
    expect(normalizePersian('React')).toBe('react');
  });

  it('trims whitespace', () => {
    expect(normalizePersian('  hello  ')).toBe('hello');
  });
});

describe('generateSlug', () => {
  it('creates slug from Persian text', () => {
    const slug = generateSlug('طراحی وب سایت');
    expect(slug).toBe('طراحی-وب-سایت');
  });

  it('creates slug from English text', () => {
    const slug = generateSlug('React Developer');
    expect(slug).toBe('react-developer');
  });

  it('removes consecutive hyphens', () => {
    const slug = generateSlug('hello  world');
    expect(slug).not.toContain('--');
  });
});

describe('truncate (persian-normalize)', () => {
  it('returns original if under max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('trims before ellipsis', () => {
    expect(truncate('hello world   ', 8)).toBe('hello wo...');
  });
});
