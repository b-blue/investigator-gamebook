import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const user = userEvent.setup();

    // Render app and set up initial state
    const { unmount } = render(<App />);

    // Select character
    const charSelect = screen.getByPlaceholderText('Select Character');
    await user.click(charSelect);
    
    const normanOption = await screen.findByText(/Rex Murphy.*The Reporter/);
    await user.click(normanOption);

    await waitFor(() => {
      expect(startButton).toBeInTheDocument();
    });

    // Update some attributes
    await waitFor(() => {
      expect(screen.getByText(/Willpower/i)).toBeInTheDocument();
    });

    const willpowerPlus = screen.getAllByText('+')[0];
    await user.click(willpowerPlus);
    await user.click(willpowerPlus);

    // Add an item
    const itemInput = screen.getByPlaceholderText('Add item...');
    await user.type(itemInput, 'Ancient Tome');
    await user.keyboard('{Enter}');

    // Set bookmark
    const bookmarkInput = screen.getByLabelText('Page #');
    await user.clear(bookmarkInput);
    await user.type(bookmarkInput, '156');

    // Wait for state to persist
    await waitFor(() => {
      const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(savedState.TDOA.bookmark).toBe(156);
    });

    // Get the current state before unmount
    const stateBeforeUnmount = JSON.parse(localStorageMock['arkham-gamebook-state']);

    // Unmount the component (simulate page close)
    unmount();

    // Remount the component (simulate page refresh)
    render(<App />);

    // Verify character is still selected
    await waitFor(() => {
      expect(screen.getByText(/Rex Murphy/i)).toBeInTheDocument();
    });

    // Verify bookmark is restored
    const restoredBookmarkInput = screen.getByLabelText('Page #');
    expect(restoredBookmarkInput).toHaveValue('156');

    // Verify item is restored
    expect(screen.getByText('Ancient Tome')).toBeInTheDocument();

    // Verify the state is identical
    const stateAfterRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateAfterRemount).toEqual(stateBeforeUnmount);
  });

  it('should persist secrets and abilities across remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<App />);

    // Select and start with Agnes Baker
    const charSelect = screen.getByPlaceholderText('Select Character');
    await user.click(charSelect);
    
    const agnesOption = await screen.findByText(/Agnes Baker.*The Waitress/);
    await user.click(agnesOption);


    // Add secrets
    await waitFor(() => {
      expect(screen.getByText(/Secrets/i)).toBeInTheDocument();
    });

    const secretInput = screen.getByPlaceholderText('Add secret...');
    await user.type(secretInput, 'The Yellow Sign');
    await user.keyboard('{Enter}');
    await user.type(secretInput, 'Lost Carcosa');
    await user.keyboard('{Enter}');

    // Add abilities
    const abilityInput = screen.getByPlaceholderText('Add ability...');
    await user.type(abilityInput, 'Spell Casting');
    await user.keyboard('{Enter}');

    // Wait for persistence
    await waitFor(() => {
      const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(savedState.TDOA.characters['Agnes Baker'].secrets).toContain('The Yellow Sign');
    });

    // Unmount and remount
    unmount();
    render(<App />);

    // Verify secrets are restored
    await waitFor(() => {
      expect(screen.getByText('The Yellow Sign')).toBeInTheDocument();
      expect(screen.getByText('Lost Carcosa')).toBeInTheDocument();
      expect(screen.getByText('Spell Casting')).toBeInTheDocument();
    });
  });

  it('should persist completedRuns and foundSecrets across remounts', async () => {
    // Pre-populate with completed runs and found secrets
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
          },
          {
            characterName: 'Rex Murphy',
            timestamp: 1234569999,
            secrets: ['Secret Beta'],
            stars: 2
          }
        ]
      },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TKM: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(initialState);

    const { unmount } = render(<App />);

    // Open run history modal (assuming there's a button to view it)
    // Since no character is selected, we might need to trigger it differently
    // For now, just verify the state is there
    const stateBeforeUnmount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateBeforeUnmount.TDOA.completedRuns).toHaveLength(2);
    expect(stateBeforeUnmount.TDOA.foundSecrets).toHaveLength(2);

    // Unmount and remount
    unmount();
    render(<App />);

    // Verify state is still intact
    const stateAfterRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateAfterRemount.TDOA.completedRuns).toHaveLength(2);
    expect(stateAfterRemount.TDOA.completedRuns[0].characterName).toBe('Nathaniel Cho');
    expect(stateAfterRemount.TDOA.completedRuns[1].characterName).toBe('Rex Murphy');
    expect(stateAfterRemount.TDOA.foundSecrets).toContain('Secret Alpha');
    expect(stateAfterRemount.TDOA.foundSecrets).toContain('Secret Beta');
  });

  it('should handle empty state on first load', async () => {
    // No localStorage entry - fresh start
    render(<App />);

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText(/The Darkness Over Arkham/i)).toBeInTheDocument();
    });

    // Verify default state is created
    await waitFor(() => {
      const savedState = JSON.parse(localStorageMock['arkham-gamebook-state'] || '{}');
      expect(savedState).toBeDefined();
      expect(savedState.TDOA).toBeDefined();
      expect(savedState.TTOI).toBeDefined();
      expect(savedState.TKM).toBeDefined();
    });
  });

  it('should migrate old state format to new format on load', async () => {
    // Simulate old state format (if migration logic exists)
    const oldState = {
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
      bookmark: 0
    };
    localStorageMock['arkham-gamebook-state'] = JSON.stringify(oldState);

    render(<App />);

    // App should migrate the state
    await waitFor(() => {
      const migratedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
      
      // New format should have campaign structure
      expect(migratedState.TDOA).toBeDefined();
      expect(migratedState.TTOI).toBeDefined();
      expect(migratedState.TKM).toBeDefined();
      
      // Old data should be preserved in TDOA
      expect(migratedState.TDOA.currentCharacterName).toBe('Rex Murphy');
      expect(migratedState.TDOA.characters['Rex Murphy']).toBeDefined();
    });
  });

  it('should preserve dice roll state across remounts', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<App />);

    // Select character and start
    const charSelect = screen.getByPlaceholderText('Select Character');
    await user.click(charSelect);
    
    const rolandOption = await screen.findByText(/Nathaniel Cho.*The Boxer/);
    await user.click(rolandOption);


    // Roll dice
    await waitFor(() => {
      expect(screen.getByText(/Roll Dice/i)).toBeInTheDocument();
    });

    const rollButton = screen.getByText(/Roll Dice/i);
    await user.click(rollButton);

    // Get the dice roll value
    await waitFor(() => {
      const savedState = JSON.parse(localStorageMock['arkham-gamebook-state']);
      expect(savedState.shared.diceRoll).toBeGreaterThanOrEqual(1);
      expect(savedState.shared.diceRoll).toBeLessThanOrEqual(6);
    });

    const stateBeforeUnmount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    const diceRollBeforeUnmount = stateBeforeUnmount.shared.diceRoll;

    // Unmount and remount
    unmount();
    render(<App />);

    // Dice roll should be preserved
    const stateAfterRemount = JSON.parse(localStorageMock['arkham-gamebook-state']);
    expect(stateAfterRemount.shared.diceRoll).toBe(diceRollBeforeUnmount);
  });
});
