/**
 * Structured logger utility.
 * Provides consistent, request-correlated logging with log levels.
 * ADR-022: Structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

/**
 * Minimum log level based on environment.
 */
function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL;
  if (env === 'debug') return 'debug';
  if (env === 'warn') return 'warn';
  if (process.env.NODE_ENV === 'production') return 'info';
  return 'debug'; // dev: log everything
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const minLevel = getMinLevel();

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Core logging function.
 */
function log(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  const formatted = formatEntry(entry);

  switch (entry.level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
    case 'fatal':
      console.error(formatted);
      break;
  }
}

/**
 * Logger interface with contextual binding.
 */
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: unknown, data?: Record<string, unknown>): void;
  fatal(message: string, error?: unknown, data?: Record<string, unknown>): void;

  /** Create a child logger with bound context (e.g., requestId) */
  child(context: Partial<LogContext>): Logger;
}

export interface LogContext {
  requestId: string;
  userId: string;
  path: string;
  method: string;
}

/**
 * Create a logger with optional bound context.
 */
export function createLogger(context?: Partial<LogContext>): Logger {
  const ctx: Partial<LogContext> = { ...context };

  const logger: Logger = {
    debug(message: string, data?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        requestId: ctx.requestId,
        userId: ctx.userId,
        path: ctx.path,
        method: ctx.method,
        ...data,
      });
    },

    info(message: string, data?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        requestId: ctx.requestId,
        userId: ctx.userId,
        path: ctx.path,
        method: ctx.method,
        ...data,
      });
    },

    warn(message: string, data?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        requestId: ctx.requestId,
        userId: ctx.userId,
        path: ctx.path,
        method: ctx.method,
        ...data,
      });
    },

    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        requestId: ctx.requestId,
        userId: ctx.userId,
        path: ctx.path,
        method: ctx.method,
        ...data,
      };

      if (error instanceof Error) {
        entry.errorMessage = error.message;
        entry.errorName = error.name;
        // Only include stack in non-production
        if (process.env.NODE_ENV !== 'production') {
          entry.errorStack = error.stack;
        }
      } else if (error) {
        entry.errorMessage = String(error);
      }

      log(entry);
    },

    fatal(message: string, error?: unknown, data?: Record<string, unknown>) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'fatal',
        message,
        requestId: ctx.requestId,
        userId: ctx.userId,
        path: ctx.path,
        method: ctx.method,
        ...data,
      };

      if (error instanceof Error) {
        entry.errorMessage = error.message;
        entry.errorName = error.name;
        entry.errorStack = error.stack;
      } else if (error) {
        entry.errorMessage = String(error);
      }

      log(entry);
    },

    child(additionalContext: Partial<LogContext>): Logger {
      return createLogger({ ...ctx, ...additionalContext });
    },
  };

  return logger;
}

/**
 * Default logger instance (no context bound).
 */
export const logger = createLogger();
