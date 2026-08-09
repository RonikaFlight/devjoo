import { toEnglishDigits } from './currency';

/**
 * Normalize Persian text for search
 * - Arabic Ya → Persian Ya
 * - Arabic Ke → Persian Ke
 * - Normalize spaces
 * - Lowercase English
 */
export function normalizePersian(text: string): string {
  let result = text;
  // Arabic to Persian character normalization
  result = result.replace(/ي/g, 'ی');
  result = result.replace(/ك/g, 'ک');
  // Convert Persian/Arabic digits to English for matching
  result = toEnglishDigits(result);
  // Normalize multiple spaces
  result = result.replace(/\s+/g, ' ');
  // Trim
  result = result.trim();
  // Lowercase English chars (preserve Persian)
  result = result.toLowerCase();
  return result;
}

/**
 * Generate a URL-safe slug from Persian/English text
 */
export function generateSlug(text: string): string {
  let slug = normalizePersian(text);
  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');
  // Remove non-alphanumeric (except hyphens)
  slug = slug.replace(/[^a-z0-9\u0600-\u06FF-]/g, '');
  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
