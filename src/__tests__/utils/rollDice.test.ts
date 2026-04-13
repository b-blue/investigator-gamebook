import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * Unit tests for dice rolling logic from App.tsx (L129)
 * Testing the core formula: Math.floor(Math.random() * 6) + 1
 */

// Extract the dice roll formula for testing
function generateDiceRoll(): number {
  return Math.floor(Math.random() * 6) + 1;
}

describe('Dice Roll Logic - Unit Tests', () => {
  describe('Random Number Generation', () => {
    it('should generate dice roll between 1 and 6', () => {
      // Run multiple times to increase confidence
      for (let i = 0; i < 100; i++) {
        const roll = generateDiceRoll();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
        expect(Number.isInteger(roll)).toBe(true);
      }
    });

    it('should produce all possible values (1-6) over multiple rolls', () => {
      const results = new Set<number>();
      
      // Run enough times to likely hit all values
      for (let i = 0; i < 1000; i++) {
        const roll = generateDiceRoll();
        results.add(roll);
      }
      
      // Should have seen all values 1-6
      expect(results.size).toBe(6);
      expect(results.has(1)).toBe(true);
      expect(results.has(2)).toBe(true);
      expect(results.has(3)).toBe(true);
      expect(results.has(4)).toBe(true);
      expect(results.has(5)).toBe(true);
      expect(results.has(6)).toBe(true);
    });
  });

  describe('Deterministic Testing with Mocks', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should use mocked Math.random for deterministic testing', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      // Math.floor(0.5 * 6) + 1 = Math.floor(3) + 1 = 4
      const roll = generateDiceRoll();
      expect(roll).toBe(4);
    });

    it('should handle edge case: Math.random returns 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      
      // Math.floor(0 * 6) + 1 = 0 + 1 = 1
      const roll = generateDiceRoll();
      expect(roll).toBe(1);
    });

    it('should handle edge case: Math.random returns 0.9999', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9999);
      
      // Math.floor(0.9999 * 6) + 1 = Math.floor(5.9994) + 1 = 5 + 1 = 6
      const roll = generateDiceRoll();
      expect(roll).toBe(6);
    });

    it('should produce value 1 when Math.random returns 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      expect(generateDiceRoll()).toBe(1);
    });

    it('should produce value 2 when Math.random returns 0.2', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.2);
      expect(generateDiceRoll()).toBe(2);
    });

    it('should produce value 3 when Math.random returns 0.4', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.4);
      expect(generateDiceRoll()).toBe(3);
    });

    it('should produce value 4 when Math.random returns 0.6', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6);
      expect(generateDiceRoll()).toBe(4);
    });

    it('should produce value 5 when Math.random returns 0.8', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      expect(generateDiceRoll()).toBe(5);
    });

    it('should produce value 6 when Math.random returns 0.99', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      expect(generateDiceRoll()).toBe(6);
    });
  });

  describe('Formula Correctness', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should correctly map 0.0-0.166... to 1', () => {
      const testValues = [0, 0.1, 0.16, 0.166];
      testValues.forEach(val => {
        vi.spyOn(Math, 'random').mockReturnValue(val);
        expect(generateDiceRoll()).toBe(1);
        vi.restoreAllMocks();
      });
    });

    it('should correctly map 0.166...-0.333... to 2', () => {
      const testValues = [0.17, 0.25, 0.33];
      testValues.forEach(val => {
        vi.spyOn(Math, 'random').mockReturnValue(val);
        expect(generateDiceRoll()).toBe(2);
        vi.restoreAllMocks();
      });
    });

    it('should correctly map 0.833...-0.999... to 6', () => {
      const testValues = [0.84, 0.9, 0.95, 0.999];
      testValues.forEach(val => {
        vi.spyOn(Math, 'random').mockReturnValue(val);
        expect(generateDiceRoll()).toBe(6);
        vi.restoreAllMocks();
      });
    });
  });

  describe('Statistical Properties', () => {
    it('should never produce values outside 1-6 range', () => {
      for (let i = 0; i < 10000; i++) {
        const roll = generateDiceRoll();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
    });

    it('should always produce integers', () => {
      for (let i = 0; i < 1000; i++) {
        const roll = generateDiceRoll();
        expect(Number.isInteger(roll)).toBe(true);
        expect(roll % 1).toBe(0);
      }
    });

    it('should produce each value at least once in 1000 rolls', () => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      
      for (let i = 0; i < 1000; i++) {
        const roll = generateDiceRoll();
        counts[roll as keyof typeof counts]++;
      }
      
      // Each value should appear at least once
      Object.values(counts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle Math.random returning exactly 0.5', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const roll = generateDiceRoll();
      expect(roll).toBe(4);
    });

    it('should handle Math.random returning close to 1', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99999999);
      const roll = generateDiceRoll();
      expect(roll).toBe(6);
    });

    it('should handle very small value', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.00000001);
      const roll = generateDiceRoll();
      expect(roll).toBe(1);
    });
  });
});
