import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

/**
 * Integration test for full character selection flow
 * Testing: click → modal → confirmation → state update → localStorage
 */

describe('Character Selection Flow - Integration Test', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage
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

  it('should allow selecting a character for the first time', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially, no character is selected
    const placeholder = screen.getByPlaceholderText('Select Character');
    expect(placeholder).toBeInTheDocument();

    // Click the autocomplete to open dropdown
    await user.click(placeholder);

    // Wait for options to appear and select Rex Murphy
    const rexOption = await screen.findByText(/Rex Murphy.*The Reporter/);
    await user.click(rexOption);

    // Character should now be displayed in the placeholder
    await waitFor(() => {
      const updatedPlaceholder = screen.getByPlaceholderText(/Rex Murphy.*The Reporter/);
      expect(updatedPlaceholder).toBeInTheDocument();
    });

    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalled();
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Rex Murphy');
    expect(savedState.TDOA.characters['Rex Murphy']).toBeDefined();
  });

  it('should show confirmation modal when switching to different character', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with Rex Murphy
    const initialState = {
      TDOA: {
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
            abilities: ['Scholar'],
            weaknesses: ['Paranoid'],
            items: ['Magnifying Glass'],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Click autocomplete
    const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
    await user.click(placeholder);

    // Select Agnes Baker (different character)
    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);

    // Should see confirmation modal
    await waitFor(() => {
      expect(screen.getByText(/Switch Character/i)).toBeInTheDocument();
      expect(screen.getByText(/Switching to/i)).toBeInTheDocument();
      expect(screen.getByText(/Agnes Baker/i)).toBeInTheDocument();
    });

    // Confirm the switch
    const confirmButton = screen.getByText(/^Confirm$/i);
    await user.click(confirmButton);

    // Character should be switched
    await waitFor(() => {
      const updatedPlaceholder = screen.getByPlaceholderText(/Agnes Baker.*The Waitress/);
      expect(updatedPlaceholder).toBeInTheDocument();
    });

    // Verify state was updated
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Agnes Baker');
  });

  it('should show load/restart modal when selecting previously played character', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with Norman selected and Agnes previously played
    const initialState = {
      TDOA: {
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
            abilities: ['Scholar'],
            weaknesses: ['Paranoid'],
            items: [],
            secrets: []
          },
          'Agnes Baker': {
            attributes: {
              willpower: 3, // Modified from default
              intellect: 2,
              combat: 2,
              health: 4,
              sanity: 6,
              resources: 4,
              clues: 2,
              doom: 1
            },
            abilities: ['Mystic'],
            weaknesses: ['Dark Memory'],
            items: ['Spell Book'],
            secrets: ['Secret 1']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Click autocomplete
    const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
    await user.click(placeholder);

    // Select Agnes Baker (previously played)
    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);

    // Should see load/restart modal
    await waitFor(() => {
      expect(screen.getByText(/Load or Restart/i)).toBeInTheDocument();
    });

    // Choose "Load" to preserve progress
    const loadButton = screen.getByText(/Load Saved/i);
    await user.click(loadButton);

    // Character should be switched
    await waitFor(() => {
      const updatedPlaceholder = screen.getByPlaceholderText(/Agnes Baker.*The Waitress/);
      expect(updatedPlaceholder).toBeInTheDocument();
    });

    // Verify preserved state (willpower should be 3, not default 5)
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Agnes Baker');
    expect(savedState.TDOA.characters['Agnes Baker'].attributes.willpower).toBe(3);
    expect(savedState.TDOA.characters['Agnes Baker'].items).toContain('Spell Book');
    expect(savedState.TDOA.characters['Agnes Baker'].secrets).toContain('Secret 1');
  });

  it('should restart character with defaults when choosing restart', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with Rex Murphy selected, and Agnes previously played with modified stats
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
            abilities: ['Reporter', 'Seeker'],
            weaknesses: ["Rex's Curse", 'Cursed'],
            items: ["Reporter's Notebook"],
            secrets: []
          },
          'Agnes Baker': {
            attributes: {
              willpower: 3, // Modified
              intellect: 2,
              combat: 2,
              health: 4, // Modified
              sanity: 6, // Modified
              resources: 2, // Modified
              clues: 5, // Modified
              doom: 3 // Modified
            },
            abilities: ['Mystic', 'Extra Ability'],
            weaknesses: ['Dark Memory'],
            items: ['Spell Book', 'Crystal'],
            secrets: ['Secret 1', 'Secret 2']
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Select Agnes Baker from Rex Murphy
    const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
    await user.click(placeholder);

    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);

    // Should see load/restart modal
    await waitFor(() => {
      expect(screen.getByText(/Load or Restart/i)).toBeInTheDocument();
    });

    // Choose "Restart" to reset to defaults
    const restartButton = screen.getByText(/Restart Fresh/i);
    await user.click(restartButton);

    // Character should be restarted with defaults
    await waitFor(() => {
      const updatedPlaceholder = screen.getByPlaceholderText(/Agnes Baker.*The Waitress/);
      expect(updatedPlaceholder).toBeInTheDocument();
    });

    // Verify reset state (willpower should be default 5, not 3)
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Agnes Baker');
    expect(savedState.TDOA.characters['Agnes Baker'].attributes.willpower).toBe(5);
    expect(savedState.TDOA.characters['Agnes Baker'].secrets).toEqual([]);
    
    // Extra items/abilities should be reset to defaults
    expect(savedState.TDOA.characters['Agnes Baker'].items).not.toContain('Crystal');
    expect(savedState.TDOA.characters['Agnes Baker'].abilities).not.toContain('Extra Ability');
  });

  it('should cancel character switch and keep current selection', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with Norman
    const initialState = {
      TDOA: {
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
            abilities: ['Scholar'],
            weaknesses: ['Paranoid'],
            items: [],
            secrets: []
          }
        },
        foundSecrets: [],
        bookmark: 0,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Click autocomplete
    const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
    await user.click(placeholder);

    // Select Agnes Baker
    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);

    // Should see confirmation modal
    await waitFor(() => {
      expect(screen.getByText(/Switch Character/i)).toBeInTheDocument();
    });

    // Cancel the switch
    const cancelButton = screen.getByText(/Cancel/i);
    await user.click(cancelButton);

    // Should still have Norman selected
    await waitFor(() => {
      const placeholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(placeholder).toBeInTheDocument();
    });

    // State should be unchanged
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Rex Murphy');
  });

  it('should persist character selection across component remounts', async () => {
    const user = userEvent.setup();
    
    // Render, select character, unmount
    const { unmount } = render(<App />);

    const placeholder = screen.getByPlaceholderText('Select Character');
    await user.click(placeholder);

    const normanOption = await screen.findByText(/Rex Murphy.*The Reporter/);
    await user.click(normanOption);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Rex Murphy/)).toBeInTheDocument();
    });

    // Unmount component
    unmount();

    // Re-render (simulating page refresh)
    render(<App />);

    // Character should still be selected
    await waitFor(() => {
      const persistedPlaceholder = screen.getByPlaceholderText(/Rex Murphy/);
      expect(persistedPlaceholder).toBeInTheDocument();
    });
  });
});
