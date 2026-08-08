/**
 * Format Rial amount to Toman display string
 * 1 Toman = 10 Rial
 */
export function rialToToman(rial: number): number {
  return Math.floor(rial / 10);
}

export function tomanToRial(toman: number): number {
  return toman * 10;
}

/**
 * Format a number as Persian-localized currency string
 */
export function formatCurrencyRial(rial: number): string {
  return formatNumber(rial) + ' ریال';
}

export function formatCurrencyToman(toman: number): string {
  return formatNumber(toman) + ' تومان';
}

/**
 * Format budget range
 */
export function formatBudgetRange(
  minRial: number | null | undefined,
  maxRial: number | null | undefined,
  budgetType: string,
): string {
  if (budgetType === 'HOURLY') {
    const min = minRial != null ? formatCurrencyToman(rialToToman(minRial)) : '';
    const max = maxRial != null ? formatCurrencyToman(rialToToman(maxRial)) : '';
    if (min && max) return `${min} تا ${max} در ساعت`;
    if (min) return `از ${min} در ساعت`;
    if (max) return `تا ${max} در ساعت`;
    return 'ساعتی';
  }

  const min = minRial != null ? formatCurrencyToman(rialToToman(minRial)) : '';
  const max = maxRial != null ? formatCurrencyToman(rialToToman(maxRial)) : '';
  if (min && max) return `${min} تا ${max}`;
  if (min) return `از ${min}`;
  if (max) return `تا ${max}`;
  return 'توافقی';
}

/**
 * Format number with Persian grouping
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * Convert English digits to Persian digits
 */
export function toPersianDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Convert Persian digits to English digits
 */
export function toEnglishDigits(str: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return str
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
}
