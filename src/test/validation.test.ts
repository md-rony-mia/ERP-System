import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validatePositiveNumber,
  validateEmail,
  validatePhone,
  validateDate,
} from '../lib/validation';

describe('Validation Helpers', () => {
  describe('validateRequired', () => {
    it('should validate non-empty string', () => {
      const res = validateRequired('hello', 'Field', 'ক্ষেত্র');
      expect(res.isValid).toBe(true);
      expect(res.message).toBe('');
    });

    it('should return error for empty or whitespace-only string', () => {
      const res1 = validateRequired('', 'Field', 'ক্ষেত্র');
      expect(res1.isValid).toBe(false);
      expect(res1.message).toContain('Field is required / ক্ষেত্র আবশ্যক');

      const res2 = validateRequired('   ', 'Field', 'ক্ষেত্র');
      expect(res2.isValid).toBe(false);
      expect(res2.message).toContain('Field is required / ক্ষেত্র আবশ্যক');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should validate valid positive number', () => {
      const res = validatePositiveNumber(10, 'Price', 'দাম', true);
      expect(res.isValid).toBe(true);
    });

    it('should validate zero when allowed', () => {
      const res = validatePositiveNumber(0, 'Price', 'দাম', true);
      expect(res.isValid).toBe(true);
    });

    it('should reject zero when not allowed', () => {
      const res = validatePositiveNumber(0, 'Price', 'দাম', false);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Price must be greater than 0 / দাম ০-এর বেশি হতে হবে');
    });

    it('should reject negative number', () => {
      const res = validatePositiveNumber(-5, 'Price', 'দাম', true);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Price cannot be negative / দাম ঋণাত্মক হতে পারে না');
    });

    it('should reject non-numeric string', () => {
      const res = validatePositiveNumber('not-a-number', 'Price', 'দাম', true);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Price must be a valid number / দাম একটি সঠিক সংখ্যা হতে হবে');
    });
  });

  describe('validateEmail', () => {
    it('should allow empty/optional email', () => {
      const res = validateEmail('');
      expect(res.isValid).toBe(true);
    });

    it('should validate correct email format', () => {
      const res = validateEmail('test@example.com');
      expect(res.isValid).toBe(true);
    });

    it('should reject incorrect email format', () => {
      const res = validateEmail('testexample.com');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Invalid email format / ইমেল ফরম্যাটটি সঠিক নয়');
    });
  });

  describe('validatePhone', () => {
    it('should allow empty/optional phone', () => {
      const res = validatePhone('');
      expect(res.isValid).toBe(true);
    });

    it('should validate Bangladeshi phone format', () => {
      const res1 = validatePhone('01712345678');
      expect(res1.isValid).toBe(true);

      const res2 = validatePhone('+8801912345678');
      expect(res2.isValid).toBe(true);

      const res3 = validatePhone('8801312345678');
      expect(res3.isValid).toBe(true);
    });

    it('should reject incorrect phone format', () => {
      const res = validatePhone('0123456');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Invalid phone format');
    });
  });

  describe('validateDate', () => {
    it('should validate a correct date string', () => {
      const res = validateDate('2026-07-12', 'Date', 'তারিখ');
      expect(res.isValid).toBe(true);
    });

    it('should reject invalid date string', () => {
      const res = validateDate('invalid-date', 'Date', 'তারিখ');
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('Invalid date format');
    });

    it('should handle preventPast option', () => {
      // Future date should be valid
      const resFuture = validateDate('2030-01-01', 'Date', 'তারিখ', true);
      expect(resFuture.isValid).toBe(true);

      // Past date should be invalid
      const resPast = validateDate('2020-01-01', 'Date', 'তারিখ', true);
      expect(resPast.isValid).toBe(false);
      expect(resPast.message).toContain('cannot be in the past');
    });
  });
});
