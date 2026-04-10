import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { DEFAULT_TEST_ATTRIBUTES } from './fixtures/mockData';
import type { AppState } from '../types';

describe('App.tsx - Finish Run Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createStateWithCharacter = (characterName: string, secrets: string[], foundSecrets: string[] = []): AppState => {
    return {
      TDOA: {
        currentCharacterName: characterName,
        characters: {
          [characterName]: {
            attributes: DEFAULT_TEST_ATTRIBUTES,
            abilities: ['Combat Training'],
            weaknesses: ['Troubled Dreams'],
            items: ['38 Revolver'],
            secrets
          }
        },
        foundSecrets,
        bookmark: 42,
        completedRuns: []
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
      shared: { diceRoll: 1 }
    };
  };

  describe('Secret Deduplication', () => {
    it('should deduplicate secrets when merging foundSecrets', async () => {
      const state = createStateWithCharacter(
        'Roland Banks',
        ['Secret 1', 'Secret 2', 'Secret 3'],
        ['Secret 1', 'Secret 4'] // Already have Secret 1
      );
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      // Wait for component to mount and load state
      await waitFor(() => {
        const loadedState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        expect(loadedState.TDOA.currentCharacterName).toBe('Roland Banks');
      });
      
      // Find and click "Finish Run" button
      const finishButton = screen.getByText(/finish run/i);
      await userEvent.click(finishButton);
      
      // Should open modal - find confirm button
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      // Verify state after finishing run
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        // Should have all unique secrets: Secret 1, 2, 3, 4
        expect(finalState.TDOA.foundSecrets).toHaveLength(4);
        expect(finalState.TDOA.foundSecrets).toContain('Secret 1');
        expect(finalState.TDOA.foundSecrets).toContain('Secret 2');
        expect(finalState.TDOA.foundSecrets).toContain('Secret 3');
        expect(finalState.TDOA.foundSecrets).toContain('Secret 4');
        
        // No duplicate Secret 1
        const secret1Count = finalState.TDOA.foundSecrets.filter((s: string) => s === 'Secret 1').length;
        expect(secret1Count).toBe(1);
      });
    });

    it('should handle character with no new secrets', async () => {
      const state = createStateWithCharacter(
        'Roland Banks',
        [], // No secrets
        ['Secret 1', 'Secret 2']
      );
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        // Should keep existing foundSecrets unchanged
        expect(finalState.TDOA.foundSecrets).toEqual(['Secret 1', 'Secret 2']);
      });
    });

    it('should handle all duplicate secrets', async () => {
      const state = createStateWithCharacter(
        'Roland Banks',
        ['Secret 1', 'Secret 2'],
        ['Secret 1', 'Secret 2', 'Secret 3']
      );
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        // Should still have 3 unique secrets
        expect(finalState.TDOA.foundSecrets).toHaveLength(3);
        expect(finalState.TDOA.foundSecrets).toContain('Secret 1');
        expect(finalState.TDOA.foundSecrets).toContain('Secret 2');
        expect(finalState.TDOA.foundSecrets).toContain('Secret 3');
      });
    });
  });

  describe('CompletedRun Creation', () => {
    it('should create CompletedRun with correct fields', async () => {
      const timestamp = 1234567890;
      vi.setSystemTime(timestamp);
      
      const state = createStateWithCharacter(
        'Roland Banks',
        ['Secret 1', 'Secret 2']
      );
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      // Select stars (if stars UI exists - assuming 3 stars for test)
      // This may need adjustment based on actual UI
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        expect(finalState.TDOA.completedRuns).toHaveLength(1);
        
        const run = finalState.TDOA.completedRuns[0];
        expect(run.characterName).toBe('Roland Banks');
        expect(run.timestamp).toBe(timestamp);
        expect(run.secrets).toEqual(['Secret 1', 'Secret 2']);
        expect(run.stars).toBeGreaterThanOrEqual(0);
        expect(run.stars).toBeLessThanOrEqual(4);
      });
    });

    it('should append to existing completedRuns', async () => {
      const existingRun = {
        characterName: 'Agnes Baker',
        timestamp: 1111111111,
        secrets: ['Old Secret'],
        stars: 2
      };
      
      const state = createStateWithCharacter(
        'Roland Banks',
        ['New Secret']
      );
      state.TDOA.completedRuns = [existingRun];
      
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        expect(finalState.TDOA.completedRuns).toHaveLength(2);
        expect(finalState.TDOA.completedRuns[0]).toEqual(existingRun);
        expect(finalState.TDOA.completedRuns[1].characterName).toBe('Roland Banks');
      });
    });

    it('should use current timestamp', async () => {
      const beforeTimestamp = Date.now();
      
      const state = createStateWithCharacter('Roland Banks', []);
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      const afterTimestamp = Date.now();
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        const run = finalState.TDOA.completedRuns[0];
        
        expect(run.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
        expect(run.timestamp).toBeLessThanOrEqual(afterTimestamp);
      });
    });
  });

  describe('Character Removal', () => {
    it('should remove character from characters map', async () => {
      const state = createStateWithCharacter('Roland Banks', ['Secret 1']);
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        expect(finalState.TDOA.characters['Roland Banks']).toBeUndefined();
        expect(Object.keys(finalState.TDOA.characters)).toHaveLength(0);
      });
    });

    it('should preserve other characters in map', async () => {
      const state = createStateWithCharacter('Roland Banks', ['Secret 1']);
      state.TDOA.characters['Agnes Baker'] = {
        attributes: DEFAULT_TEST_ATTRIBUTES,
        abilities: [],
        weaknesses: [],
        items: [],
        secrets: []
      };
      
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        expect(finalState.TDOA.characters['Roland Banks']).toBeUndefined();
        expect(finalState.TDOA.characters['Agnes Baker']).toBeDefined();
        expect(Object.keys(finalState.TDOA.characters)).toHaveLength(1);
      });
    });
  });

  describe('State Clearing', () => {
    it('should clear currentCharacterName', async () => {
      const state = createStateWithCharacter('Roland Banks', []);
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        expect(finalState.TDOA.currentCharacterName).toBe('');
      });
    });

    it('should reset bookmark to 0', async () => {
      const state = createStateWithCharacter('Roland Banks', []);
      state.TDOA.bookmark = 99;
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        expect(finalState.TDOA.bookmark).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined character gracefully', async () => {
      const state = createStateWithCharacter('Roland Banks', ['Secret 1']);
      // Corrupt the state by removing the character but keeping currentCharacterName
      delete state.TDOA.characters['Roland Banks'];
      
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        // Should handle gracefully with empty secrets
        expect(finalState.TDOA.foundSecrets).toEqual([]);
        expect(finalState.TDOA.completedRuns).toHaveLength(1);
        expect(finalState.TDOA.completedRuns[0].secrets).toEqual([]);
      });
    });

    it('should not affect other campaigns', async () => {
      const state = createStateWithCharacter('Roland Banks', ['TDOA Secret']);
      state.TTOI.foundSecrets = ['TTOI Secret'];
      state.TKM.foundSecrets = ['TKM Secret'];
      
      localStorage.setItem('arkham-gamebook-state', JSON.stringify(state));
      
      render(<App />);
      
      const finishButton = await screen.findByText(/finish run/i);
      await userEvent.click(finishButton);
      
      const confirmButton = await screen.findByText(/confirm/i);
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        const finalState = JSON.parse(localStorage.getItem('arkham-gamebook-state')!);
        
        // TTOI and TKM should be unchanged
        expect(finalState.TTOI.foundSecrets).toEqual(['TTOI Secret']);
        expect(finalState.TKM.foundSecrets).toEqual(['TKM Secret']);
        expect(finalState.TTOI.completedRuns).toHaveLength(0);
        expect(finalState.TKM.completedRuns).toHaveLength(0);
      });
    });
  });
});
