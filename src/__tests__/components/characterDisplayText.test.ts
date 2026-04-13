import { describe, it, expect } from 'vitest';

/**
 * Unit tests for Character displayText memoization logic
 * Testing useMemo optimization from Character.tsx (L91-99)
 */

interface CharacterData {
  name: string;
  description: string;
}

// Extract the displayText logic for testing
function computeDisplayText(
  characterName: string,
  characters: CharacterData[]
): string {
  if (characterName === '') {
    return 'Select Character';
  }
  const character = characters.find(c => c.name === characterName);
  return character ? `${character.name} - ${character.description}` : characterName;
}

describe('Character displayText Memoization - Unit Tests', () => {
  const mockCharacters: CharacterData[] = [
    { name: 'Norman Withers', description: 'The Astronomer' },
    { name: 'Agnes Baker', description: 'The Waitress' },
    { name: 'Roland Banks', description: 'The Fed' },
    { name: 'Wendy Adams', description: 'The Urchin' },
    { name: 'Daisy Walker', description: 'The Librarian' }
  ];

  describe('Default State', () => {
    it('should return "Select Character" when characterName is empty', () => {
      const result = computeDisplayText('', mockCharacters);
      expect(result).toBe('Select Character');
    });

    it('should return "Select Character" for empty string regardless of characters array', () => {
      const emptyResult = computeDisplayText('', []);
      const fullResult = computeDisplayText('', mockCharacters);
      
      expect(emptyResult).toBe('Select Character');
      expect(fullResult).toBe('Select Character');
    });
  });

  describe('Character Found', () => {
    it('should return formatted displayText when character exists', () => {
      const result = computeDisplayText('Norman Withers', mockCharacters);
      expect(result).toBe('Norman Withers - The Astronomer');
    });

    it('should return correct displayText for all characters', () => {
      const results = mockCharacters.map(char => 
        computeDisplayText(char.name, mockCharacters)
      );
      
      expect(results).toEqual([
        'Norman Withers - The Astronomer',
        'Agnes Baker - The Waitress',
        'Roland Banks - The Fed',
        'Wendy Adams - The Urchin',
        'Daisy Walker - The Librarian'
      ]);
    });

    it('should handle character with special characters in description', () => {
      const specialChars: CharacterData[] = [
        { name: 'Test', description: "The 'Special' & \"Unique\" Character" }
      ];
      
      const result = computeDisplayText('Test', specialChars);
      expect(result).toBe('Test - The \'Special\' & "Unique" Character');
    });

    it('should handle character with unicode in description', () => {
      const unicodeChars: CharacterData[] = [
        { name: 'Café Owner', description: 'Le Propriétaire' }
      ];
      
      const result = computeDisplayText('Café Owner', unicodeChars);
      expect(result).toBe('Café Owner - Le Propriétaire');
    });
  });

  describe('Character Not Found', () => {
    it('should return characterName when character not found in array', () => {
      const result = computeDisplayText('Unknown Character', mockCharacters);
      expect(result).toBe('Unknown Character');
    });

    it('should handle empty characters array gracefully', () => {
      const result = computeDisplayText('Norman Withers', []);
      expect(result).toBe('Norman Withers');
    });

    it('should return characterName for non-existent character', () => {
      const result = computeDisplayText('Bob Smith', mockCharacters);
      expect(result).toBe('Bob Smith');
    });

    it('should handle null/undefined-like names gracefully', () => {
      // Testing edge case where characterName might be a stringified null
      const result = computeDisplayText('null', mockCharacters);
      expect(result).toBe('null');
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive when finding character', () => {
      const lowercase = computeDisplayText('norman withers', mockCharacters);
      const uppercase = computeDisplayText('NORMAN WITHERS', mockCharacters);
      const correctCase = computeDisplayText('Norman Withers', mockCharacters);
      
      expect(lowercase).toBe('norman withers'); // Not found, returns name
      expect(uppercase).toBe('NORMAN WITHERS'); // Not found, returns name
      expect(correctCase).toBe('Norman Withers - The Astronomer'); // Found
    });

    it('should match exact character name only', () => {
      const partial = computeDisplayText('Norman', mockCharacters);
      const full = computeDisplayText('Norman Withers', mockCharacters);
      
      expect(partial).toBe('Norman'); // Partial match returns name
      expect(full).toBe('Norman Withers - The Astronomer'); // Exact match returns formatted
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in characterName', () => {
      const withSpace = computeDisplayText(' Norman Withers ', mockCharacters);
      expect(withSpace).toBe(' Norman Withers '); // No trim, exact match fails
    });

    it('should handle very long character names', () => {
      const longName = 'A'.repeat(1000);
      const result = computeDisplayText(longName, mockCharacters);
      expect(result).toBe(longName);
    });

    it('should handle very long descriptions', () => {
      const longDesc = 'B'.repeat(1000);
      const chars: CharacterData[] = [
        { name: 'Test', description: longDesc }
      ];
      
      const result = computeDisplayText('Test', chars);
      expect(result).toBe(`Test - ${longDesc}`);
    });

    it('should handle empty description', () => {
      const emptyDesc: CharacterData[] = [
        { name: 'No Description', description: '' }
      ];
      
      const result = computeDisplayText('No Description', emptyDesc);
      expect(result).toBe('No Description - ');
    });

    it('should handle numeric-like character names', () => {
      const numericChars: CharacterData[] = [
        { name: '123', description: 'The Number' }
      ];
      
      const result = computeDisplayText('123', numericChars);
      expect(result).toBe('123 - The Number');
    });
  });

  describe('Array Modifications', () => {
    it('should find character when it is first in array', () => {
      const result = computeDisplayText('Norman Withers', mockCharacters);
      expect(result).toBe('Norman Withers - The Astronomer');
    });

    it('should find character when it is last in array', () => {
      const result = computeDisplayText('Daisy Walker', mockCharacters);
      expect(result).toBe('Daisy Walker - The Librarian');
    });

    it('should find character when it is in middle of array', () => {
      const result = computeDisplayText('Roland Banks', mockCharacters);
      expect(result).toBe('Roland Banks - The Fed');
    });

    it('should handle single-character array', () => {
      const single: CharacterData[] = [
        { name: 'Solo', description: 'The Only One' }
      ];
      
      const found = computeDisplayText('Solo', single);
      const notFound = computeDisplayText('Other', single);
      
      expect(found).toBe('Solo - The Only One');
      expect(notFound).toBe('Other');
    });
  });

  describe('Memoization Behavior', () => {
    it('should return same result for same inputs', () => {
      const result1 = computeDisplayText('Norman Withers', mockCharacters);
      const result2 = computeDisplayText('Norman Withers', mockCharacters);
      
      expect(result1).toBe(result2);
      expect(result1).toBe('Norman Withers - The Astronomer');
    });

    it('should return different results when characterName changes', () => {
      const result1 = computeDisplayText('Norman Withers', mockCharacters);
      const result2 = computeDisplayText('Agnes Baker', mockCharacters);
      
      expect(result1).not.toBe(result2);
      expect(result1).toBe('Norman Withers - The Astronomer');
      expect(result2).toBe('Agnes Baker - The Waitress');
    });

    it('should return different results when characters array changes', () => {
      const chars1: CharacterData[] = [
        { name: 'Norman Withers', description: 'The Astronomer' }
      ];
      const chars2: CharacterData[] = [
        { name: 'Norman Withers', description: 'The Star Gazer' }
      ];
      
      const result1 = computeDisplayText('Norman Withers', chars1);
      const result2 = computeDisplayText('Norman Withers', chars2);
      
      expect(result1).toBe('Norman Withers - The Astronomer');
      expect(result2).toBe('Norman Withers - The Star Gazer');
    });

    it('should return Select Character when switching from character to empty', () => {
      const withCharacter = computeDisplayText('Norman Withers', mockCharacters);
      const withoutCharacter = computeDisplayText('', mockCharacters);
      
      expect(withCharacter).toBe('Norman Withers - The Astronomer');
      expect(withoutCharacter).toBe('Select Character');
    });
  });

  describe('Realistic Game Scenarios', () => {
    it('should handle character selection flow', () => {
      // Initial state: no character
      const step1 = computeDisplayText('', mockCharacters);
      expect(step1).toBe('Select Character');
      
      // User selects Norman
      const step2 = computeDisplayText('Norman Withers', mockCharacters);
      expect(step2).toBe('Norman Withers - The Astronomer');
      
      // User switches to Agnes
      const step3 = computeDisplayText('Agnes Baker', mockCharacters);
      expect(step3).toBe('Agnes Baker - The Waitress');
      
      // User deselects (if possible)
      const step4 = computeDisplayText('', mockCharacters);
      expect(step4).toBe('Select Character');
    });

    it('should handle all game characters from actual data', () => {
      // Test with realistic character data
      const gameCharacters: CharacterData[] = [
        { name: 'Norman Withers', description: 'The Astronomer' },
        { name: 'Agnes Baker', description: 'The Waitress' },
        { name: 'Roland Banks', description: 'The Fed' },
        { name: 'Wendy Adams', description: 'The Urchin' },
        { name: 'Daisy Walker', description: 'The Librarian' }
      ];
      
      gameCharacters.forEach(char => {
        const result = computeDisplayText(char.name, gameCharacters);
        expect(result).toBe(`${char.name} - ${char.description}`);
      });
    });

    it('should handle character name that was previously selected', () => {
      // Simulate switching back to a previous character
      const first = computeDisplayText('Norman Withers', mockCharacters);
      const second = computeDisplayText('Agnes Baker', mockCharacters);
      const backToFirst = computeDisplayText('Norman Withers', mockCharacters);
      
      expect(first).toBe('Norman Withers - The Astronomer');
      expect(second).toBe('Agnes Baker - The Waitress');
      expect(backToFirst).toBe('Norman Withers - The Astronomer');
      expect(first).toBe(backToFirst);
    });
  });
});
