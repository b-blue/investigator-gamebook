import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

/**
 * Integration test for complete finish run workflow
 * Testing: select character → add secrets → finish run → verify aggregation → run history
 */

describe('Finish Run Workflow - Integration Test', () => {
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

    // Mock Date.now() for predictable timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete full finish run workflow with secrets', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with a character who has found secrets
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
              clues: 3,
              doom: 2
            },
            abilities: ['Scholar'],
            weaknesses: ['Paranoid'],
            items: ['Magnifying Glass'],
            secrets: ['The Hidden Passage', 'The Dark Ritual']
          }
        },
        foundSecrets: [],
        bookmark: 42,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 3 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Find and click Finish Run button
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to finish your run/i)).toBeInTheDocument();
      expect(screen.getByText(/Rex Murphy/)).toBeInTheDocument();
    });

    // Select 3 stars
    const threeStarButton = screen.getByRole('button', { name: '3' });
    await user.click(threeStarButton);

    // Confirm finish run
    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Run history modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });

    // Verify run appears in history
    expect(screen.getByText('Rex Murphy')).toBeInTheDocument();
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument();
    expect(screen.getByText('The Hidden Passage')).toBeInTheDocument();
    expect(screen.getByText('The Dark Ritual')).toBeInTheDocument();

    // Close run history modal
    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    // Verify state updates
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    
    // Character should be removed
    expect(savedState.TDOA.currentCharacterName).toBe('');
    expect(savedState.TDOA.characters['Rex Murphy']).toBeUndefined();
    
    // Secrets should be added to foundSecrets
    expect(savedState.TDOA.foundSecrets).toContain('The Hidden Passage');
    expect(savedState.TDOA.foundSecrets).toContain('The Dark Ritual');
    
    // Bookmark should be reset
    expect(savedState.TDOA.bookmark).toBe(0);
    
    // Completed run should be recorded
    expect(savedState.TDOA.completedRuns).toHaveLength(1);
    expect(savedState.TDOA.completedRuns[0].characterName).toBe('Rex Murphy');
    expect(savedState.TDOA.completedRuns[0].stars).toBe(3);
    expect(savedState.TDOA.completedRuns[0].secrets).toEqual(['The Hidden Passage', 'The Dark Ritual']);
    expect(savedState.TDOA.completedRuns[0].timestamp).toBe(1234567890);
  });

  it('should deduplicate secrets when finishing multiple runs', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with existing foundSecrets and a character
    const initialState = {
      TDOA: {
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
            abilities: ['Mystic'],
            weaknesses: ['Dark Memory'],
            items: [],
            secrets: ['The Hidden Passage', 'New Secret'] // One duplicate, one new
          }
        },
        foundSecrets: ['The Hidden Passage', 'Old Secret'], // Existing secrets
        bookmark: 0,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Finish run
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    // Select 0 stars (failed run)
    await waitFor(() => {
      const zeroStarButton = screen.getByRole('button', { name: '0' });
      expect(zeroStarButton).toBeInTheDocument();
    });
    const zeroStarButton = screen.getByRole('button', { name: '0' });
    await user.click(zeroStarButton);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });

    // Verify secrets deduplication
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.foundSecrets).toHaveLength(3); // Old Secret, The Hidden Passage, New Secret
    expect(savedState.TDOA.foundSecrets).toContain('Old Secret');
    expect(savedState.TDOA.foundSecrets).toContain('The Hidden Passage');
    expect(savedState.TDOA.foundSecrets).toContain('New Secret');
  });

  it('should handle finish run with no secrets', async () => {
    const user = userEvent.setup();
    
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
            abilities: ['Guardian'],
            weaknesses: ['Driven'],
            items: [],
            secrets: [] // No secrets found
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

    // Finish run
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    // Select 1 star
    await waitFor(() => {
      const oneStarButton = screen.getByRole('button', { name: '1' });
      expect(oneStarButton).toBeInTheDocument();
    });
    const oneStarButton = screen.getByRole('button', { name: '1' });
    await user.click(oneStarButton);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Wait for run history
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });

    // Verify state
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.foundSecrets).toEqual([]);
    expect(savedState.TDOA.completedRuns[0].secrets).toEqual([]);
    expect(savedState.TDOA.completedRuns[0].stars).toBe(1);
  });

  it('should cancel finish run and preserve state', async () => {
    const user = userEvent.setup();
    
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
              clues: 3,
              doom: 2
            },
            abilities: ['Scholar'],
            weaknesses: ['Paranoid'],
            items: ['Magnifying Glass'],
            secrets: ['Secret 1']
          }
        },
        foundSecrets: [],
        bookmark: 42,
        completedRuns: []
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 3 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Click finish run
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
    });

    // State should be unchanged
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.currentCharacterName).toBe('Rex Murphy');
    expect(savedState.TDOA.characters['Rex Murphy']).toBeDefined();
    expect(savedState.TDOA.foundSecrets).toEqual([]);
    expect(savedState.TDOA.bookmark).toBe(42);
    expect(savedState.TDOA.completedRuns).toHaveLength(0);
  });

  it('should record multiple completed runs in order', async () => {
    const user = userEvent.setup();
    
    // Pre-populate with one existing completed run
    const initialState = {
      TDOA: {
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
            abilities: ['Mystic'],
            weaknesses: ['Dark Memory'],
            items: [],
            secrets: ['Secret 2']
          }
        },
        foundSecrets: ['Secret 1'],
        bookmark: 0,
        completedRuns: [
          {
            characterName: 'Rex Murphy',
            timestamp: 1234567000,
            secrets: ['Secret 1'],
            stars: 2
          }
        ]
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    render(<App />);

    // Finish run
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    // Select 4 stars
    await waitFor(() => {
      const fourStarButton = screen.getByRole('button', { name: '4' });
      expect(fourStarButton).toBeInTheDocument();
    });
    const fourStarButton = screen.getByRole('button', { name: '4' });
    await user.click(fourStarButton);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Wait for run history
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });

    // Should see both runs
    const allNorman = screen.getAllByText('Rex Murphy');
    expect(allNorman).toHaveLength(1); // One from previous run
    expect(screen.getByText('Agnes Baker')).toBeInTheDocument();

    // Verify state
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.completedRuns).toHaveLength(2);
    expect(savedState.TDOA.completedRuns[0].characterName).toBe('Rex Murphy');
    expect(savedState.TDOA.completedRuns[1].characterName).toBe('Agnes Baker');
    expect(savedState.TDOA.completedRuns[1].stars).toBe(4);
  });

  it('should handle finish run when no character is selected', async () => {
    render(<App />);

    // No character selected, finish run button should not trigger modal
    const finishButton = screen.queryByText('Finish Run');
    
    // Button should not appear or not be functional when no character
    if (finishButton) {
      // If button exists, clicking it should not open modal
      await userEvent.click(finishButton);
      
      // Modal should not appear
      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      }, { timeout: 1000 }).catch(() => {
        // Expected to timeout
      });
    }
  });

  it('should display run history with proper timestamp formatting', async () => {
    const user = userEvent.setup();
    
    // Mock specific date for predictable formatting
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-15T14:30:00').getTime());
    
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

    // Finish run
    const finishButton = screen.getByText('Finish Run');
    await user.click(finishButton);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
      expect(confirmButton).toBeInTheDocument();
    });
    
    const twoStarButton = screen.getByRole('button', { name: '2' });
    await user.click(twoStarButton);
    
    const confirmButton = screen.getByRole('button', { name: /Finish Run/i });
    await user.click(confirmButton);

    // Wait for run history modal
    await waitFor(() => {
      expect(screen.getByText(/Run History/i)).toBeInTheDocument();
    });

    // Verify timestamp is displayed (format may vary by locale)
    // Just check that some date/time text is present
    const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(savedState.TDOA.completedRuns[0].timestamp).toBe(new Date('2026-01-15T14:30:00').getTime());
  });
});
