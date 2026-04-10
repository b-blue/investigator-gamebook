// Test fixture utilities for loading JSON data
import characters from '../../data/characters.json';
import abilities from '../../data/abilities.json';
import items from '../../data/items.json';
import secrets from '../../data/secrets.json';
import type { Character, Ability, Item, Secret, AppState, GameState } from '../../types';

export const mockCharacters = characters as Character[];
export const mockAbilities = abilities as Ability[];
export const mockItems = items as Item[];
export const mockSecrets = secrets as Secret[];

// Helper to get a specific character by name
export const getCharacterByName = (name: string): Character | undefined => {
  return mockCharacters.find(c => c.name === name);
};

// Helper to get abilities (not weaknesses)
export const getMockAbilities = (): Ability[] => {
  return mockAbilities.filter(a => !a.isWeakness);
};

// Helper to get weaknesses only
export const getMockWeaknesses = (): Ability[] => {
  return mockAbilities.filter(a => a.isWeakness);
};

// Helper to get secrets for a specific campaign
export const getSecretsByCampaign = (campaign: 'TDOA' | 'TTOI' | 'TKM'): Secret[] => {
  return mockSecrets.filter(s => s.campaign === campaign);
};

// Default test attributes
export const DEFAULT_TEST_ATTRIBUTES = {
  willpower: 0,
  intellect: 0,
  combat: 0,
  health: 0,
  sanity: 0,
  resources: 0,
  clues: 0,
  doom: 0
};

// Create a default GameState for testing
export const createMockGameState = (overrides?: Partial<GameState>): GameState => {
  return {
    currentCharacterName: '',
    characters: {},
    foundSecrets: [],
    bookmark: 0,
    completedRuns: [],
    ...overrides
  };
};

// Create a full AppState for testing
export const createMockAppState = (overrides?: Partial<AppState>): AppState => {
  return {
    TDOA: createMockGameState(),
    TTOI: createMockGameState(),
    TKM: createMockGameState(),
    shared: { diceRoll: 1 },
    ...overrides
  };
};

// Helper to create old-format state for migration testing
export const createOldFormatState = () => {
  return {
    TDOA: {
      characterName: 'Roland Banks',
      attributes: DEFAULT_TEST_ATTRIBUTES,
      abilities: ['Combat Training'],
      weaknesses: ['Troubled Dreams'],
      items: ['38 Revolver'],
      diceRoll: 3
    },
    TTOI: {
      characterName: '',
      attributes: DEFAULT_TEST_ATTRIBUTES,
      abilities: [],
      weaknesses: [],
      items: [],
      diceRoll: 1
    }
  };
};
