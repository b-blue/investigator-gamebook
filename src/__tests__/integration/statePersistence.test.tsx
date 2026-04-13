import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

/**
 * Integration test for state persistence across component remounts
 * Simulates page refresh/reload scenarios
 */

describe('State Persistence - Integration Test', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should restore full game state after component remount', async () => {
    const initialState = {
      TDOA: {
        currentCharacterName: 'Rex Murphy',
        characters: {
          'Rex Murphy': {
            attributes: {
              willpower: 5,
              intellect: 4,
              combat: 2,
              health: 6,
              sanity: 9,
              resources: 2,
              clues: 3,
              doom: 1
            },
            abilities: ['Reporter', 'Seeker'],
            weaknesses: ["Rex's Curse", 'Cursed'],
            items: ["Reporter's Notebook", 'Ancient Tome'],
            secrets: ['The Hidden Truth']
          }
        },
        foundSecrets: [],
        bookmark: 156,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 4 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    const { unmount } = render(<App />);

    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // Verify state has correct bookmark
    const stateBeforeRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateBeforeRemount.TDOA.bookmark).toBe(156);

    unmount();
    render(<App />);

    // Verify character is still selected
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // Verify the state is identical
    const stateAfterRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateAfterRemount).toEqual(stateBeforeRemount);
    expect(stateAfterRemount.TDOA.currentCharacterName).toBe('Rex Murphy');
    expect(stateAfterRemount.TDOA.characters['Rex Murphy'].attributes.willpower).toBe(5);
    expect(stateAfterRemount.TDOA.characters['Rex Murphy'].items).toContain('Ancient Tome');
    expect(stateAfterRemount.TDOA.bookmark).toBe(156);
    expect(stateAfterRemount.shared.diceRoll).toBe(4);
  });

  it('should persist completedRuns and foundSecrets across remounts', async () => {
    const initialState = {
      TDOA: {
        currentCharacterName: '',
        characters: {},
        foundSecrets: ['Secret Alpha', 'Secret Beta'],
        bookmark: 0,
        completedRuns: [
          {
            characterName: 'Nathaniel Cho',
            timestamp: 1234567890,
            secrets: ['Secret Alpha'],
            stars: 3
          }
        ]
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    const { unmount } = render(<App />);
    
    const stateBeforeUnmount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateBeforeUnmount.TDOA.completedRuns).toHaveLength(1);
    expect(stateBeforeUnmount.TDOA.foundSecrets).toHaveLength(2);

    unmount();
    render(<App />);

    const stateAfterRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateAfterRemount.TDOA.completedRuns).toHaveLength(1);
    expect(stateAfterRemount.TDOA.completedRuns[0].characterName).toBe('Nathaniel Cho');
    expect(stateAfterRemount.TDOA.foundSecrets).toContain('Secret Alpha');
    expect(stateAfterRemount.TDOA.foundSecrets).toContain('Secret Beta');
  });

  it('should handle empty state on first load', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/The Darkness Over Arkham/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const savedState = JSON.parse(localStorageMock['arkham-gamebook-state'] || '{}');
      expect(savedState).toBeDefined();
      expect(savedState.TDOA).toBeDefined();
      expect(savedState.TTOI).toBeDefined();
      expect(savedState.TKM).toBeDefined();
    });
  });
});
