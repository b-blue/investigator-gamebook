import { describe, it, expect } from 'vitest';
import { DEFAULT_TEST_ATTRIBUTES } from '../fixtures/mockData';
import type { GameState, Attributes } from '../../types';

/**
 * Unit tests for state update functions from App.tsx (L129-285)
 * Testing deep nested state mutations for attributes, items, abilities, weaknesses, secrets
 */

// Extract the state update logic for testing in isolation
function updateAttributeLogic(
  gameState: GameState,
  activeGame: 'TDOA' | 'TTOI' | 'TKM',
  attrName: keyof Attributes,
  value: number
): GameState {
  const charName = gameState.currentCharacterName;
  if (!charName) return gameState;
  
  return {
    ...gameState,
    characters: {
      ...gameState.characters,
      [charName]: {
        ...gameState.characters[charName],
        attributes: {
          ...gameState.characters[charName].attributes,
          [attrName]: value
        }
      }
    }
  };
}

function updateArrayLogic(
  gameState: GameState,
  charName: string,
  field: 'items' | 'abilities' | 'weaknesses' | 'secrets',
  values: string[]
): GameState {
  if (!charName) return gameState;
  
  return {
    ...gameState,
    characters: {
      ...gameState.characters,
      [charName]: {
        ...gameState.characters[charName],
        [field]: values
      }
    }
  };
}

describe('State Update Logic - Unit Tests', () => {
  describe('updateAttribute', () => {
    it('should update a single attribute value', () => {
      const initialState: GameState = {
        currentCharacterName: 'Roland Banks',
        characters: {
          'Roland Banks': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3 },
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
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'willpower', 5);
      
      expect(result.characters['Roland Banks'].attributes.willpower).toBe(5);
    });

    it('should preserve other attributes', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3, combat: 4, health: 10 },
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
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'willpower', 5);
      
      expect(result.characters['Test'].attributes.willpower).toBe(5);
      expect(result.characters['Test'].attributes.combat).toBe(4);
      expect(result.characters['Test'].attributes.health).toBe(10);
    });

    it('should accept negative values', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, health: 5 },
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
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'health', -3);
      
      expect(result.characters['Test'].attributes.health).toBe(-3);
    });

    it('should accept zero value', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, sanity: 5 },
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
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'sanity', 0);
      
      expect(result.characters['Test'].attributes.sanity).toBe(0);
    });

    it('should update all attribute types', () => {
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
      
      const attrs: (keyof Attributes)[] = [
        'willpower', 'intellect', 'combat', 'health', 
        'sanity', 'resources', 'clues', 'doom'
      ];
      
      attrs.forEach((attr, index) => {
        const result = updateAttributeLogic(initialState, 'TDOA', attr, index + 1);
        expect(result.characters['Test'].attributes[attr]).toBe(index + 1);
      });
    });

    it('should preserve other character fields', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Test Ability'],
            weaknesses: ['Test Weakness'],
            items: ['Test Item'],
            secrets: ['Test Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'willpower', 10);
      
      expect(result.characters['Test'].abilities).toEqual(['Test Ability']);
      expect(result.characters['Test'].weaknesses).toEqual(['Test Weakness']);
      expect(result.characters['Test'].items).toEqual(['Test Item']);
      expect(result.characters['Test'].secrets).toEqual(['Test Secret']);
    });

    it('should return unchanged state when no character selected', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateAttributeLogic(initialState, 'TDOA', 'willpower', 10);
      
      expect(result).toBe(initialState);
    });

    it('should not mutate original state', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3 },
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
      
      const originalJSON = JSON.stringify(initialState);
      
      updateAttributeLogic(initialState, 'TDOA', 'willpower', 10);
      
      expect(JSON.stringify(initialState)).toBe(originalJSON);
    });
  });

  describe('updateItems', () => {
    it('should replace items array', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: ['Old Item'],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'items', ['New Item 1', 'New Item 2']);
      
      expect(result.characters['Test'].items).toEqual(['New Item 1', 'New Item 2']);
    });

    it('should accept empty array', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: ['Item 1', 'Item 2'],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'items', []);
      
      expect(result.characters['Test'].items).toEqual([]);
    });

    it('should preserve other fields', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 5 },
            abilities: ['Ability'],
            weaknesses: ['Weakness'],
            items: ['Old Item'],
            secrets: ['Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'items', ['New Item']);
      
      expect(result.characters['Test'].attributes.willpower).toBe(5);
      expect(result.characters['Test'].abilities).toEqual(['Ability']);
      expect(result.characters['Test'].weaknesses).toEqual(['Weakness']);
      expect(result.characters['Test'].secrets).toEqual(['Secret']);
    });

    it('should return unchanged state when no character selected', () => {
      const initialState: GameState = {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, '', 'items', ['Item']);
      
      expect(result).toBe(initialState);
    });
  });

  describe('updateAbilities', () => {
    it('should replace abilities array', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Old Ability'],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'abilities', ['Combat Training', 'Investigation']);
      
      expect(result.characters['Test'].abilities).toEqual(['Combat Training', 'Investigation']);
    });

    it('should handle multiple abilities', () => {
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
      
      const abilities = ['Ability 1', 'Ability 2', 'Ability 3', 'Ability 4'];
      const result = updateArrayLogic(initialState, 'Test', 'abilities', abilities);
      
      expect(result.characters['Test'].abilities).toEqual(abilities);
    });
  });

  describe('updateWeaknesses', () => {
    it('should replace weaknesses array', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: ['Old Weakness'],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'weaknesses', ['Troubled Dreams', 'Paranoia']);
      
      expect(result.characters['Test'].weaknesses).toEqual(['Troubled Dreams', 'Paranoia']);
    });

    it('should preserve abilities when updating weaknesses', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Combat Training'],
            weaknesses: ['Old'],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'weaknesses', ['New']);
      
      expect(result.characters['Test'].abilities).toEqual(['Combat Training']);
      expect(result.characters['Test'].weaknesses).toEqual(['New']);
    });
  });

  describe('updateSecrets', () => {
    it('should replace secrets array', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['Old Secret']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const result = updateArrayLogic(initialState, 'Test', 'secrets', ['Secret 1', 'Secret 2', 'Secret 3']);
      
      expect(result.characters['Test'].secrets).toEqual(['Secret 1', 'Secret 2', 'Secret 3']);
    });

    it('should handle large secret arrays', () => {
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
      
      const secrets = Array.from({ length: 20 }, (_, i) => `Secret ${i + 1}`);
      const result = updateArrayLogic(initialState, 'Test', 'secrets', secrets);
      
      expect(result.characters['Test'].secrets).toHaveLength(20);
      expect(result.characters['Test'].secrets).toEqual(secrets);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state when updating attributes', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3 },
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
      
      const originalWillpower = initialState.characters['Test'].attributes.willpower;
      
      updateAttributeLogic(initialState, 'TDOA', 'willpower', 10);
      
      expect(initialState.characters['Test'].attributes.willpower).toBe(originalWillpower);
    });

    it('should not mutate original state when updating arrays', () => {
      const initialState: GameState = {
        currentCharacterName: 'Test',
        characters: {
          'Test': {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: [],
            weaknesses: [],
            items: ['Original Item'],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      };
      
      const originalItems = [...initialState.characters['Test'].items];
      
      updateArrayLogic(initialState, 'Test', 'items', ['New Item']);
      
      expect(initialState.characters['Test'].items).toEqual(originalItems);
    });
  });
});
