import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

/**
 * Integration test for campaign switching functionality
 * Testing: state isolation between TDOA, TTOI, and TKM campaigns
 */

describe('Campaign Switching - Integration Test', () => {
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

  it('should maintain separate character state for each campaign', async () => {
    const user = userEvent.setup();

    const initialState = {
      TDOA: {
        currentCharacterName: 'Rex Murphy',
        characters: {
          'Rex Murphy': {
            attributes: {
              willpower: 3,
              intellect: 4,
             combat: 2,
              health: 6,
              sanity: 9,
              resources: 0,
              clues: 1,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: {
        currentCharacterName: 'Agnes Baker',
        characters: {
          'Agnes Baker': {
            attributes: {
              willpower: 5,
              intellect: 2,
              combat: 2,
              health: 6,
              sanity: 8,
              resources: 0,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
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
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Verify TDOA character is loaded
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // Switch to TTOI
    const ttoiTab = screen.getByRole('tab', { name: /TTOI/i });
    await user.click(ttoiTab);

    // Verify TTOI character is loaded
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Agnes Baker/);
      expect(placeholder).toBeInTheDocument();
    });

    // Switch to TKM
    const tkmTab = screen.getByRole('tab', { name: /TKM/i });
    await user.click(tkmTab);

    // Verify TKM has no character
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText('Select Character');
      expect(placeholder).toBeInTheDocument();
    });

    // Switch back to TDOA
    const tdoaTab = screen.getByRole('tab', { name: /TDOA/i });
    await user.click(tdoaTab);

    // Verify Rex Murphy is still selected
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // Verify state is preserved
    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.TDOA.currentCharacterName).toBe('Rex Murphy');
    expect(finalState.TTOI.currentCharacterName).toBe('Agnes Baker');
    expect(finalState.TKM.currentCharacterName).toBe('');
  });

  it('should maintain separate bookmarks for each campaign', async () => {
    const user = userEvent.setup();

    const initialState = {
      TDOA: {
        currentCharacterName: 'Nathaniel Cho',
        characters: {
          'Nathaniel Cho': {
            attributes: {
              willpower: 3,
              intellect: 2,
              combat: 5,
              health: 9,
              sanity: 6,
              resources: 0,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 100,
        completedRuns: []
      },
      TTOI: {
        currentCharacterName: 'Agnes Baker',
        characters: {
          'Agnes Baker': {
            attributes: {
              willpower: 5,
              intellect: 2,
              combat: 2,
              health: 6,
              sanity: 8,
              resources: 0,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 200,
        completedRuns: []
      },
      TKM: {
        currentCharacterName: 'Rex Murphy',
        characters: {
          'Rex Murphy': {
            attributes: {
              willpower: 3,
              intellect: 4,
              combat: 2,
              health: 6,
              sanity: 9,
              resources: 0,
              clues: 1,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 300,
        completedRuns: []
      },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Verify initial state is loaded
    await waitFor(() => {
      const state = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(state.TDOA.bookmark).toBe(100);
      expect(state.TTOI.bookmark).toBe(200);
      expect(state.TKM.bookmark).toBe(300);
    });

    // Switch between campaigns to verify they maintain separate bookmarks
    const ttoiTab = screen.getByRole('tab', { name: /TTOI/i });
    await user.click(ttoiTab);

    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Agnes Baker/);
      expect(placeholder).toBeInTheDocument();
    });

    const tkmTab = screen.getByRole('tab', { name: /TKM/i });
    await user.click(tkmTab);

    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // Verify all bookmarks are still correct in state
    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.TDOA.bookmark).toBe(100);
    expect(finalState.TTOI.bookmark).toBe(200);
    expect(finalState.TKM.bookmark).toBe(300);
  });

  it('should maintain separate foundSecrets for each campaign', async () => {
    const initialState = {
      TDOA: {
        currentCharacterName: '',
        characters: {},
        foundSecrets: ['TDOA Secret 1', 'TDOA Secret 2'],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: {
        currentCharacterName: '',
        characters: {},
        foundSecrets: ['TTOI Secret 1'],
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
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    const state = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(state.TDOA.foundSecrets).toHaveLength(2);
    expect(state.TTOI.foundSecrets).toHaveLength(1);
    expect(state.TKM.foundSecrets).toHaveLength(0);
  });

  it('should maintain separate completedRuns for each campaign', async () => {
    const initialState = {
      TDOA: {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: [
          {
            characterName: 'Nathaniel Cho',
            timestamp: 1234567890,
            secrets: [],
            stars: 2
          }
        ]
      },
      TTOI: {
        currentCharacterName: '',
        characters: {},
        foundSecrets: [],
        bookmark: 0,
        completedRuns: [
          {
            characterName: 'Agnes Baker',
            timestamp: 1234567890,
            secrets: [],
            stars: 4
          }
        ]
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
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.TDOA.completedRuns).toHaveLength(1);
    expect(finalState.TDOA.completedRuns[0].characterName).toBe('Nathaniel Cho');
    expect(finalState.TTOI.completedRuns).toHaveLength(1);
    expect(finalState.TTOI.completedRuns[0].characterName).toBe('Agnes Baker');
    expect(finalState.TKM.completedRuns).toHaveLength(0);
  });

  it('should share dice roll state across all campaigns', async () => {
    const user = userEvent.setup();

    const initialState = {
      TDOA: {
        currentCharacterName: 'Nathaniel Cho',
        characters: {
          'Nathaniel Cho': {
            attributes: {
              willpower: 3,
              intellect: 2,
              combat: 5,
              health: 9,
              sanity: 6,
              resources: 0,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: {
        currentCharacterName: 'Agnes Baker',
        characters: {
          'Agnes Baker': {
            attributes: {
              willpower: 5,
              intellect: 2,
              combat: 2,
              health: 6,
              sanity: 8,
              resources: 0,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: []
          }
        },
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
      shared: { diceRoll: 3 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Verify dice roll is shared across campaigns
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.shared.diceRoll).toBe(3);

    // Switch to TTOI
    const ttoiTab = screen.getByRole('tab', { name: /TTOI/i });
    await user.click(ttoiTab);

    // Verify character loaded and dice roll still 3
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Agnes Baker/);
      expect(placeholder).toBeInTheDocument();
    });

    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.shared.diceRoll).toBe(3);
  });
});
