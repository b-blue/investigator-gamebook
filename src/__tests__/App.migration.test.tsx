import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { createOldFormatState, DEFAULT_TEST_ATTRIBUTES } from './fixtures/mockData';
import type { AppState } from '../types';

describe('App.tsx - localStorage Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('New Format Passthrough', () => {
    it('should load already-migrated state without modification', () => {
      const newFormatState: AppState = {
        TDOA: {
          currentCharacterName: 'Roland Banks',
          characters: {
            'Roland Banks': {
              attributes: { ...DEFAULT_TEST_ATTRIBUTES, willpower: 3, combat: 4 },
              abilities: ['Combat Training'],
              weaknesses: ['Troubled Dreams'],
              items: ['38 Revolver'],
              secrets: ['Secret 1', 'Secret 2']
            }
          },
          foundSecrets: ['Secret 1', 'Secret 2', 'Secret 3'],
          bookmark: 42,
          completedRuns: [
            {
              characterName: 'Agnes Baker',
              timestamp: 1234567890,
              secrets: ['Secret 1'],
              stars: 3
            }
          ]
        },
        TTOI: {
          currentCharacterName: '',
          characters: {},
          foundSecrets: [],
          bookmark: 0,
          completedRuns: []
        },
        TKM: {
          currentCharacterName: '',
          characters: {},
          foundSecrets: [],
          bookmark: 0,
          completedRuns: []
        },
        shared: { diceRoll: 5 }
      };

      localStorage.setItem('arkham-gamebook-state', JSON.stringify(newFormatState));
      
      const { container } = render(<App />);
      
      expect(container).toBeDefined();
      
      // Verify state was loaded by checking localStorage wasn't overwritten
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      expect(loadedState.TDOA.currentCharacterName).toBe('Roland Banks');
      expect(loadedState.TDOA.characters['Roland Banks']).toBeDefined();
      expect(loadedState.TDOA.foundSecrets).toEqual(['Secret 1', 'Secret 2', 'Secret 3']);
      expect(loadedState.TDOA.bookmark).toBe(42);
      expect(loadedState.TDOA.completedRuns).toHaveLength(1);
      expect(loadedState.shared.diceRoll).toBe(5);
    });

    it('should preserve all three campaign states', () => {
      const newFormatState: AppState = {
        TDOA: {
          currentCharacterName: 'Character A',
          characters: {},
          foundSecrets: ['TDOA Secret'],
          bookmark: 10,
          completedRuns: []
        },
        TTOI: {
          currentCharacterName: 'Character B',
          characters: {},
          foundSecrets: ['TTOI Secret'],
          bookmark: 20,
          completedRuns: []
        },
        TKM: {
          currentCharacterName: 'Character C',
          characters: {},
          foundSecrets: ['TKM Secret'],
          bookmark: 30,
          completedRuns: []
        },
        shared: { diceRoll: 1 }
      };

      localStorage.setItem('arkham-gamebook-state', JSON.stringify(newFormatState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      expect(loadedState.TDOA.currentCharacterName).toBe('Character A');
      expect(loadedState.TDOA.foundSecrets).toEqual(['TDOA Secret']);
      expect(loadedState.TDOA.bookmark).toBe(10);
      
      expect(loadedState.TTOI.currentCharacterName).toBe('Character B');
      expect(loadedState.TTOI.foundSecrets).toEqual(['TTOI Secret']);
      expect(loadedState.TTOI.bookmark).toBe(20);
      
      expect(loadedState.TKM.currentCharacterName).toBe('Character C');
      expect(loadedState.TKM.foundSecrets).toEqual(['TKM Secret']);
      expect(loadedState.TKM.bookmark).toBe(30);
    });
  });

  describe('Old Format Migration', () => {
    it('should migrate old format to new format structure', () => {
      const oldState = createOldFormatState();
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(oldState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      // Verify new format structure
      expect(loadedState.TDOA).toHaveProperty('currentCharacterName');
      expect(loadedState.TDOA).toHaveProperty('characters');
      expect(loadedState.TDOA).toHaveProperty('foundSecrets');
      expect(loadedState.TDOA).toHaveProperty('bookmark');
      expect(loadedState.TDOA).toHaveProperty('completedRuns');
      
      // Old characterName becomes currentCharacterName
      expect(loadedState.TDOA.currentCharacterName).toBe('Roland Banks');
      
      // Character state should be in characters map
      expect(loadedState.TDOA.characters['Roland Banks']).toBeDefined();
      expect(loadedState.TDOA.characters['Roland Banks'].abilities).toEqual(['Combat Training']);
      expect(loadedState.TDOA.characters['Roland Banks'].weaknesses).toEqual(['Troubled Dreams']);
      expect(loadedState.TDOA.characters['Roland Banks'].items).toEqual(['38 Revolver']);
    });

    it('should initialize missing fields during migration', () => {
      const oldState = createOldFormatState();
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(oldState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      // New fields should be initialized
      expect(loadedState.TDOA.foundSecrets).toEqual([]);
      expect(loadedState.TDOA.bookmark).toBe(0);
      expect(loadedState.TDOA.completedRuns).toEqual([]);
      
      // Character should have empty secrets array
      expect(loadedState.TDOA.characters['Roland Banks'].secrets).toEqual([]);
    });

    it('should handle old format with no active character', () => {
      const oldState = {
        TDOA: {
          characterName: '',
          attributes: DEFAULT_TEST_ATTRIBUTES,
          abilities: [],
          weaknesses: [],
          items: [],
          diceRoll: 1
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

      localStorage.setItem('arkham-gamebook-state', JSON.stringify(oldState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      expect(loadedState.TDOA.currentCharacterName).toBe('');
      expect(loadedState.TDOA.characters).toEqual({});
      expect(loadedState.TTOI.currentCharacterName).toBe('');
      expect(loadedState.TTOI.characters).toEqual({});
    });

    it('should migrate shared diceRoll from TDOA field', () => {
      const oldState = {
        TDOA: {
          characterName: '',
          attributes: DEFAULT_TEST_ATTRIBUTES,
          abilities: [],
          weaknesses: [],
          items: [],
          diceRoll: 4
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

      localStorage.setItem('arkham-gamebook-state', JSON.stringify(oldState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      expect(loadedState.shared.diceRoll).toBe(4);
    });

    it('should add TKM campaign during migration', () => {
      const oldState = createOldFormatState();
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(oldState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      // TKM should be initialized with defaults
      expect(loadedState.TKM).toBeDefined();
      expect(loadedState.TKM.currentCharacterName).toBe('');
      expect(loadedState.TKM.characters).toEqual({});
      expect(loadedState.TKM.foundSecrets).toEqual([]);
      expect(loadedState.TKM.bookmark).toBe(0);
      expect(loadedState.TKM.completedRuns).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should return default state on invalid JSON', () => {
      localStorage.setItem('arkham-gamebook-state', 'invalid json{{{');
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      // Should have default state structure
      expect(loadedState.TDOA.currentCharacterName).toBe('');
      expect(loadedState.TDOA.characters).toEqual({});
      expect(loadedState.TDOA.foundSecrets).toEqual([]);
      expect(loadedState.TTOI.currentCharacterName).toBe('');
      expect(loadedState.TKM.currentCharacterName).toBe('');
    });

    it('should handle corrupt state with missing games', () => {
      const corruptState = {
        TDOA: { /* missing fields */ },
        // TTOI missing entirely
        shared: {}
      };

      localStorage.setItem('arkham-gamebook-state', JSON.stringify(corruptState));
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      // Should still have all three campaigns
      expect(loadedState.TDOA).toBeDefined();
      expect(loadedState.TTOI).toBeDefined();
      expect(loadedState.TKM).toBeDefined();
    });
  });

  describe('Fresh Start', () => {
    it('should initialize default state when no localStorage exists', () => {
      // localStorage already cleared in beforeEach
      
      render(<App />);
      
      const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
      
      expect(loadedState.TDOA.currentCharacterName).toBe('');
      expect(loadedState.TDOA.characters).toEqual({});
      expect(loadedState.TDOA.foundSecrets).toEqual([]);
      expect(loadedState.TDOA.bookmark).toBe(0);
      expect(loadedState.TDOA.completedRuns).toEqual([]);
      
      expect(loadedState.TTOI.currentCharacterName).toBe('');
      expect(loadedState.TKM.currentCharacterName).toBe('');
      
      expect(loadedState.shared.diceRoll).toBe(1);
    });
  });
});
