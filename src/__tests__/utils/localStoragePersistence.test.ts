import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AppState } from '../../App';

/**
 * Unit tests for localStorage persistence logic
 * Testing round-trip save/load and data integrity
 */

const STORAGE_KEY = 'arkhamGamebookState';

describe('localStorage Persistence - Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Save State to localStorage', () => {
    it('should save state to localStorage with correct key', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!)).toEqual(mockState);
    });

    it('should save complete character state', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Norman Withers',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 5, max: 5 },
            combat: { current: 2, max: 2 },
            health: { current: 6, max: 6 },
            sanity: { current: 8, max: 8 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: ['Magnifying Glass'],
          abilities: ['Scholar'],
          weaknesses: ['Paranoid'],
          secrets: []
        },
        currentCharacterName: 'Norman Withers',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 3 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      
      expect(parsed.currentCharacter.name).toBe('Norman Withers');
      expect(parsed.currentCharacter.attributes.willpower.current).toBe(4);
      expect(parsed.currentCharacter.items).toContain('Magnifying Glass');
    });

    it('should save completedRuns array', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [
          {
            characterName: 'Norman Withers',
            campaign: 'TDA',
            timestamp: 1234567890,
            secretsFound: ['Secret 1', 'Secret 2']
          }
        ],
        foundSecrets: ['Secret 1'],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      
      expect(parsed.completedRuns).toHaveLength(1);
      expect(parsed.completedRuns[0].characterName).toBe('Norman Withers');
      expect(parsed.completedRuns[0].secretsFound).toEqual(['Secret 1', 'Secret 2']);
    });

    it('should save foundSecrets array', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: ['The Hidden Passage', 'The Dark Ritual'],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      
      expect(parsed.foundSecrets).toHaveLength(2);
      expect(parsed.foundSecrets).toContain('The Hidden Passage');
    });

    it('should save shared state', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 5 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(saved!);
      
      expect(parsed.shared.diceRoll).toBe(5);
    });
  });

  describe('Load State from localStorage', () => {
    it('should load state from localStorage', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsed: AppState = JSON.parse(loaded!);
      
      expect(parsed).toEqual(mockState);
    });

    it('should return null when no state exists', () => {
      const loaded = localStorage.getItem(STORAGE_KEY);
      expect(loaded).toBeNull();
    });

    it('should load character state correctly', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Agnes Baker',
          attributes: {
            willpower: { current: 5, max: 5 },
            intellect: { current: 2, max: 2 },
            combat: { current: 2, max: 2 },
            health: { current: 6, max: 6 },
            sanity: { current: 8, max: 8 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: ['Spell Casting'],
          abilities: ['Mystic'],
          weaknesses: ['Dark Memory'],
          secrets: ['Secret 1']
        },
        currentCharacterName: 'Agnes Baker',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsed: AppState = JSON.parse(loaded!);
      
      expect(parsed.currentCharacter?.name).toBe('Agnes Baker');
      expect(parsed.currentCharacter?.attributes.willpower.current).toBe(5);
      expect(parsed.currentCharacter?.secrets).toContain('Secret 1');
    });

    it('should load completedRuns array', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [
          {
            characterName: 'Norman Withers',
            campaign: 'TDA',
            timestamp: 1234567890,
            secretsFound: ['Secret 1']
          },
          {
            characterName: 'Agnes Baker',
            campaign: 'TTI',
            timestamp: 1234567891,
            secretsFound: ['Secret 2', 'Secret 3']
          }
        ],
        foundSecrets: ['Secret 1', 'Secret 2', 'Secret 3'],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      
      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsed: AppState = JSON.parse(loaded!);
      
      expect(parsed.completedRuns).toHaveLength(2);
      expect(parsed.completedRuns[0].campaign).toBe('TDA');
      expect(parsed.completedRuns[1].campaign).toBe('TTI');
    });
  });

  describe('Round-Trip Persistence', () => {
    it('should maintain data fidelity through save/load cycle', () => {
      const originalState: AppState = {
        currentCharacter: {
          name: 'Norman Withers',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 5, max: 5 },
            combat: { current: 2, max: 2 },
            health: { current: 6, max: 6 },
            sanity: { current: 8, max: 8 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: ['Magnifying Glass', 'Ancient Tome'],
          abilities: ['Scholar', 'Researcher'],
          weaknesses: ['Paranoid'],
          secrets: ['Secret 1', 'Secret 2']
        },
        currentCharacterName: 'Norman Withers',
        completedRuns: [
          {
            characterName: 'Agnes Baker',
            campaign: 'TTI',
            timestamp: 1234567890,
            secretsFound: ['Secret 3']
          }
        ],
        foundSecrets: ['Secret 1', 'Secret 2', 'Secret 3'],
        shared: { diceRoll: 4 }
      };

      // Save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(originalState));
      
      // Load
      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsedState: AppState = JSON.parse(loaded!);
      
      // Verify exact match
      expect(parsedState).toEqual(originalState);
    });

    it('should handle multiple save/load cycles', () => {
      const state1: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 1 }
      };

      // Cycle 1
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state1));
      let loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(loaded.shared.diceRoll).toBe(1);

      // Cycle 2
      const state2 = { ...loaded, shared: { diceRoll: 2 } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state2));
      loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(loaded.shared.diceRoll).toBe(2);

      // Cycle 3
      const state3 = { ...loaded, shared: { diceRoll: 3 } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state3));
      loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(loaded.shared.diceRoll).toBe(3);
    });

    it('should preserve array ordering', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Test',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 4, max: 4 },
            combat: { current: 4, max: 4 },
            health: { current: 6, max: 6 },
            sanity: { current: 6, max: 6 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: ['Item 1', 'Item 2', 'Item 3'],
          abilities: ['Ability 1', 'Ability 2'],
          weaknesses: ['Weakness 1'],
          secrets: ['Secret 3', 'Secret 1', 'Secret 2'] // Non-alphabetical order
        },
        currentCharacterName: 'Test',
        completedRuns: [],
        foundSecrets: ['Secret 3', 'Secret 1', 'Secret 2'],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter.secrets).toEqual(['Secret 3', 'Secret 1', 'Secret 2']);
      expect(loaded.foundSecrets).toEqual(['Secret 3', 'Secret 1', 'Secret 2']);
    });

    it('should preserve nested object structure', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Test',
          attributes: {
            willpower: { current: 3, max: 5 },
            intellect: { current: 4, max: 4 },
            combat: { current: 1, max: 2 },
            health: { current: 5, max: 6 },
            sanity: { current: 7, max: 8 },
            resources: { current: 2, max: 4 },
            clues: { current: 3, max: 5 },
            doom: { current: 1, max: 10 }
          },
          items: [],
          abilities: [],
          weaknesses: [],
          secrets: []
        },
        currentCharacterName: 'Test',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter.attributes.willpower).toEqual({ current: 3, max: 5 });
      expect(loaded.currentCharacter.attributes.health).toEqual({ current: 5, max: 6 });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty state', () => {
      const emptyState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter).toBeNull();
      expect(loaded.completedRuns).toEqual([]);
      expect(loaded.foundSecrets).toEqual([]);
    });

    it('should handle state with empty arrays', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Test',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 4, max: 4 },
            combat: { current: 4, max: 4 },
            health: { current: 6, max: 6 },
            sanity: { current: 6, max: 6 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: [],
          abilities: [],
          weaknesses: [],
          secrets: []
        },
        currentCharacterName: 'Test',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter.items).toEqual([]);
      expect(loaded.completedRuns).toEqual([]);
    });

    it('should handle large state objects', () => {
      const largeState: AppState = {
        currentCharacter: {
          name: 'Test',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 4, max: 4 },
            combat: { current: 4, max: 4 },
            health: { current: 6, max: 6 },
            sanity: { current: 6, max: 6 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: Array.from({ length: 50 }, (_, i) => `Item ${i}`),
          abilities: Array.from({ length: 30 }, (_, i) => `Ability ${i}`),
          weaknesses: Array.from({ length: 20 }, (_, i) => `Weakness ${i}`),
          secrets: Array.from({ length: 100 }, (_, i) => `Secret ${i}`)
        },
        currentCharacterName: 'Test',
        completedRuns: Array.from({ length: 50 }, (_, i) => ({
          characterName: `Character ${i}`,
          campaign: i % 3 === 0 ? 'TDA' : i % 3 === 1 ? 'TTI' : 'TKM',
          timestamp: 1234567890 + i,
          secretsFound: [`Secret ${i}`]
        })),
        foundSecrets: Array.from({ length: 100 }, (_, i) => `Secret ${i}`),
        shared: { diceRoll: 6 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(largeState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter.items).toHaveLength(50);
      expect(loaded.completedRuns).toHaveLength(50);
      expect(loaded.foundSecrets).toHaveLength(100);
    });

    it('should handle special characters in strings', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: "Dr. Blaine's Character",
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 4, max: 4 },
            combat: { current: 4, max: 4 },
            health: { current: 6, max: 6 },
            sanity: { current: 6, max: 6 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: ['Item with "quotes"', 'Item with \'apostrophes\''],
          abilities: ['Ability with \nnewline'],
          weaknesses: ['Weakness with \\backslash'],
          secrets: []
        },
        currentCharacterName: "Dr. Blaine's Character",
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter.name).toBe("Dr. Blaine's Character");
      expect(loaded.currentCharacter.items[0]).toBe('Item with "quotes"');
    });

    it('should overwrite previous state on save', () => {
      const state1: AppState = {
        currentCharacter: null,
        currentCharacterName: 'Character 1',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 1 }
      };

      const state2: AppState = {
        currentCharacter: null,
        currentCharacterName: 'Character 2',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 2 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state1));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state2));
      
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(loaded.currentCharacterName).toBe('Character 2');
      expect(loaded.shared.diceRoll).toBe(2);
    });

    it('should handle clearing localStorage', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
      
      localStorage.clear();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle removing specific key', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      localStorage.setItem('otherKey', 'otherValue');
      
      localStorage.removeItem(STORAGE_KEY);
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem('otherKey')).toBe('otherValue');
    });
  });

  describe('Data Type Preservation', () => {
    it('should preserve number types', () => {
      const mockState: AppState = {
        currentCharacter: {
          name: 'Test',
          attributes: {
            willpower: { current: 4, max: 4 },
            intellect: { current: 5, max: 5 },
            combat: { current: 2, max: 2 },
            health: { current: 6, max: 6 },
            sanity: { current: 8, max: 8 },
            resources: { current: 4, max: 4 },
            clues: { current: 0, max: 0 },
            doom: { current: 0, max: 0 }
          },
          items: [],
          abilities: [],
          weaknesses: [],
          secrets: []
        },
        currentCharacterName: 'Test',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 5 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(typeof loaded.currentCharacter.attributes.willpower.current).toBe('number');
      expect(typeof loaded.shared.diceRoll).toBe('number');
    });

    it('should preserve string types', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: 'Norman Withers',
        completedRuns: [],
        foundSecrets: ['Secret 1'],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(typeof loaded.currentCharacterName).toBe('string');
      expect(typeof loaded.foundSecrets[0]).toBe('string');
    });

    it('should preserve null values', () => {
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(loaded.currentCharacter).toBeNull();
    });

    it('should preserve timestamps as numbers', () => {
      const timestamp = Date.now();
      const mockState: AppState = {
        currentCharacter: null,
        currentCharacterName: '',
        completedRuns: [
          {
            characterName: 'Test',
            campaign: 'TDA',
            timestamp: timestamp,
            secretsFound: []
          }
        ],
        foundSecrets: [],
        shared: { diceRoll: 0 }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      
      expect(typeof loaded.completedRuns[0].timestamp).toBe('number');
      expect(loaded.completedRuns[0].timestamp).toBe(timestamp);
    });
  });
});
