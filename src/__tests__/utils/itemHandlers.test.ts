import { describe, it, expect } from 'vitest';

/**
 * Unit tests for add/remove item handler logic
 * Testing handleAddItem and handleRemoveItem from ItemsSection/AbilitiesSection/etc. (L22-33)
 * Validates no duplicates and correct array filtering
 */

// Extract the handler logic for testing
function handleAddItem(
  items: string[],
  itemName: string | null
): string[] | null {
  if (itemName && !items.includes(itemName)) {
    return [...items, itemName];
  }
  return null; // No change
}

function handleRemoveItem(
  items: string[],
  itemName: string
): string[] {
  return items.filter(item => item !== itemName);
}

describe('Add/Remove Item Handlers - Unit Tests', () => {
  describe('handleAddItem - Basic Functionality', () => {
    it('should add item to empty array', () => {
      const result = handleAddItem([], 'Magnifying Glass');
      expect(result).toEqual(['Magnifying Glass']);
    });

    it('should add item to existing array', () => {
      const items = ['Flashlight'];
      const result = handleAddItem(items, 'Magnifying Glass');
      expect(result).toEqual(['Flashlight', 'Magnifying Glass']);
    });

    it('should preserve existing items order when adding', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleAddItem(items, 'Item 4');
      expect(result).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
    });

    it('should add multiple items sequentially', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, 'Item 1') || items;
      expect(items).toEqual(['Item 1']);
      
      items = handleAddItem(items, 'Item 2') || items;
      expect(items).toEqual(['Item 1', 'Item 2']);
      
      items = handleAddItem(items, 'Item 3') || items;
      expect(items).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });
  });

  describe('handleAddItem - Duplicate Prevention', () => {
    it('should not add duplicate item', () => {
      const items = ['Magnifying Glass'];
      const result = handleAddItem(items, 'Magnifying Glass');
      expect(result).toBeNull();
    });

    it('should not add item already in middle of array', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleAddItem(items, 'Item 2');
      expect(result).toBeNull();
    });

    it('should not add item at beginning of array', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleAddItem(items, 'Item 1');
      expect(result).toBeNull();
    });

    it('should not add item at end of array', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleAddItem(items, 'Item 3');
      expect(result).toBeNull();
    });

    it('should handle multiple duplicate attempts', () => {
      const items = ['Existing Item'];
      
      const result1 = handleAddItem(items, 'Existing Item');
      const result2 = handleAddItem(items, 'Existing Item');
      const result3 = handleAddItem(items, 'Existing Item');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });

  describe('handleAddItem - Null/Undefined Handling', () => {
    it('should not add when itemName is null', () => {
      const items = ['Item 1'];
      const result = handleAddItem(items, null);
      expect(result).toBeNull();
    });

    it('should handle empty array with null itemName', () => {
      const result = handleAddItem([], null);
      expect(result).toBeNull();
    });
  });

  describe('handleAddItem - Immutability', () => {
    it('should not mutate original array', () => {
      const original = ['Item 1', 'Item 2'];
      const copy = [...original];
      
      const result = handleAddItem(original, 'Item 3');
      
      expect(original).toEqual(copy); // Original unchanged
      expect(result).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });

    it('should return new array reference', () => {
      const original = ['Item 1'];
      const result = handleAddItem(original, 'Item 2');
      
      expect(result).not.toBe(original); // Different reference
      expect(result).toEqual(['Item 1', 'Item 2']);
    });
  });

  describe('handleRemoveItem - Basic Functionality', () => {
    it('should remove item from array', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleRemoveItem(items, 'Item 2');
      expect(result).toEqual(['Item 1', 'Item 3']);
    });

    it('should remove first item', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleRemoveItem(items, 'Item 1');
      expect(result).toEqual(['Item 2', 'Item 3']);
    });

    it('should remove last item', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const result = handleRemoveItem(items, 'Item 3');
      expect(result).toEqual(['Item 1', 'Item 2']);
    });

    it('should remove only item from single-item array', () => {
      const items = ['Only Item'];
      const result = handleRemoveItem(items, 'Only Item');
      expect(result).toEqual([]);
    });

    it('should handle removing from empty array', () => {
      const result = handleRemoveItem([], 'Nonexistent');
      expect(result).toEqual([]);
    });

    it('should remove multiple items sequentially', () => {
      let items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      
      items = handleRemoveItem(items, 'Item 2');
      expect(items).toEqual(['Item 1', 'Item 3', 'Item 4']);
      
      items = handleRemoveItem(items, 'Item 4');
      expect(items).toEqual(['Item 1', 'Item 3']);
      
      items = handleRemoveItem(items, 'Item 1');
      expect(items).toEqual(['Item 3']);
    });
  });

  describe('handleRemoveItem - Non-existent Items', () => {
    it('should return unchanged array when item not found', () => {
      const items = ['Item 1', 'Item 2'];
      const result = handleRemoveItem(items, 'Item 3');
      expect(result).toEqual(['Item 1', 'Item 2']);
    });

    it('should handle removing non-existent item from empty array', () => {
      const result = handleRemoveItem([], 'Any Item');
      expect(result).toEqual([]);
    });

    it('should handle case-sensitive removal', () => {
      const items = ['Magnifying Glass'];
      const result = handleRemoveItem(items, 'magnifying glass');
      // Assuming case-sensitive comparison
      expect(result).toEqual(['Magnifying Glass']); // Not removed
    });
  });

  describe('handleRemoveItem - Duplicate Items', () => {
    it('should remove all instances of duplicate item', () => {
      const items = ['Item 1', 'Item 2', 'Item 1', 'Item 3', 'Item 1'];
      const result = handleRemoveItem(items, 'Item 1');
      expect(result).toEqual(['Item 2', 'Item 3']);
    });

    it('should remove only matching items, leave others', () => {
      const items = ['A', 'B', 'A', 'C', 'A'];
      const result = handleRemoveItem(items, 'A');
      expect(result).toEqual(['B', 'C']);
    });
  });

  describe('handleRemoveItem - Immutability', () => {
    it('should not mutate original array', () => {
      const original = ['Item 1', 'Item 2', 'Item 3'];
      const copy = [...original];
      
      const result = handleRemoveItem(original, 'Item 2');
      
      expect(original).toEqual(copy); // Original unchanged
      expect(result).toEqual(['Item 1', 'Item 3']);
    });

    it('should return new array reference', () => {
      const original = ['Item 1', 'Item 2'];
      const result = handleRemoveItem(original, 'Item 2');
      
      expect(result).not.toBe(original); // Different reference
      expect(result).toEqual(['Item 1']);
    });
  });

  describe('Add/Remove Integration', () => {
    it('should handle add then remove sequence', () => {
      let items: string[] = ['Item 1'];
      
      items = handleAddItem(items, 'Item 2') || items;
      expect(items).toEqual(['Item 1', 'Item 2']);
      
      items = handleRemoveItem(items, 'Item 1');
      expect(items).toEqual(['Item 2']);
    });

    it('should handle remove then add sequence', () => {
      let items = ['Item 1', 'Item 2'];
      
      items = handleRemoveItem(items, 'Item 2');
      expect(items).toEqual(['Item 1']);
      
      items = handleAddItem(items, 'Item 2') || items;
      expect(items).toEqual(['Item 1', 'Item 2']);
    });

    it('should handle add-remove-add same item', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, 'Item') || items;
      expect(items).toEqual(['Item']);
      
      items = handleRemoveItem(items, 'Item');
      expect(items).toEqual([]);
      
      items = handleAddItem(items, 'Item') || items;
      expect(items).toEqual(['Item']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with special characters', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, "Item's Name") || items;
      expect(items).toEqual(["Item's Name"]);
      
      items = handleRemoveItem(items, "Item's Name");
      expect(items).toEqual([]);
    });

    it('should handle items with unicode', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, 'Café') || items;
      expect(items).toEqual(['Café']);
      
      items = handleRemoveItem(items, 'Café');
      expect(items).toEqual([]);
    });

    it('should handle very long item names', () => {
      const longName = 'A'.repeat(1000);
      let items: string[] = [];
      
      items = handleAddItem(items, longName) || items;
      expect(items).toEqual([longName]);
      
      items = handleRemoveItem(items, longName);
      expect(items).toEqual([]);
    });

    it('should not add empty string as item name', () => {
      let items: string[] = [];
      
      // Empty string should not be added (truthy check)
      const result = handleAddItem(items, '');
      expect(result).toBeNull(); // Empty string is falsy in if condition
      expect(items).toEqual([]); // Array unchanged
      
      // If empty string somehow existed in array, should be removable
      items = [''];
      items = handleRemoveItem(items, '');
      expect(items).toEqual([]);
    });

    it('should handle whitespace-only item names', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, '   ') || items;
      expect(items).toEqual(['   ']);
      
      items = handleRemoveItem(items, '   ');
      expect(items).toEqual([]);
    });

    it('should handle numeric-looking strings', () => {
      let items: string[] = [];
      
      items = handleAddItem(items, '123') || items;
      expect(items).toEqual(['123']);
      
      items = handleRemoveItem(items, '123');
      expect(items).toEqual([]);
    });
  });

  describe('Realistic Game Scenarios', () => {
    it('should handle adding game items', () => {
      let items: string[] = [];
      
      const gameItems = ['Magnifying Glass', '38 Revolver', 'Lucky Charm'];
      
      gameItems.forEach(item => {
        items = handleAddItem(items, item) || items;
      });
      
      expect(items).toEqual(gameItems);
    });

    it('should handle removing abilities during gameplay', () => {
      let abilities = ['Combat Training', 'Scholar', 'Resourceful'];
      
      abilities = handleRemoveItem(abilities, 'Scholar');
      expect(abilities).toEqual(['Combat Training', 'Resourceful']);
    });

    it('should prevent duplicate abilities', () => {
      let abilities = ['Combat Training'];
      
      const result = handleAddItem(abilities, 'Combat Training');
      expect(result).toBeNull(); // Duplicate prevented
      expect(abilities).toEqual(['Combat Training']); // Unchanged
    });

    it('should handle managing secrets found', () => {
      let secrets: string[] = [];
      
      // Find secrets during gameplay
      secrets = handleAddItem(secrets, 'The Hidden Passage') || secrets;
      secrets = handleAddItem(secrets, 'The Dark Ritual') || secrets;
      secrets = handleAddItem(secrets, 'The Ancient Key') || secrets;
      
      expect(secrets).toHaveLength(3);
      
      // Cannot add duplicate secret
      const duplicate = handleAddItem(secrets, 'The Hidden Passage');
      expect(duplicate).toBeNull();
    });

    it('should handle full item management workflow', () => {
      let items: string[] = [];
      
      // Start with basic items
      items = handleAddItem(items, 'Flashlight') || items;
      items = handleAddItem(items, 'First Aid Kit') || items;
      expect(items).toEqual(['Flashlight', 'First Aid Kit']);
      
      // Find new item
      items = handleAddItem(items, 'Ancient Tome') || items;
      expect(items).toEqual(['Flashlight', 'First Aid Kit', 'Ancient Tome']);
      
      // Lose item
      items = handleRemoveItem(items, 'Flashlight');
      expect(items).toEqual(['First Aid Kit', 'Ancient Tome']);
      
      // Find another item
      items = handleAddItem(items, 'Magnifying Glass') || items;
      expect(items).toEqual(['First Aid Kit', 'Ancient Tome', 'Magnifying Glass']);
      
      // Try to add duplicate
      const dup = handleAddItem(items, 'Ancient Tome');
      expect(dup).toBeNull();
      expect(items).toEqual(['First Aid Kit', 'Ancient Tome', 'Magnifying Glass']);
    });
  });

  describe('Array Size Limits', () => {
    it('should handle adding to large array', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const result = handleAddItem(largeArray, 'New Item');
      
      expect(result).toHaveLength(101);
      expect(result?.[100]).toBe('New Item');
    });

    it('should handle removing from large array', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const result = handleRemoveItem(largeArray, 'Item 50');
      
      expect(result).toHaveLength(99);
      expect(result).not.toContain('Item 50');
    });

    it('should handle removing multiple items from large array', () => {
      let items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      
      for (let i = 0; i < 10; i++) {
        items = handleRemoveItem(items, `Item ${i}`);
      }
      
      expect(items).toHaveLength(90);
    });
  });
});
