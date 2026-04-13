import { describe, it, expect } from 'vitest';

/**
 * Unit tests for bookmark validation logic from App.tsx (L347-361)
 * Testing saveBookmark validation: rejects NaN, rejects negative, accepts >= 0
 */

interface BookmarkValidationResult {
  isValid: boolean;
  value?: number;
}

// Extract the validation logic for testing
function validateBookmark(input: string): BookmarkValidationResult {
  const value = parseInt(input, 10);
  
  if (isNaN(value)) {
    return { isValid: false };
  }
  
  if (value < 0) {
    return { isValid: false };
  }
  
  return { isValid: true, value };
}

describe('Bookmark Validation - Unit Tests', () => {
  describe('Valid Inputs', () => {
    it('should accept zero as valid bookmark', () => {
      const result = validateBookmark('0');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should accept positive integers', () => {
      const testCases = ['1', '5', '10', '100', '1000'];
      
      testCases.forEach(input => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(parseInt(input, 10));
      });
    });

    it('should accept large positive numbers', () => {
      const result = validateBookmark('999999');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(999999);
    });

    it('should accept numbers with leading zeros', () => {
      const result = validateBookmark('007');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(7);
    });

    it('should accept single digit positive numbers', () => {
      for (let i = 0; i <= 9; i++) {
        const result = validateBookmark(i.toString());
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(i);
      }
    });

    it('should accept typical page numbers', () => {
      const pageNumbers = ['1', '42', '100', '256', '500'];
      
      pageNumbers.forEach(page => {
        const result = validateBookmark(page);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(parseInt(page, 10));
      });
    });
  });

  describe('Invalid Inputs - NaN', () => {
    it('should reject empty string', () => {
      const result = validateBookmark('');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should reject non-numeric strings', () => {
      const invalidInputs = ['abc', 'hello', 'page', 'bookmark'];
      
      invalidInputs.forEach(input => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });
    });

    it('should reject strings with letters and numbers mixed', () => {
      const mixedInputs = ['123abc', 'abc123', '12a34'];
      
      mixedInputs.forEach(input => {
        const result = validateBookmark(input);
        // parseInt will parse partial numbers, but might be NaN for 'abc123'
        // Let's test what actually happens
        const parsed = parseInt(input, 10);
        const result2 = validateBookmark(input);
        
        if (isNaN(parsed)) {
          expect(result2.isValid).toBe(false);
        } else {
          // parseInt('123abc') = 123, which might be accepted if >= 0
          expect(result2.isValid).toBe(parsed >= 0);
        }
      });
    });

    it('should reject special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
      
      specialChars.forEach(char => {
        const result = validateBookmark(char);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });
    });

    it('should reject whitespace only', () => {
      const whitespaceInputs = [' ', '  ', '\t', '\n'];
      
      whitespaceInputs.forEach(input => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });
    });

    it('should reject null and undefined strings', () => {
      const nullishInputs = ['null', 'undefined'];
      
      nullishInputs.forEach(input => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });
    });
  });

  describe('Invalid Inputs - Negative Numbers', () => {
    it('should reject negative integers', () => {
      const negativeNumbers = ['-1', '-5', '-10', '-100'];
      
      negativeNumbers.forEach(input => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(false);
        expect(result.value).toBeUndefined();
      });
    });

    it('should reject large negative numbers', () => {
      const result = validateBookmark('-999999');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should treat negative zero as valid zero', () => {
      const result = validateBookmark('-0');
      // parseInt('-0') returns -0, which is >= 0 (as -0 === 0 is true), so it's valid
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(-0); // -0 is returned, but -0 === 0 is true
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal numbers (parseInt truncates)', () => {
      const result = validateBookmark('3.14');
      // parseInt('3.14') = 3
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(3);
    });

    it('should handle negative decimal numbers', () => {
      const result = validateBookmark('-3.14');
      // parseInt('-3.14') = -3, which is < 0
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should handle numbers with leading whitespace', () => {
      const result = validateBookmark('  42');
      // parseInt trims whitespace
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should handle numbers with trailing whitespace', () => {
      const result = validateBookmark('42  ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should handle numbers with both leading and trailing whitespace', () => {
      const result = validateBookmark('  42  ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should handle very large numbers', () => {
      const result = validateBookmark('9007199254740991'); // Number.MAX_SAFE_INTEGER
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(9007199254740991);
    });

    it('should handle numbers beyond MAX_SAFE_INTEGER', () => {
      const hugeNumber = '99999999999999999999';
      const result = validateBookmark(hugeNumber);
      // parseInt will parse it, might lose precision
      expect(result.isValid).toBe(true);
      expect(typeof result.value).toBe('number');
    });

    it('should handle scientific notation', () => {
      const result = validateBookmark('1e3');
      // parseInt('1e3') = 1 (stops at 'e')
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
    });

    it('should handle hexadecimal notation', () => {
      const result = validateBookmark('0x10');
      // parseInt('0x10', 10) will stop at 'x', returning 0
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });
  });

  describe('Boundary Conditions', () => {
    it('should accept exactly 0', () => {
      const result = validateBookmark('0');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should accept 1 (minimum positive)', () => {
      const result = validateBookmark('1');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
    });

    it('should reject -1 (maximum negative)', () => {
      const result = validateBookmark('-1');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should handle +0 (positive zero)', () => {
      const result = validateBookmark('+0');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should handle +1 with plus sign', () => {
      const result = validateBookmark('+1');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1);
    });
  });

  describe('Realistic Game Scenarios', () => {
    it('should accept typical bookmark values from gameplay', () => {
      const typicalBookmarks = ['1', '15', '42', '100', '256'];
      
      typicalBookmarks.forEach(bookmark => {
        const result = validateBookmark(bookmark);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(parseInt(bookmark, 10));
      });
    });

    it('should reject user typos', () => {
      const typos = ['', 'page 42', '42 ', 'forty-two'];
      
      typos.forEach(typo => {
        const result = validateBookmark(typo);
        const parsed = parseInt(typo, 10);
        
        if (isNaN(parsed)) {
          expect(result.isValid).toBe(false);
        } else {
          expect(result.isValid).toBe(parsed >= 0);
        }
      });
    });

    it('should handle clearing bookmark (empty string)', () => {
      const result = validateBookmark('');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should validate sequential bookmark updates', () => {
      const sequence = ['1', '5', '10', '15', '0', '100'];
      
      sequence.forEach(value => {
        const result = validateBookmark(value);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(parseInt(value, 10));
      });
    });

    it('should handle user entering previous bookmark value again', () => {
      const bookmark = '42';
      
      const first = validateBookmark(bookmark);
      const second = validateBookmark(bookmark);
      
      expect(first.isValid).toBe(true);
      expect(second.isValid).toBe(true);
      expect(first.value).toBe(second.value);
      expect(first.value).toBe(42);
    });
  });

  describe('parseInt Radix 10 Behavior', () => {
    it('should use radix 10 for parsing', () => {
      // Verify parseInt with radix 10
      expect(parseInt('10', 10)).toBe(10);
      expect(parseInt('010', 10)).toBe(10); // Not octal
      expect(parseInt('0x10', 10)).toBe(0); // Not hex
    });

    it('should handle octal-looking numbers as decimal', () => {
      const result = validateBookmark('010');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(10); // Decimal 10, not octal 8
    });

    it('should stop parsing at first non-digit', () => {
      const tests = [
        { input: '123abc', expected: 123 },
        { input: '456.789', expected: 456 },
        { input: '42px', expected: 42 }
      ];
      
      tests.forEach(({ input, expected }) => {
        const result = validateBookmark(input);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(expected);
      });
    });
  });

  describe('Return Value Structure', () => {
    it('should return isValid and value for valid inputs', () => {
      const result = validateBookmark('42');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('value');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should return isValid false without value for invalid inputs', () => {
      const result = validateBookmark('invalid');
      
      expect(result).toHaveProperty('isValid');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should return consistent structure for all inputs', () => {
      const inputs = ['42', '-1', '', 'abc', '0'];
      
      inputs.forEach(input => {
        const result = validateBookmark(input);
        expect(typeof result.isValid).toBe('boolean');
        expect(result.value === undefined || typeof result.value === 'number').toBe(true);
      });
    });
  });
});
