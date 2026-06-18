// __tests__/unit/helpers.test.ts
import {
  formatCurrency,
  calculateTax,
  formatDate,
  isValidEmail,
  isValidPhone,
  slugify,
  truncate,
} from '@/utils/helpers';

describe('Helpers Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('1,000.00 ر.س');
      expect(formatCurrency(50000, 'USD')).toContain('$');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toContain('0');
    });
  });

  describe('calculateTax', () => {
    it('should calculate 15% tax correctly', () => {
      expect(calculateTax(1000)).toBe(150);
      expect(calculateTax(10000, 0.15)).toBe(1500);
    });

    it('should handle zero', () => {
      expect(calculateTax(0)).toBe(0);
    });

    it('should support custom tax rates', () => {
      expect(calculateTax(1000, 0.1)).toBe(100);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Saudi phone numbers', () => {
      expect(isValidPhone('+966501234567')).toBe(true);
      expect(isValidPhone('0501234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Service Name')).toBe('test-service-name');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello & World')).toBe('hello--world');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncate(longText, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 20)).toBe('Short');
    });
  });
});
