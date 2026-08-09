import { describe, it, expect } from 'vitest';
import { generateRequestId, getOrCreateRequestId } from '../request-id';

describe('generateRequestId', () => {
  it('generates a 25-char ID', () => {
    const id = generateRequestId();
    expect(id).toHaveLength(25);
  });

  it('contains an underscore separator', () => {
    const id = generateRequestId();
    expect(id).toContain('_');
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe('getOrCreateRequestId', () => {
  it('uses existing x-request-id header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-request-id': 'my-custom-id-123' },
    });
    expect(getOrCreateRequestId(req)).toBe('my-custom-id-123');
  });

  it('generates new ID if header missing', () => {
    const req = new Request('http://localhost');
    const id = getOrCreateRequestId(req);
    expect(id).toBeTruthy();
    expect(id.length).toBeGreaterThanOrEqual(8);
  });

  it('ignores too-short header values', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-request-id': 'ab' },
    });
    const id = getOrCreateRequestId(req);
    expect(id).not.toBe('ab');
  });

  it('ignores too-long header values', () => {
    const longId = 'a'.repeat(100);
    const req = new Request('http://localhost', {
      headers: { 'x-request-id': longId },
    });
    const id = getOrCreateRequestId(req);
    expect(id).not.toBe(longId);
  });
});
