import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

    render(<App />);

    // Default campaign is TDOA - select a character
    const charSelect = screen.getByPlaceholderText('Select Character');
    await user.click(charSelect);
    
    const normanOption = await screen.findByText(/Rex Murphy.*The Reporter/);
    await user.click(normanOption);


    // Verify we're in TDOA
    await waitFor(() => {
      expect(screen.getByText(/The Darkness Over Arkham/i)).toBeInTheDocument();
    });

    // Get TDOA state
    const tdoaState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(tdoaState.TDOA.currentCharacterName).toBe('Rex Murphy');

    // Switch to TTOI campaign
    const ttoiTab = screen.getByRole('tab', { name: /The Tides of Innsmouth/i });
    await user.click(ttoiTab);

    // Wait for campaign switch
    await waitFor(() => {
      expect(screen.getByText(/The Tides of Innsmouth/i)).toBeInTheDocument();
    });

    // Should have no character selected in TTOI
    const ttoiCharSelect = screen.getByPlaceholderText('Select Character');
    expect(ttoiCharSelect).toHaveAttribute('placeholder', 'Select Character');

    // Select different character in TTOI
    await user.click(ttoiCharSelect);
    
    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);


    // Get TTOI state
    const ttoiState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(ttoiState.TTOI.currentCharacterName).toBe('Agnes Baker');
    expect(ttoiState.TDOA.currentCharacterName).toBe('Rex Murphy'); // TDOA unchanged

    // Switch back to TDOA
    const tdoaTab = screen.getByRole('tab', { name: /The Darkness Over Arkham/i });
    await user.click(tdoaTab);

    // Should still have Norman selected
    await waitFor(() => {
      expect(screen.getByText(/Rex Murphy/i)).toBeInTheDocument();
    });
  });

  it('should maintain separate bookmarks for each campaign', async () => {
    const user = userEvent.setup();

    // Pre-populate with characters in all three campaigns
    const initialState = {
      TDOA: {
        currentCharacterName: 'Nathaniel Cho',
        characters: {
          'Nathaniel Cho': {
            attributes: {
              willpower: 3,
              intellect: 3,
              combat: 4,
              health: 9,
              sanity: 5,
              resources: 4,
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
        bookmark: 100, // TDOA bookmark
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
              resources: 4,
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
        bookmark: 200, // TTOI bookmark
        completedRuns: []
      },
      TKM: {
        currentCharacterName: 'Rex Murphy',
        characters: {
          'Rex Murphy': {
            attributes: {
              willpower: 4,
              intellect: 5,
              combat: 2,
              health: 6,
              sanity: 8,
              resources: 4,
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
        bookmark: 300, // TKM bookmark
        completedRuns: []
      },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Default is TDOA - verify bookmark
    const tdoaBookmark = screen.getByLabelText('Page #');
    expect(tdoaBookmark).toHaveValue('100');

    // Switch to TTOI
    const ttoiTab = screen.getByRole('tab', { name: /The Tides of Innsmouth/i });
    await user.click(ttoiTab);

    await waitFor(() => {
      const ttoiBookmark = screen.getByLabelText('Page #');
      expect(ttoiBookmark).toHaveValue('200');
    });

    // Switch to TKM
    const tkmTab = screen.getByRole('tab', { name: /The Kingsport Metamorphosis/i });
    await user.click(tkmTab);

    await waitFor(() => {
      const tkmBookmark = screen.getByLabelText('Page #');
      expect(tkmBookmark).toHaveValue('300');
    });

    // Update TKM bookmark
    const tkmBookmark = screen.getByLabelText('Page #');
    await user.clear(tkmBookmark);
    await user.type(tkmBookmark, '350');

    // Switch back to TDOA - should still be 100
    const tdoaTab = screen.getByRole('tab', { name: /The Darkness Over Arkham/i });
    await user.click(tdoaTab);

    await waitFor(() => {
      const finalTdoaBookmark = screen.getByLabelText('Page #');
      expect(finalTdoaBookmark).toHaveValue('100');
    });

    // Verify all bookmarks in state
    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.TDOA.bookmark).toBe(100);
    expect(finalState.TTOI.bookmark).toBe(200);
    expect(finalState.TKM.bookmark).toBe(350);
  });

  it('should maintain separate foundSecrets for each campaign', async () => {
    const user = userEvent.setup();

    // Pre-populate with different secrets in each campaign
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

    // Verify foundSecrets in localStorage for each campaign
    const state = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(state.TDOA.foundSecrets).toHaveLength(2);
    expect(state.TTOI.foundSecrets).toHaveLength(1);
    expect(state.TKM.foundSecrets).toHaveLength(0);

    // Switch campaigns and verify isolation
    const ttoiTab = screen.getByRole('tab', { name: /The Tides of Innsmouth/i });
    await user.click(ttoiTab);

    const updatedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(updatedState.TDOA.foundSecrets).toHaveLength(2); // TDOA unchanged
    expect(updatedState.TTOI.foundSecrets).toHaveLength(1); // TTOI still 1
  });

  it('should maintain separate completedRuns for each campaign', async () => {
    const user = userEvent.setup();

    // Pre-populate with completed runs in different campaigns
    const initialState = {
      TDOA: {
        currentCharacterName: 'Nathaniel Cho',
        characters: {
          'Nathaniel Cho': {
            attributes: {
              willpower: 3,
              intellect: 3,
              combat: 4,
              health: 9,
              sanity: 5,
              resources: 4,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['TDOA Secret']
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
              resources: 4,
              clues: 0,
              doom: 0
            },
            abilities: [],
            weaknesses: [],
            items: [],
            secrets: ['TTOI Secret']
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

    // Finish run in TDOA
    const tdoaFinishButton = screen.getByText('Finish Run');
    await user.click(tdoaFinishButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    const twoStarButton = screen.getByRole('button', { name: '2' });
    await user.click(twoStarButton);

    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Close run history modal
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });
    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    // Switch to TTOI
    const ttoiTab = screen.getByRole('tab', { name: /The Tides of Innsmouth/i });
    await user.click(ttoiTab);

    // Finish run in TTOI
    await waitFor(() => {
      expect(screen.getByText('Finish Run')).toBeInTheDocument();
    });

    const ttoiFinishButton = screen.getByText('Finish Run');
    await user.click(ttoiFinishButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    const fourStarButton = screen.getByRole('button', { name: '4' });
    await user.click(fourStarButton);

    const ttoiConfirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(ttoiConfirmButton);

    // Verify state
    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    
    // TDOA should have 1 completed run
    expect(finalState.TDOA.completedRuns).toHaveLength(1);
    expect(finalState.TDOA.completedRuns[0].characterName).toBe('Nathaniel Cho');
    expect(finalState.TDOA.completedRuns[0].stars).toBe(2);
    
    // TTOI should have 1 completed run
    expect(finalState.TTOI.completedRuns).toHaveLength(1);
    expect(finalState.TTOI.completedRuns[0].characterName).toBe('Agnes Baker');
    expect(finalState.TTOI.completedRuns[0].stars).toBe(4);
    
    // TKM should have no completed runs
    expect(finalState.TKM.completedRuns).toHaveLength(0);
  });

  it('should share dice roll state across all campaigns', async () => {
    const user = userEvent.setup();

    // Pre-populate with characters in different campaigns
    const initialState = {
      TDOA: {
        currentCharacterName: 'Nathaniel Cho',
        characters: {
          'Nathaniel Cho': {
            attributes: {
              willpower: 3,
              intellect: 3,
              combat: 4,
              health: 9,
              sanity: 5,
              resources: 4,
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
              resources: 4,
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

    // Roll dice in TDOA
    const rollButton = screen.getByText(/Roll Dice/i);
    await user.click(rollButton);

    // Get dice roll value
    await waitFor(() => {
      const state = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(state.shared.diceRoll).toBeGreaterThanOrEqual(1);
      expect(state.shared.diceRoll).toBeLessThanOrEqual(6);
    });

    const stateAfterRoll = JSON.parse(localStorageMock['arkham-gamebook-state']);
    const diceRollValue = stateAfterRoll.shared.diceRoll;

    // Switch to TTOI
    const ttoiTab = screen.getByRole('tab', { name: /The Tides of Innsmouth/i });
    await user.click(ttoiTab);

    // Dice roll should be the same (shared state)
    const ttoiState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(ttoiState.shared.diceRoll).toBe(diceRollValue);

    // Roll again in TTOI
    await waitFor(() => {
      expect(screen.getByText(/Roll Dice/i)).toBeInTheDocument();
    });

    const ttoiRollButton = screen.getByText(/Roll Dice/i);
    await user.click(ttoiRollButton);

    // Get new dice roll value
    await waitFor(() => {
      const state = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(state.shared.diceRoll).toBeGreaterThanOrEqual(1);
      expect(state.shared.diceRoll).toBeLessThanOrEqual(6);
    });

    const newDiceRollValue = JSON.parse(localStorageMock['arkham-gamebook-state']).shared.diceRoll;

    // Switch back to TDOA
    const tdoaTab = screen.getByRole('tab', { name: /The Darkness Over Arkham/i });
    await user.click(tdoaTab);

    // Should see the updated dice roll (shared)
    const finalState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(finalState.shared.diceRoll).toBe(newDiceRollValue);
  });
});
