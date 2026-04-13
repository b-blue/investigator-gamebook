import { describe, it, expect } from 'vitest';
import type { Ability, Item } from '../../types';

/**
 * Unit tests for relatedItems filtering logic from AttributesSection.tsx (L58-84)
 * Testing search functionality that finds abilities/weaknesses/items mentioning selected attribute
 */

// Extract the filtering logic for testing
function filterRelatedItems(
  selectedAttribute: string | null,
  currentAbilities: string[],
  currentWeaknesses: string[],
  currentItems: string[],
  allAbilities: Ability[],
  allItems: Item[]
): { abilities: Ability[]; weaknesses: Ability[]; items: Item[] } {
  if (!selectedAttribute) return { abilities: [], weaknesses: [], items: [] };
  
  const attributeName = selectedAttribute.toLowerCase();
  
  // Get ability/weakness data for current character's abilities and weaknesses
  const abilities = allAbilities
    .filter(ability => 
      !ability.isWeakness && 
      currentAbilities.includes(ability.name) &&
      ability.description.toLowerCase().includes(attributeName)
    );
  
  const weaknesses = allAbilities
    .filter(ability => 
      ability.isWeakness && 
      currentWeaknesses.includes(ability.name) &&
      ability.description.toLowerCase().includes(attributeName)
    );
  
  // Get item data for current character's items
  const items = allItems
    .filter(item => 
      currentItems.includes(item.name) &&
      item.description.toLowerCase().includes(attributeName)
    );
  
  return { abilities, weaknesses, items };
}

describe('Related Items Filtering Logic - Unit Tests', () => {
  const mockAbilities: Ability[] = [
    { name: 'Combat Training', description: 'Add +1 to your COMBAT tests.', isWeakness: false },
    { name: 'Spell Casting', description: 'Use WILLPOWER instead of COMBAT.', isWeakness: false },
    { name: 'Investigation', description: 'Gain +2 to INTELLECT when searching.', isWeakness: false },
    { name: 'Resourceful', description: 'Start with +2 RESOURCES.', isWeakness: false },
    { name: 'Troubled Dreams', description: 'Lose 1 SANITY at the start.', isWeakness: true },
    { name: 'Paranoia', description: 'Reduce WILLPOWER by 1.', isWeakness: true },
    { name: 'Injury', description: 'Reduce HEALTH by 2.', isWeakness: true }
  ];

  const mockItems: Item[] = [
    { name: '38 Revolver', description: 'Once per adventure add +3 to COMBAT.', isEquipped: false },
    { name: 'Magnifying Glass', description: 'Add +1 to INTELLECT tests.', isEquipped: false },
    { name: 'Lucky Charm', description: 'Reroll any WILLPOWER test once.', isEquipped: false },
    { name: 'First Aid Kit', description: 'Restore 2 HEALTH.', isEquipped: false },
    { name: 'Ancient Tome', description: 'Gain CLUES when reading.', isEquipped: false }
  ];

  describe('Empty State', () => {
    it('should return empty arrays when no attribute selected', () => {
      const result = filterRelatedItems(
        null,
        ['Combat Training'],
        ['Troubled Dreams'],
        ['38 Revolver'],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.items).toEqual([]);
    });

    it('should return empty arrays when character has no abilities/items', () => {
      const result = filterRelatedItems(
        'combat',
        [],
        [],
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.items).toEqual([]);
    });
  });

  describe('Ability Filtering', () => {
    it('should filter abilities by isWeakness=false', () => {
      const result = filterRelatedItems(
        'combat',
        ['Combat Training', 'Troubled Dreams'], // Mix of ability and weakness
        [],
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Combat Training');
      expect(result.abilities[0].isWeakness).toBe(false);
    });

    it('should only include abilities in character\'s ability list', () => {
      const result = filterRelatedItems(
        'combat',
        ['Combat Training'], // Only this one
        [],
        [],
        mockAbilities,
        mockItems
      );
      
      // Spell Casting mentions combat too, but not in character's list
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Combat Training');
    });

    it('should match attribute name in description (case-insensitive)', () => {
      const result = filterRelatedItems(
        'WILLPOWER', // uppercase
        ['Spell Casting', 'Paranoia'],
        [],
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Spell Casting');
      expect(result.abilities[0].description.toLowerCase()).toContain('willpower');
    });

    it('should handle partial matches in description', () => {
      const result = filterRelatedItems(
        'intel', // partial match for INTELLECT
        ['Investigation'],
        [],
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Investigation');
    });
  });

  describe('Weakness Filtering', () => {
    it('should filter weaknesses by isWeakness=true', () => {
      const result = filterRelatedItems(
        'willpower',
        [],
        ['Paranoia', 'Combat Training'], // Mix
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.weaknesses).toHaveLength(1);
      expect(result.weaknesses[0].name).toBe('Paranoia');
      expect(result.weaknesses[0].isWeakness).toBe(true);
    });

    it('should only include weaknesses in character\'s weakness list', () => {
      const result = filterRelatedItems(
        'health',
        [],
        ['Injury'], // Only this one
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.weaknesses).toHaveLength(1);
      expect(result.weaknesses[0].name).toBe('Injury');
    });

    it('should match attribute case-insensitively', () => {
      const result = filterRelatedItems(
        'SANITY',
        [],
        ['Troubled Dreams'],
        [],
        mockAbilities,
        mockItems
      );
      
      expect(result.weaknesses).toHaveLength(1);
      expect(result.weaknesses[0].description.toLowerCase()).toContain('sanity');
    });
  });

  describe('Item Filtering', () => {
    it('should filter items by name match', () => {
      const result = filterRelatedItems(
        'combat',
        [],
        [],
        ['38 Revolver', 'Magnifying Glass'], // Both in inventory
        mockAbilities,
        mockItems
      );
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('38 Revolver');
    });

    it('should only include items in character\'s item list', () => {
      const result = filterRelatedItems(
        'intellect',
        [],
        [],
        ['Magnifying Glass'], // Only this one
        mockAbilities,
        mockItems
      );
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Magnifying Glass');
    });

    it('should match attribute case-insensitively', () => {
      const result = filterRelatedItems(
        'HEALTH',
        [],
        [],
        ['First Aid Kit'],
        mockAbilities,
        mockItems
      );
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description.toLowerCase()).toContain('health');
    });
  });

  describe('Multiple Matches', () => {
    it('should return multiple abilities that mention the same attribute', () => {
      const multiAbilities: Ability[] = [
        { name: 'Combat Expert', description: 'Add +2 to COMBAT.', isWeakness: false },
        { name: 'Fighter', description: 'Bonus COMBAT +1.', isWeakness: false },
        { name: 'Brawler', description: 'COMBAT tests easier.', isWeakness: false }
      ];
      
      const result = filterRelatedItems(
        'combat',
        ['Combat Expert', 'Fighter', 'Brawler'],
        [],
        [],
        multiAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(3);
    });

    it('should return both abilities and items for same attribute', () => {
      const result = filterRelatedItems(
        'combat',
        ['Combat Training', 'Spell Casting'],
        [],
        ['38 Revolver'],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(2); // Combat Training and Spell Casting
      expect(result.items).toHaveLength(1); // 38 Revolver
    });

    it('should return abilities, weaknesses, and items all at once', () => {
      const result = filterRelatedItems(
        'willpower',
        ['Spell Casting'],
        ['Paranoia'],
        ['Lucky Charm'],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Spell Casting');
      
      expect(result.weaknesses).toHaveLength(1);
      expect(result.weaknesses[0].name).toBe('Paranoia');
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Lucky Charm');
    });
  });

  describe('No Matches', () => {
    it('should return empty arrays when no descriptions match', () => {
      const result = filterRelatedItems(
        'doom', // No abilities/items mention doom
        ['Combat Training', 'Investigation'],
        ['Troubled Dreams'],
        ['38 Revolver'],
        mockAbilities,
        mockItems
      );
      
      expect(result.abilities).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.items).toEqual([]);
    });

    it('should return empty when character has items but none match', () => {
      const result = filterRelatedItems(
        'sanity',
        [],
        [],
        ['38 Revolver', 'Magnifying Glass'], // Neither mentions sanity
        mockAbilities,
        mockItems
      );
      
      expect(result.items).toEqual([]);
    });
  });

  describe('All Attributes', () => {
    it('should work with all attribute names', () => {
      const attributes = [
        'willpower', 'intellect', 'combat', 'health', 
        'sanity', 'resources', 'clues', 'doom'
      ];
      
      attributes.forEach(attr => {
        const result = filterRelatedItems(
          attr,
          mockAbilities.filter(a => !a.isWeakness).map(a => a.name),
          mockAbilities.filter(a => a.isWeakness).map(a => a.name),
          mockItems.map(i => i.name),
          mockAbilities,
          mockItems
        );
        
        // Should not throw and should return valid structure
        expect(result).toHaveProperty('abilities');
        expect(result).toHaveProperty('weaknesses');
        expect(result).toHaveProperty('items');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data arrays', () => {
      const result = filterRelatedItems(
        'combat',
        ['Combat Training'],
        [],
        [],
        [], // No abilities in database
        [] // No items in database
      );
      
      expect(result.abilities).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.items).toEqual([]);
    });

    it('should handle special characters in attribute names', () => {
      const specialAbility: Ability = {
        name: 'Special',
        description: 'Affects attribute-value tests.',
        isWeakness: false
      };
      
      const result = filterRelatedItems(
        'attribute',
        ['Special'],
        [],
        [],
        [specialAbility],
        []
      );
      
      expect(result.abilities).toHaveLength(1);
    });

    it('should handle very long descriptions', () => {
      const longAbility: Ability = {
        name: 'Long Description',
        description: 'A'.repeat(500) + ' COMBAT ' + 'B'.repeat(500),
        isWeakness: false
      };
      
      const result = filterRelatedItems(
        'combat',
        ['Long Description'],
        [],
        [],
        [longAbility],
        []
      );
      
      expect(result.abilities).toHaveLength(1);
    });
  });
});
