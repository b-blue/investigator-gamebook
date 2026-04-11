import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_TEST_ATTRIBUTES } from '../fixtures/mockData';
import type { GameState, CompletedRun } from '../../types';

/**
 * Unit tests for the finish run logic extracted from App.tsx confirmFinishRun (L287-320)
 * Testing the state transformation logic in isolation without UI components
 */

// This is the core logic from confirmFinishRun that we're testing
function finishRunLogic(
  gameState: GameState,
  characterName: string,
  selectedStars: number
): GameState {
  const character = gameState.characters[characterName];
  const newCharacters = { ...gameState.characters };
  delete newCharacters[characterName];
  
  // Add character's secrets to foundSecrets (deduplication via Set)
  const currentFoundSecrets = gameState.foundSecrets;
  const newFoundSecrets = [...new Set([...currentFoundSecrets, ...(character?.secrets || [])])];
  
  // Create completed run entry
  const completedRun: CompletedRun = {
    characterName,
    timestamp: Date.now(),
    secrets: character?.secrets || [],
    stars: selectedStars
  };
  
  return {
    currentCharacterName: '',
    characters: newCharacters,
    foundSecrets: newFoundSecrets,
    bookmark: 0,
    completedRuns: [...gameState.completedRuns, completedRun]
  };
}

describe('Finish Run Logic - Unit Tests', () => {
  describe('Secret Deduplication', () => {
    it('should deduplicate secrets using Set when merging foundSecrets', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Secret 1', 'Secret 2', 'Secret 3']
          }
        },
        foundSecrets: ['Secret 1', 'Secret 4'], // Already have Secret 1
        bookmark: 42,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 3);
      
      // Should have all unique secrets: Secret 1, 2, 3, 4
      expect(result.foundSecrets).toHaveLength(4);
      expect(result.foundSecrets).toContain('Secret 1');
      expect(result.foundSecrets).toContain('Secret 2');
      expect(result.foundSecrets).toContain('Secret 3');
      expect(result.foundSecrets).toContain('Secret 4');
      
      // No duplicate Secret 1
      const secret1Count = result.foundSecrets.filter(s => s === 'Secret 1').length;
      expect(secret1Count).toBe(1);
    });

    it('should handle character with no new secrets', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: ['Secret 1', 'Secret 2'],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 2);
      
      // Should keep existing foundSecrets unchanged
      expect(result.foundSecrets).toEqual(['Secret 1', 'Secret 2']);
    });

    it('should handle all duplicate secrets', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Secret 1', 'Secret 2']
          }
        },
        foundSecrets: ['Secret 1', 'Secret 2', 'Secret 3'],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 4);
      
      // Should still have 3 unique secrets
      expect(result.foundSecrets).toHaveLength(3);
      expect(result.foundSecrets).toContain('Secret 1');
      expect(result.foundSecrets).toContain('Secret 2');
      expect(result.foundSecrets).toContain('Secret 3');
    });

    it('should preserve order when deduplicating', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['A', 'B', 'C']
          }
        },
        foundSecrets: ['X', 'Y', 'A'],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Test', 0);
      
      // Set preserves insertion order: X, Y, A (from foundSecrets), then B, C (new from character)
      expect(result.foundSecrets).toEqual(['X', 'Y', 'A', 'B', 'C']);
    });
  });

  describe('CompletedRun Creation', () => {
    it('should create CompletedRun with correct fields', () => {
      vi.setSystemTime(1234567890);
      
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Secret 1', 'Secret 2']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 3);
      
      expect(result.completedRuns).toHaveLength(1);
      
      const run = result.completedRuns[0];
      expect(run.characterName).toBe('Roland Banks');
      expect(run.timestamp).toBe(1234567890);
      expect(run.secrets).toEqual(['Secret 1', 'Secret 2']);
      expect(run.stars).toBe(3);
      
      vi.useRealTimers();
    });

    it('should append to existing completedRuns', () => {
      const existingRun: CompletedRun = {
        characterName: 'Agnes Baker',
        timestamp: 1111111111,
        secrets: ['Old Secret'],
        stars: 2
      };
      
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['New Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: [existingRun]
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 4);
      
      expect(result.completedRuns).toHaveLength(2);
      expect(result.completedRuns[0]).toEqual(existingRun);
      expect(result.completedRuns[1].characterName).toBe('Roland Banks');
    });

    it('should use current timestamp', () => {
      const beforeTime = Date.now();
      
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Test', 0);
      
      const afterTime = Date.now();
      
      expect(result.completedRuns[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.completedRuns[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should support all star ratings 0-4', () => {
      const createState = (): GameState => ({
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      });
      
      for (let stars = 0; stars <= 4; stars++) {
        const result = finishRunLogic(createState(), 'Test', stars);
        expect(result.completedRuns[0].stars).toBe(stars);
      }
    });
  });

  describe('Character Removal', () => {
    it('should remove character from characters map', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 0);
      
      expect(result.characters['Roland Banks']).toBeUndefined();
      expect(Object.keys(result.characters)).toHaveLength(0);
    });

    it('should preserve other characters in map', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          },
          'Agnes Baker': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Spell Casting'],
            weaknesses: [],
            items: [],
            secrets: ['Different Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 0);
      
      expect(result.characters['Roland Banks']).toBeUndefined();
      expect(result.characters['Agnes Baker']).toBeDefined();
      expect(result.characters['Agnes Baker'].abilities).toEqual(['Spell Casting']);
      expect(Object.keys(result.characters)).toHaveLength(1);
    });
  });

  describe('State Clearing', () => {
    it('should clear currentCharacterName', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 0);
      
      expect(result.currentCharacterName).toBe('');
    });

    it('should reset bookmark to 0', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 99,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Roland Banks', 0);
      
      expect(result.bookmark).toBe(0);
    });

    it('should preserve foundSecrets', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: ['Existing 1', 'Existing 2'],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Test', 0);
      
      expect(result.foundSecrets).toContain('Existing 1');
      expect(result.foundSecrets).toContain('Existing 2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined character gracefully', () => {
      const initialState: GameState = {
        currentCharacterName: 'NonExistent',
        characters: {},
        foundSecrets: ['Existing'],
        bookmark: 0,
        completedRuns: []
      };
      
      // This simulates corrupt state where currentCharacterName doesn't match any character
      const result = finishRunLogic(initialState, 'NonExistent', 0);
      
      expect(result.foundSecrets).toEqual(['Existing']);
      expect(result.completedRuns).toHaveLength(1);
      expect(result.completedRuns[0].secrets).toEqual([]);
    });

    it('should handle character with undefined secrets field', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: undefined as any // Corrupt data
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, 'Test', 0);
      
      // Should use empty array fallback
      expect(result.foundSecrets).toEqual([]);
      expect(result.completedRuns[0].secrets).toEqual([]);
    });

    it('should handle empty character name', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {
          '': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Test']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = finishRunLogic(initialState, '', 0);
      
      expect(result.foundSecrets).toEqual(['Test']);
      expect(result.completedRuns[0].characterName).toBe('');
    });

    it('should not mutate original state', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Secret']
          }
        },
        foundSecrets: ['Existing'],
        bookmark: 10,
        completedRuns: []
      };
      
      const originalJSON = JSON.stringify(initialState);
      
      finishRunLogic(initialState, 'Test', 0);
      
      // Original state should be unchanged
      expect(JSON.stringify(initialState)).toBe(originalJSON);
    });
  });
});
