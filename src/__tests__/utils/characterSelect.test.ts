import { describe, it, expect } from 'vitest';
import { DEFAULT_TEST_ATTRIBUTES } from '../fixtures/mockData';
import type { GameState, Character, CharacterState } from '../../types';

/**
 * Unit tests for handleCharacterSelect logic from App.tsx (L147-173)
 * Testing character loading and restarting modes
 */

// Extract the character selection logic for testing
function handleCharacterSelectLogic(
  gameState: GameState,
  character: Character,
  mode: 'restart' | 'load'
): GameState {
  const newCharacters = { ...gameState.characters };
  
  if (mode === 'restart') {
    // Restart mode: overwrite with character defaults
    newCharacters[character.name] = {
      attributes: character.attributes,
      abilities: character.abilities,
      weaknesses: character.weaknesses,
      items: character.items,
      secrets: []
    };
  }
  // Load mode: character already exists in map, just switch to it
  
  return {
    ...gameState,
    currentCharacterName: character.name,
    characters: newCharacters
  };
}

describe('Character Selection Logic - Unit Tests', () => {
  const rolandBanks: Character = {
    name: 'Roland Banks',
    description: 'The Fed',
    attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3, intellect: 3, combat: 4, health: 9, sanity: 5, resources: 5, clues: 0, doom: 0 },
    abilities: ['Combat Training'],
    weaknesses: ['Troubled Dreams'],
    items: ['38 Revolver', 'Beat Cop']
  };

  const agnesBaker: Character = {
    name: 'Agnes Baker',
    description: 'The Waitress',
    attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 5, intellect: 2, combat: 2, health: 6, sanity: 8, resources: 4, clues: 0, doom: 0 },
    abilities: ['Spell Casting'],
    weaknesses: ['Dark Memory'],
    items: ['Forbidden Knowledge']
  };

  describe('Restart Mode', () => {
    it('should initialize character with template defaults', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.currentCharacterName).toBe('Roland Banks');
      expect(result.characters['Roland Banks']).toBeDefined();
      expect(result.characters['Roland Banks'].attributes.willpower).toBe(3);
      expect(result.characters['Roland Banks'].attributes.combat).toBe(4);
    });

    it('should copy abilities from template', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.characters['Roland Banks'].abilities).toEqual(['Combat Training']);
    });

    it('should copy weaknesses from template', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.characters['Roland Banks'].weaknesses).toEqual(['Troubled Dreams']);
    });

    it('should copy items from template', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.characters['Roland Banks'].items).toEqual(['38 Revolver', 'Beat Cop']);
    });

    it('should initialize secrets as empty array', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.characters['Roland Banks'].secrets).toEqual([]);
    });

    it('should overwrite existing character progress', () => {
      const existingCharacter: CharacterState = {
        attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 10 }, // Modified
        abilities: ['Different Ability'],
        weaknesses: ['Different Weakness'],
        items: ['Different Item'],
        secrets: ['Secret 1', 'Secret 2']
      };
      
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': existingCharacter
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      // Should be reset to template defaults
      expect(result.characters['Roland Banks'].attributes.willpower).toBe(3); // Back to template
      expect(result.characters['Roland Banks'].abilities).toEqual(['Combat Training']);
      expect(result.characters['Roland Banks'].secrets).toEqual([]); // Cleared
    });

    it('should preserve other characters in map', () => {
      const initialState: GameState = {
        currentCharacterName: 'Agnes Baker',
        characters: {
          'Agnes Baker': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Spell Casting'],
            weaknesses: [],
            items: [],
            secrets: ['Agnes Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.characters['Agnes Baker']).toBeDefined();
      expect(result.characters['Agnes Baker'].secrets).toEqual(['Agnes Secret']);
      expect(result.characters['Roland Banks']).toBeDefined();
    });
  });

  describe('Load Mode', () => {
    it('should update currentCharacterName only', () => {
      const existingRoland: CharacterState = {
        attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 10 }, // Modified
        abilities: ['Combat Training', 'Extra Ability'],
        weaknesses: ['Troubled Dreams'],
        items: ['38 Revolver', 'Extra Item'],
        secrets: ['Secret 1']
      };
      
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {
          'Roland Banks': existingRoland
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'load');
      
      expect(result.currentCharacterName).toBe('Roland Banks');
      // Should preserve existing state (not overwrite)
      expect(result.characters['Roland Banks'].attributes.willpower).toBe(10);
      expect(result.characters['Roland Banks'].abilities).toEqual(['Combat Training', 'Extra Ability']);
      expect(result.characters['Roland Banks'].secrets).toEqual(['Secret 1']);
    });

    it('should preserve modified attributes', () => {
      const existingAgnes: CharacterState = {
        attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 2, sanity: -3 }, // Modified
        abilities: [],
        weaknesses: [],
        items: [],
        secrets: []
      };
      
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Agnes Baker': existingAgnes
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, agnesBaker, 'load');
      
      expect(result.currentCharacterName).toBe('Agnes Baker');
      expect(result.characters['Agnes Baker'].attributes.willpower).toBe(2);
      expect(result.characters['Agnes Baker'].attributes.sanity).toBe(-3);
    });

    it('should preserve collected items and secrets', () => {
      const existingRoland: CharacterState = {
        attributes: DEFAULT_TEST_ATTRIBUTES,
        abilities: ['Combat Training'],
        weaknesses: ['Troubled Dreams'],
        items: ['38 Revolver', 'Magnifying Glass', 'Old Book'],
        secrets: ['Secret 1', 'Secret 2', 'Secret 3']
      };
      
      const initialState: GameState = {
        currentCharacterName: 'Agnes Baker',
        characters: {
          'Roland Banks': existingRoland
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'load');
      
      expect(result.characters['Roland Banks'].items).toEqual(['38 Revolver', 'Magnifying Glass', 'Old Book']);
      expect(result.characters['Roland Banks'].secrets).toEqual(['Secret 1', 'Secret 2', 'Secret 3']);
    });

    it('should switch between characters without losing progress', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 5 },
            abilities: [],
            weaknesses: [],
            items: ['Roland Item'],
            secrets: ['Roland Secret']
          },
          'Agnes Baker': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 8 },
            abilities: [],
            weaknesses: [],
            items: ['Agnes Item'],
            secrets: ['Agnes Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, agnesBaker, 'load');
      
      expect(result.currentCharacterName).toBe('Agnes Baker');
      
      // Both characters should preserve their state
      expect(result.characters['Roland Banks'].items).toEqual(['Roland Item']);
      expect(result.characters['Agnes Baker'].items).toEqual(['Agnes Item']);
    });
  });

  describe('State Preservation', () => {
    it('should preserve foundSecrets when selecting character', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: ['Global 1', 'Global 2'],
        bookmark: 42,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.foundSecrets).toEqual(['Global 1', 'Global 2']);
      expect(result.bookmark).toBe(42);
    });

    it('should preserve completedRuns when selecting character', () => {
      const existingRun = {
        characterName: 'Old Character',
        timestamp: 123456,
        secrets: ['Old Secret'],
        stars: 3
      };
      
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: [existingRun]
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(result.completedRuns).toEqual([existingRun]);
    });

    it('should not mutate original state', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const originalJSON = JSON.stringify(initialState);
      
      handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      expect(JSON.stringify(initialState)).toBe(originalJSON);
    });
  });

  describe('Edge Cases', () => {
    it('should handle character with minimal template data', () => {
      const minimalChar: Character = {
        name: 'Minimal',
        description: 'Test',
        attributes: DEFAULT_TEST_ATTRIBUTES,
        abilities: [],
        weaknesses: [],
        items: []
      };
      
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, minimalChar, 'restart');
      
      expect(result.characters['Minimal']).toBeDefined();
      expect(result.characters['Minimal'].abilities).toEqual([]);
      expect(result.characters['Minimal'].items).toEqual([]);
      expect(result.characters['Minimal'].secrets).toEqual([]);
    });

    it('should handle load mode when character does not exist yet', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      // Load mode when character not in map yet - just updates currentCharacterName
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'load');
      
      expect(result.currentCharacterName).toBe('Roland Banks');
      // No modification to characters map in load mode
      expect(result.characters['Roland Banks']).toBeUndefined();
    });

    it('should handle selecting same character in restart mode', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 10 },
            abilities: ['Extra'],
            weaknesses: [],
            items: [],
            secrets: ['Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = handleCharacterSelectLogic(initialState, rolandBanks, 'restart');
      
      // Should still reset to template
      expect(result.characters['Roland Banks'].attributes.willpower).toBe(3);
      expect(result.characters['Roland Banks'].abilities).toEqual(['Combat Training']);
      expect(result.characters['Roland Banks'].secrets).toEqual([]);
    });
  });
});
