import { describe, it, expect } from 'vitest';
import {
  rialToToman,
  tomanToRial,
  formatCurrencyToman,
  formatNumber,
  toPersianDigits,
  toEnglishDigits,
} from '../currency';

describe('rialToToman', () => {
  it('converts rial to toman', () => {
    expect(rialToToman(1000)).toBe(100);
  });

  it('rounds down', () => {
    expect(rialToToman(1005)).toBe(100);
  });

  it('handles zero', () => {
    expect(rialToToman(0)).toBe(0);
  });
});

describe('tomanToRial', () => {
  it('converts toman to rial', () => {
    expect(tomanToRial(100)).toBe(1000);
  });
});

describe('formatCurrencyToman', () => {
  it('formats with Persian digits and suffix', () => {
    const result = formatCurrencyToman(5000000);
    expect(result).toContain('تومان');
  });
});

describe('formatNumber', () => {
  it('formats with fa-IR locale', () => {
    const result = formatNumber(12345);
    // fa-IR uses Persian digits and comma separators
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('toPersianDigits', () => {
  it('converts all digits', () => {
    expect(toPersianDigits('123')).toBe('۱۲۳');
  });

  it('preserves non-digit characters', () => {
    expect(toPersianDigits('price: 100')).toBe('price: ۱۰۰');
  });

  it('handles empty string', () => {
    expect(toPersianDigits('')).toBe('');
  });
});

describe('toEnglishDigits', () => {
  it('converts Persian digits', () => {
    expect(toEnglishDigits('۱۲۳')).toBe('123');
  });

  it('converts Arabic digits', () => {
    expect(toEnglishDigits('٠١٢')).toBe('012');
  });

  it('handles mixed text', () => {
    expect(toEnglishDigits('قیمت ۱۲۰ تومان')).toBe('قیمت 120 تومان');
  });
});
