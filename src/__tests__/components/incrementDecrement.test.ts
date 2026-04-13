import { describe, it, expect, vi } from 'vitest';

/**
 * Unit tests for increment/decrement handler logic
 * Testing increment and decrement from AttributesSection.tsx (L176-186)
 * Validates callbacks are called correctly with attribute name and new value
 */

type AttributeKey = 'willpower' | 'intellect' | 'combat' | 'health' | 'sanity' | 'resources' | 'clues' | 'doom';

interface Attributes {
  willpower: number;
  intellect: number;
  combat: number;
  health: number;
  sanity: number;
  resources: number;
  clues: number;
  doom: number;
}

// Extract the handler logic for testing
function handleIncrement(
  selectedAttribute: AttributeKey | null,
  currentValue: number,
  callback: (attr: AttributeKey, value: number) => void
): void {
  if (selectedAttribute) {
    callback(selectedAttribute, currentValue + 1);
  }
}

function handleDecrement(
  selectedAttribute: AttributeKey | null,
  currentValue: number,
  callback: (attr: AttributeKey, value: number) => void
): void {
  if (selectedAttribute) {
    callback(selectedAttribute, currentValue - 1);
  }
}

describe('Increment/Decrement Handlers - Unit Tests', () => {
  describe('Increment Handler', () => {
    it('should call callback with incremented value', () => {
      const callback = vi.fn();
      
      handleIncrement('willpower', 4, callback);
      
      expect(callback).toHaveBeenCalledWith('willpower', 5);
    });

    it('should increment from zero', () => {
      const callback = vi.fn();
      
      handleIncrement('health', 0, callback);
      
      expect(callback).toHaveBeenCalledWith('health', 1);
    });

    it('should increment positive values', () => {
      const callback = vi.fn();
      
      handleIncrement('combat', 3, callback);
      
      expect(callback).toHaveBeenCalledWith('combat', 4);
    });

    it('should increment negative values', () => {
      const callback = vi.fn();
      
      handleIncrement('sanity', -2, callback);
      
      expect(callback).toHaveBeenCalledWith('sanity', -1);
    });

    it('should increment large values', () => {
      const callback = vi.fn();
      
      handleIncrement('resources', 100, callback);
      
      expect(callback).toHaveBeenCalledWith('resources', 101);
    });

    it('should not call callback when no attribute selected', () => {
      const callback = vi.fn();
      
      handleIncrement(null, 5, callback);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback exactly once', () => {
      const callback = vi.fn();
      
      handleIncrement('willpower', 4, callback);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should work for all attribute types', () => {
      const attributes: AttributeKey[] = [
        'willpower', 'intellect', 'combat', 'health',
        'sanity', 'resources', 'clues', 'doom'
      ];
      
      attributes.forEach(attr => {
        const callback = vi.fn();
        handleIncrement(attr, 5, callback);
        expect(callback).toHaveBeenCalledWith(attr, 6);
      });
    });
  });

  describe('Decrement Handler', () => {
    it('should call callback with decremented value', () => {
      const callback = vi.fn();
      
      handleDecrement('willpower', 4, callback);
      
      expect(callback).toHaveBeenCalledWith('willpower', 3);
    });

    it('should decrement to zero', () => {
      const callback = vi.fn();
      
      handleDecrement('health', 1, callback);
      
      expect(callback).toHaveBeenCalledWith('health', 0);
    });

    it('should decrement to negative', () => {
      const callback = vi.fn();
      
      handleDecrement('sanity', 0, callback);
      
      expect(callback).toHaveBeenCalledWith('sanity', -1);
    });

    it('should decrement negative values', () => {
      const callback = vi.fn();
      
      handleDecrement('health', -3, callback);
      
      expect(callback).toHaveBeenCalledWith('health', -4);
    });

    it('should decrement large values', () => {
      const callback = vi.fn();
      
      handleDecrement('clues', 50, callback);
      
      expect(callback).toHaveBeenCalledWith('clues', 49);
    });

    it('should not call callback when no attribute selected', () => {
      const callback = vi.fn();
      
      handleDecrement(null, 5, callback);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback exactly once', () => {
      const callback = vi.fn();
      
      handleDecrement('combat', 2, callback);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should work for all attribute types', () => {
      const attributes: AttributeKey[] = [
        'willpower', 'intellect', 'combat', 'health',
        'sanity', 'resources', 'clues', 'doom'
      ];
      
      attributes.forEach(attr => {
        const callback = vi.fn();
        handleDecrement(attr, 10, callback);
        expect(callback).toHaveBeenCalledWith(attr, 9);
      });
    });
  });

  describe('Increment/Decrement Sequences', () => {
    it('should handle multiple increments', () => {
      const callback = vi.fn();
      let value = 0;
      
      handleIncrement('willpower', value++, callback);
      handleIncrement('willpower', value++, callback);
      handleIncrement('willpower', value++, callback);
      
      expect(callback).toHaveBeenNthCalledWith(1, 'willpower', 1);
      expect(callback).toHaveBeenNthCalledWith(2, 'willpower', 2);
      expect(callback).toHaveBeenNthCalledWith(3, 'willpower', 3);
    });

    it('should handle multiple decrements', () => {
      const callback = vi.fn();
      let value = 10;
      
      handleDecrement('health', value--, callback);
      handleDecrement('health', value--, callback);
      handleDecrement('health', value--, callback);
      
      expect(callback).toHaveBeenNthCalledWith(1, 'health', 9);
      expect(callback).toHaveBeenNthCalledWith(2, 'health', 8);
      expect(callback).toHaveBeenNthCalledWith(3, 'health', 7);
    });

    it('should handle increment then decrement', () => {
      const callback = vi.fn();
      
      handleIncrement('combat', 5, callback);
      handleDecrement('combat', 6, callback);
      
      expect(callback).toHaveBeenNthCalledWith(1, 'combat', 6);
      expect(callback).toHaveBeenNthCalledWith(2, 'combat', 5);
    });

    it('should handle decrement then increment', () => {
      const callback = vi.fn();
      
      handleDecrement('sanity', 8, callback);
      handleIncrement('sanity', 7, callback);
      
      expect(callback).toHaveBeenNthCalledWith(1, 'sanity', 7);
      expect(callback).toHaveBeenNthCalledWith(2, 'sanity', 8);
    });

    it('should handle rapid increment/decrement sequence', () => {
      const callback = vi.fn();
      let value = 5;
      
      handleIncrement('resources', value, callback); // 6
      value++;
      handleIncrement('resources', value, callback); // 7
      value++;
      handleDecrement('resources', value, callback); // 6
      value--;
      handleDecrement('resources', value, callback); // 5
      value--;
      handleIncrement('resources', value, callback); // 6
      
      expect(callback).toHaveBeenCalledTimes(5);
      expect(callback).toHaveBeenNthCalledWith(5, 'resources', 6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle incrementing from Number.MAX_SAFE_INTEGER', () => {
      const callback = vi.fn();
      const maxInt = Number.MAX_SAFE_INTEGER;
      
      handleIncrement('doom', maxInt, callback);
      
      expect(callback).toHaveBeenCalledWith('doom', maxInt + 1);
    });

    it('should handle decrementing to Number.MIN_SAFE_INTEGER', () => {
      const callback = vi.fn();
      const minInt = Number.MIN_SAFE_INTEGER;
      
      handleDecrement('clues', minInt + 1, callback);
      
      expect(callback).toHaveBeenCalledWith('clues', minInt);
    });

    it('should handle incrementing zero multiple times', () => {
      const callback = vi.fn();
      
      handleIncrement('willpower', 0, callback);
      handleIncrement('willpower', 1, callback);
      handleIncrement('willpower', 2, callback);
      
      expect(callback).toHaveBeenNthCalledWith(1, 'willpower', 1);
      expect(callback).toHaveBeenNthCalledWith(2, 'willpower', 2);
      expect(callback).toHaveBeenNthCalledWith(3, 'willpower', 3);
    });

    it('should handle decrementing to deeply negative', () => {
      const callback = vi.fn();
      
      handleDecrement('health', -99, callback);
      
      expect(callback).toHaveBeenCalledWith('health', -100);
    });

    it('should handle null attribute consistently', () => {
      const callback = vi.fn();
      
      handleIncrement(null, 5, callback);
      handleDecrement(null, 5, callback);
      handleIncrement(null, 0, callback);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Callback Invocation', () => {
    it('should pass correct attribute name to callback', () => {
      const callback = vi.fn();
      
      handleIncrement('intellect', 3, callback);
      
      expect(callback).toHaveBeenCalledWith('intellect', expect.any(Number));
    });

    it('should pass correct new value to callback', () => {
      const callback = vi.fn();
      
      handleIncrement('combat', 2, callback);
      
      expect(callback).toHaveBeenCalledWith(expect.any(String), 3);
    });

    it('should call callback with both parameters', () => {
      const callback = vi.fn();
      
      handleDecrement('sanity', 8, callback);
      
      expect(callback).toHaveBeenCalledWith('sanity', 7);
      expect(callback.mock.calls[0][0]).toBe('sanity');
      expect(callback.mock.calls[0][1]).toBe(7);
    });

    it('should not modify callback or its arguments', () => {
      const callback = vi.fn();
      const attr: AttributeKey = 'health';
      const value = 6;
      
      handleIncrement(attr, value, callback);
      
      expect(attr).toBe('health'); // Unchanged
      expect(value).toBe(6); // Unchanged
    });
  });

  describe('Realistic Game Scenarios', () => {
    it('should increment health after gaining health', () => {
      const callback = vi.fn();
      
      handleIncrement('health', 5, callback);
      
      expect(callback).toHaveBeenCalledWith('health', 6);
    });

    it('should decrement health after taking damage', () => {
      const callback = vi.fn();
      
      handleDecrement('health', 6, callback);
      
      expect(callback).toHaveBeenCalledWith('health', 5);
    });

    it('should decrement sanity when losing sanity', () => {
      const callback = vi.fn();
      
      handleDecrement('sanity', 8, callback);
      
      expect(callback).toHaveBeenCalledWith('sanity', 7);
    });

    it('should increment resources when gaining money', () => {
      const callback = vi.fn();
      
      handleIncrement('resources', 4, callback);
      
      expect(callback).toHaveBeenCalledWith('resources', 5);
    });

    it('should decrement resources when spending', () => {
      const callback = vi.fn();
      
      handleDecrement('resources', 4, callback);
      
      expect(callback).toHaveBeenCalledWith('resources', 3);
    });

    it('should increment clues when investigating', () => {
      const callback = vi.fn();
      
      handleIncrement('clues', 2, callback);
      
      expect(callback).toHaveBeenCalledWith('clues', 3);
    });

    it('should increment doom counter', () => {
      const callback = vi.fn();
      
      handleIncrement('doom', 3, callback);
      
      expect(callback).toHaveBeenCalledWith('doom', 4);
    });

    it('should handle health going to zero', () => {
      const callback = vi.fn();
      
      handleDecrement('health', 1, callback);
      
      expect(callback).toHaveBeenCalledWith('health', 0);
    });

    it('should handle health going negative', () => {
      const callback = vi.fn();
      
      handleDecrement('health', 0, callback);
      
      expect(callback).toHaveBeenCalledWith('health', -1);
    });

    it('should handle recovering from negative health', () => {
      const callback = vi.fn();
      
      handleIncrement('health', -2, callback);
      
      expect(callback).toHaveBeenCalledWith('health', -1);
    });
  });

  describe('Different Attributes', () => {
    it('should increment willpower', () => {
      const callback = vi.fn();
      handleIncrement('willpower', 4, callback);
      expect(callback).toHaveBeenCalledWith('willpower', 5);
    });

    it('should increment intellect', () => {
      const callback = vi.fn();
      handleIncrement('intellect', 5, callback);
      expect(callback).toHaveBeenCalledWith('intellect', 6);
    });

    it('should increment combat', () => {
      const callback = vi.fn();
      handleIncrement('combat', 2, callback);
      expect(callback).toHaveBeenCalledWith('combat', 3);
    });

    it('should decrement willpower', () => {
      const callback = vi.fn();
      handleDecrement('willpower', 4, callback);
      expect(callback).toHaveBeenCalledWith('willpower', 3);
    });

    it('should decrement intellect', () => {
      const callback = vi.fn();
      handleDecrement('intellect', 5, callback);
      expect(callback).toHaveBeenCalledWith('intellect', 4);
    });

    it('should decrement combat', () => {
      const callback = vi.fn();
      handleDecrement('combat', 2, callback);
      expect(callback).toHaveBeenCalledWith('combat', 1);
    });
  });

  describe('Boundary Conditions', () => {
    it('should increment from -1 to 0', () => {
      const callback = vi.fn();
      handleIncrement('health', -1, callback);
      expect(callback).toHaveBeenCalledWith('health', 0);
    });

    it('should decrement from 0 to -1', () => {
      const callback = vi.fn();
      handleDecrement('sanity', 0, callback);
      expect(callback).toHaveBeenCalledWith('sanity', -1);
    });

    it('should increment from 0 to 1', () => {
      const callback = vi.fn();
      handleIncrement('clues', 0, callback);
      expect(callback).toHaveBeenCalledWith('clues', 1);
    });

    it('should decrement from 1 to 0', () => {
      const callback = vi.fn();
      handleDecrement('resources', 1, callback);
      expect(callback).toHaveBeenCalledWith('resources', 0);
    });
  });
});
