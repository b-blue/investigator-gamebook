import { describe, it, expect, vi } from 'vitest';
import type { Attributes } from '../../types';

/**
 * Unit tests for dice roll penalty logic from AttributesSection.tsx handleAttributeRoll (L135-174)
 * Testing the calculation logic for attribute rolls with health/sanity penalties
 */

// This is the core penalty calculation logic extracted from handleAttributeRoll
function calculateAttributeRoll(
  attribute: keyof Attributes,
  attributeValue: number,
  diceRoll: number,
  health: number,
  sanity: number
): { result: number; penalty: { type: 'health' | 'sanity' | null; value: number } } {
  // Calculate base result
  let result = attributeValue + diceRoll;
  let penalty: { type: 'health' | 'sanity' | null; value: number } = { type: null, value: 0 };
  
  // Apply combat penalty if health is below zero
  if (attribute === 'combat' && health < 0) {
    result += health; // Add negative health (subtracts from result)
    penalty = { type: 'health', value: health };
  }
  
  // Apply willpower penalty if sanity is below zero
  if (attribute === 'willpower' && sanity < 0) {
    result += sanity; // Add negative sanity (subtracts from result)
    penalty = { type: 'sanity', value: sanity };
  }
  
  return { result, penalty };
}

describe('Dice Roll Penalty Logic - Unit Tests', () => {
  describe('Base Calculation', () => {
    it('should add attribute value to dice roll', () => {
      const { result } = calculateAttributeRoll('combat', 4, 5, 10, 10);
      expect(result).toBe(9); // 4 + 5
    });

    it('should work with zero attribute value', () => {
      const { result } = calculateAttributeRoll('intellect', 0, 3, 10, 10);
      expect(result).toBe(3); // 0 + 3
    });

    it('should work with high attribute values', () => {
      const { result } = calculateAttributeRoll('willpower', 10, 6, 10, 10);
      expect(result).toBe(16); // 10 + 6
    });

    it('should accept dice rolls from 1-6', () => {
      for (let dice = 1; dice <= 6; dice++) {
        const { result } = calculateAttributeRoll('combat', 3, dice, 10, 10);
        expect(result).toBe(3 + dice);
      }
    });
  });

  describe('Combat Penalty (Negative Health)', () => {
    it('should apply health penalty when combat and health < 0', () => {
      const { result, penalty } = calculateAttributeRoll('combat', 5, 3, -2, 10);
      expect(result).toBe(6); // 5 + 3 + (-2) = 6
      expect(penalty.type).toBe('health');
      expect(penalty.value).toBe(-2);
    });

    it('should apply larger health penalty correctly', () => {
      const { result } = calculateAttributeRoll('combat', 10, 5, -4, 10);
      expect(result).toBe(11); // 10 + 5 + (-4) = 11
    });

    it('should NOT apply penalty when health is exactly 0', () => {
      const { result, penalty } = calculateAttributeRoll('combat', 5, 3, 0, 10);
      expect(result).toBe(8); // 5 + 3, no penalty
      expect(penalty.type).toBeNull();
    });

    it('should NOT apply penalty when health is positive', () => {
      const { result, penalty } = calculateAttributeRoll('combat', 5, 3, 5, 10);
      expect(result).toBe(8); // 5 + 3, no penalty
      expect(penalty.type).toBeNull();
    });

    it('should NOT apply health penalty to non-combat attributes', () => {
      const attributes: (keyof Attributes)[] = ['willpower', 'intellect', 'resources', 'clues'];
      
      attributes.forEach(attr => {
        const { result, penalty } = calculateAttributeRoll(attr as any, 5, 3, -3, 10);
        expect(result).toBe(8); // 5 + 3, no penalty
        expect(penalty.type).not.toBe('health');
      });
    });

    it('should handle very negative health', () => {
      const { result } = calculateAttributeRoll('combat', 10, 6, -10, 10);
      expect(result).toBe(6); // 10 + 6 + (-10) = 6
    });

    it('should allow result to go negative from penalty', () => {
      const { result } = calculateAttributeRoll('combat', 2, 1, -5, 10);
      expect(result).toBe(-2); // 2 + 1 + (-5) = -2
    });
  });

  describe('Willpower Penalty (Negative Sanity)', () => {
    it('should apply sanity penalty when willpower and sanity < 0', () => {
      const { result, penalty } = calculateAttributeRoll('willpower', 5, 3, 10, -2);
      expect(result).toBe(6); // 5 + 3 + (-2) = 6
      expect(penalty.type).toBe('sanity');
      expect(penalty.value).toBe(-2);
    });

    it('should apply larger sanity penalty correctly', () => {
      const { result } = calculateAttributeRoll('willpower', 8, 4, 10, -3);
      expect(result).toBe(9); // 8 + 4 + (-3) = 9
    });

    it('should NOT apply penalty when sanity is exactly 0', () => {
      const { result, penalty } = calculateAttributeRoll('willpower', 5, 3, 10, 0);
      expect(result).toBe(8); // 5 + 3, no penalty
      expect(penalty.type).toBeNull();
    });

    it('should NOT apply penalty when sanity is positive', () => {
      const { result, penalty } = calculateAttributeRoll('willpower', 5, 3, 10, 7);
      expect(result).toBe(8); // 5 + 3, no penalty
      expect(penalty.type).toBeNull();
    });

    it('should NOT apply sanity penalty to non-willpower attributes', () => {
      const attributes: (keyof Attributes)[] = ['combat', 'intellect', 'health', 'resources'];
      
      attributes.forEach(attr => {
        const { result, penalty } = calculateAttributeRoll(attr as any, 5, 3, 10, -3);
        expect(result).toBe(8); // 5 + 3, no penalty
        expect(penalty.type).not.toBe('sanity');
      });
    });

    it('should handle very negative sanity', () => {
      const { result } = calculateAttributeRoll('willpower', 10, 6, 10, -8);
      expect(result).toBe(8); // 10 + 6 + (-8) = 8
    });

    it('should allow result to go negative from penalty', () => {
      const { result } = calculateAttributeRoll('willpower', 3, 2, 10, -7);
      expect(result).toBe(-2); // 3 + 2 + (-7) = -2
    });
  });

  describe('Combined Scenarios', () => {
    it('should NOT apply both penalties simultaneously', () => {
      // Even with both health and sanity negative, only one penalty should apply based on attribute
      const combatRoll = calculateAttributeRoll('combat', 5, 3, -2, -3);
      expect(combatRoll.result).toBe(6); // Only health penalty: 5 + 3 + (-2)
      expect(combatRoll.penalty.type).toBe('health');
      
      const willpowerRoll = calculateAttributeRoll('willpower', 5, 3, -2, -3);
      expect(willpowerRoll.result).toBe(5); // Only sanity penalty: 5 + 3 + (-3)
      expect(willpowerRoll.penalty.type).toBe('sanity');
    });

    it('should work with all attributes having negative values', () => {
      const { result, penalty } = calculateAttributeRoll('combat', -1, 6, -2, -3);
      expect(result).toBe(3); // -1 + 6 + (-2) = 3
      expect(penalty.type).toBe('health');
    });
  });

  describe('Other Attributes (No Penalties)', () => {
    it('should never apply penalties to intellect', () => {
      const { result, penalty } = calculateAttributeRoll('intellect', 5, 3, -5, -5);
      expect(result).toBe(8); // 5 + 3, no penalties
      expect(penalty.type).toBeNull();
    });

    it('should never apply penalties to health attribute itself', () => {
      const { result, penalty } = calculateAttributeRoll('health', 5, 3, -5, -5);
      expect(result).toBe(8);
      expect(penalty.type).toBeNull();
    });

    it('should never apply penalties to sanity attribute itself', () => {
      const { result, penalty } = calculateAttributeRoll('sanity', 5, 3, -5, -5);
      expect(result).toBe(8);
      expect(penalty.type).toBeNull();
    });

    it('should never apply penalties to resources', () => {
      const { result, penalty } = calculateAttributeRoll('resources', 5, 3, -5, -5);
      expect(result).toBe(8);
      expect(penalty.type).toBeNull();
    });

    it('should never apply penalties to clues', () => {
      const { result, penalty } = calculateAttributeRoll('clues', 5, 3, -5, -5);
      expect(result).toBe(8);
      expect(penalty.type).toBeNull();
    });

    it('should never apply penalties to doom', () => {
      const { result, penalty } = calculateAttributeRoll('doom', 5, 3, -5, -5);
      expect(result).toBe(8);
      expect(penalty.type).toBeNull();
    });
  });

  describe('Dice Roll Integration', () => {
    it('should work with all valid dice rolls (1-6) with penalties', () => {
      for (let dice = 1; dice <= 6; dice++) {
        const { result } = calculateAttributeRoll('combat', 5, dice, -2, 10);
        expect(result).toBe(5 + dice - 2); // attribute + dice + penalty
      }
    });

    it('should produce deterministic results with same inputs', () => {
      const result1 = calculateAttributeRoll('combat', 5, 3, -2, 10);
      const result2 = calculateAttributeRoll('combat', 5, 3, -2, 10);
      
      expect(result1.result).toBe(result2.result);
      expect(result1.penalty).toEqual(result2.penalty);
    });
  });

  describe('Realistic Game Scenarios', () => {
    it('should handle wounded investigator (low health)', () => {
      // Investigator with combat 4, rolled 5, but has -3 health
      const { result } = calculateAttributeRoll('combat', 4, 5, -3, 8);
      expect(result).toBe(6); // 4 + 5 - 3 = 6
    });

    it('should handle traumatized investigator (low sanity)', () => {
      // Investigator with willpower 3, rolled 4, but has -2 sanity
      const { result } = calculateAttributeRoll('willpower', 3, 4, 8, -2);
      expect(result).toBe(5); // 3 + 4 - 2 = 5
    });

    it('should handle healthy investigator with no penalties', () => {
      const { result, penalty } = calculateAttributeRoll('combat', 5, 6, 10, 10);
      expect(result).toBe(11); // 5 + 6
      expect(penalty.type).toBeNull();
    });

    it('should handle min roll with penalty', () => {
      // Worst case: low attribute, rolled 1, negative health
      const { result } = calculateAttributeRoll('combat', 1, 1, -4, 10);
      expect(result).toBe(-2); // 1 + 1 - 4 = -2
    });

    it('should handle max roll with no penalty', () => {
      // Best case: high attribute, rolled 6, full health/sanity
      const { result } = calculateAttributeRoll('combat', 10, 6, 10, 10);
      expect(result).toBe(16); // 10 + 6
    });
  });
});
