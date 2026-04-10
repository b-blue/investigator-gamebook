import { describe, it, expect } from 'vitest';
import { mockCharacters, mockAbilities, mockItems, mockSecrets, createMockAppState } from './fixtures/mockData';

describe('Test Infrastructure Smoke Tests', () => {
  describe('Fixture Data Loading', () => {
    it('should load character fixtures', () => {
      expect(mockCharacters).toBeDefined();
      expect(mockCharacters.length).toBeGreaterThan(0);
      expect(mockCharacters[0]).toHaveProperty('name');
      expect(mockCharacters[0]).toHaveProperty('attributes');
    });

    it('should load abilities fixtures', () => {
      expect(mockAbilities).toBeDefined();
      expect(mockAbilities.length).toBeGreaterThan(0);
      expect(mockAbilities[0]).toHaveProperty('name');
      expect(mockAbilities[0]).toHaveProperty('isWeakness');
    });

    it('should load items fixtures', () => {
      expect(mockItems).toBeDefined();
      expect(mockItems.length).toBeGreaterThan(0);
      expect(mockItems[0]).toHaveProperty('name');
      expect(mockItems[0]).toHaveProperty('description');
    });

    it('should load secrets fixtures', () => {
      expect(mockSecrets).toBeDefined();
      expect(mockSecrets.length).toBeGreaterThan(0);
      expect(mockSecrets[0]).toHaveProperty('name');
      expect(mockSecrets[0]).toHaveProperty('campaign');
    });
  });

  describe('Mock State Helpers', () => {
    it('should create a valid AppState', () => {
      const appState = createMockAppState();
      
      expect(appState).toHaveProperty('TDOA');
      expect(appState).toHaveProperty('TTOI');
      expect(appState).toHaveProperty('TKM');
      expect(appState).toHaveProperty('shared');
      
      expect(appState.TDOA).toHaveProperty('currentCharacterName');
      expect(appState.TDOA).toHaveProperty('characters');
      expect(appState.TDOA).toHaveProperty('foundSecrets');
      expect(appState.TDOA).toHaveProperty('bookmark');
      expect(appState.TDOA).toHaveProperty('completedRuns');
    });

    it('should allow AppState overrides', () => {
      const appState = createMockAppState({
        TDOA: {
          currentCharacterName: 'Test Character',
          characters: {},
          foundSecrets: ['Secret 1'],
          bookmark: 42,
          completedRuns: []
        }
      });
      
      expect(appState.TDOA.currentCharacterName).toBe('Test Character');
      expect(appState.TDOA.foundSecrets).toEqual(['Secret 1']);
      expect(appState.TDOA.bookmark).toBe(42);
    });
  });

  describe('localStorage Mock', () => {
    it('should provide a working localStorage mock', () => {
      localStorage.clear();
      
      expect(localStorage.getItem('test')).toBeNull();
      
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
      
      localStorage.removeItem('test');
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should support JSON stringification', () => {
      localStorage.clear();
      
      const testData = { key: 'value', number: 42 };
      localStorage.setItem('json-test', JSON.stringify(testData));
      
      const retrieved = JSON.parse(localStorage.getItem('json-test')!);
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Campaign Data Verification', () => {
    it('should have secrets for all three campaigns', () => {
      const tdoaSecrets = mockSecrets.filter(s => s.campaign === 'TDOA');
      const ttoiSecrets = mockSecrets.filter(s => s.campaign === 'TTOI');
      const tkmSecrets = mockSecrets.filter(s => s.campaign === 'TKM');
      
      expect(tdoaSecrets.length).toBeGreaterThan(0);
      expect(ttoiSecrets.length).toBeGreaterThan(0);
      expect(tkmSecrets.length).toBeGreaterThan(0);
      
      // Verify known counts from previous work
      expect(tdoaSecrets.length).toBe(48);
      expect(ttoiSecrets.length).toBe(55);
      expect(tkmSecrets.length).toBe(57);
    });

    it('should have characters with all required properties', () => {
      expect(mockCharacters.length).toBe(12);
      
      mockCharacters.forEach(character => {
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('description');
        expect(character).toHaveProperty('attributes');
        expect(character).toHaveProperty('abilities');
        expect(character).toHaveProperty('weaknesses');
        expect(character).toHaveProperty('items');
        expect(typeof character.name).toBe('string');
        expect(character.abilities).toBeInstanceOf(Array);
        expect(character.weaknesses).toBeInstanceOf(Array);
      });
    });
  });
});
