import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../logger';

describe('createLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a logger with methods', () => {
    const log = createLogger();
    expect(log.debug).toBeDefined();
    expect(log.info).toBeDefined();
    expect(log.warn).toBeDefined();
    expect(log.error).toBeDefined();
    expect(log.fatal).toBeDefined();
    expect(log.child).toBeDefined();
  });

  it('outputs JSON-formatted log entries', () => {
    const log = createLogger();
    log.info('test message');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"')
    );
  });

  it('includes message in output', () => {
    const log = createLogger();
    log.info('hello world');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('hello world')
    );
  });

  it('binds context to child logger', () => {
    const log = createLogger({ requestId: 'abc-123' });
    log.info('test');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('abc-123')
    );
  });

  it('child logger inherits parent context', () => {
    const parent = createLogger({ requestId: 'parent-1' });
    const child = parent.child({ userId: 'user-1' });
    child.info('test');
    const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call).toContain('parent-1');
    expect(call).toContain('user-1');
  });

  it('includes extra data', () => {
    const log = createLogger();
    log.info('test', { key: 'value', num: 42 });
    const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call).toContain('"key":"value"');
    expect(call).toContain('"num":42');
  });

  it('error method includes error details', () => {
    const log = createLogger();
    log.error('something failed', new Error('boom'));
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('boom')
    );
  });
});
