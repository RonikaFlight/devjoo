import { normalizePersian } from './persian-normalize';

/**
 * Generate a URL-safe slug from Persian or English text.
 */
export function generateSlug(text: string): string {
  const normalized = normalizePersian(text);
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Make a slug unique by appending a random suffix.
 */
export function uniqueSlug(base: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${base}-${suffix}`;
}
