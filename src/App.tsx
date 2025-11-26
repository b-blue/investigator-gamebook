import { useState, useEffect } from 'react'
import './App.css'
import { ButtonGroup, Button } from '@mui/material'
import type { GameType, AppState, Character as CharacterType } from './types'
import GameTabs from './components/GameTabs'
import DiceRoller from './components/DiceRoller'
import Character from './components/Character'
import AttributesSection from './components/AttributesSection'
import ItemsSection from './components/ItemsSection'
import AbilitiesSection from './components/AbilitiesSection'
import WeaknessesSection from './components/WeaknessesSection'
import SecretsSection from './components/SecretsSection'

const GAME_TITLES = {
  TDOA: 'The Darkness Over Arkham',
  TTOI: 'The Tides of Innsmouth'
};

const STORAGE_KEY = 'arkham-gamebook-state';

const DEFAULT_ATTRIBUTES = {
  willpower: 0,
  intellect: 0,
  combat: 0,
  health: 0,
  sanity: 0,
  resources: 0,
  clues: 0,
  doom: 0
};

function App() {
  const [activeGame, setActiveGame] = useState<GameType>('TDOA');
  const [finishRunModalOpen, setFinishRunModalOpen] = useState(false);
  const [showSecretsView, setShowSecretsView] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkInput, setBookmarkInput] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [showRunHistoryModal, setShowRunHistoryModal] = useState(false);
  const [gameState, setGameState] = useState<AppState>(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultState: AppState = {
      TDOA: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [], bookmark: 0, completedRuns: [] },
      shared: { diceRoll: 1 }
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Check if it's the new format with foundSecrets
        if (parsed.TDOA?.foundSecrets !== undefined) {
          return {
            TDOA: {
              currentCharacterName: parsed.TDOA?.currentCharacterName || '',
              characters: parsed.TDOA?.characters || {},
              foundSecrets: parsed.TDOA?.foundSecrets || [],
              bookmark: parsed.TDOA?.bookmark || 0,
              completedRuns: parsed.TDOA?.completedRuns || []
            },
            TTOI: {
              currentCharacterName: parsed.TTOI?.currentCharacterName || '',
              characters: parsed.TTOI?.characters || {},
              foundSecrets: parsed.TTOI?.foundSecrets || [],
              bookmark: parsed.TTOI?.bookmark || 0,
              completedRuns: parsed.TTOI?.completedRuns || []
            },
            shared: {
              diceRoll: parsed.shared?.diceRoll || 1
            }
          };
        }
        
        // Migrate old format to new format
        const migrateGame = (oldGame: any) => {
          const charName = oldGame?.characterName || '';
          const characters: Record<string, any> = {};
          if (charName) {
            characters[charName] = {
              attributes: oldGame?.attributes || DEFAULT_ATTRIBUTES,
              abilities: oldGame?.abilities || [],
              weaknesses: oldGame?.weaknesses || [],
              items: oldGame?.items || [],
              secrets: [] // Initialize empty secrets for migrated characters
            };
          }
          return {
            currentCharacterName: charName,
            characters,
            foundSecrets: [], // Initialize empty foundSecrets
            bookmark: 0, // Initialize bookmark
            completedRuns: [] // Initialize completedRuns
          };
        };
        
        return {
          TDOA: migrateGame(parsed.TDOA),
          TTOI: migrateGame(parsed.TTOI),
          shared: {
            diceRoll: parsed.shared?.diceRoll || parsed.TDOA?.diceRoll || 1
          }
        };
      } catch {
        return defaultState;
      }
    }
    
    return defaultState;
  });

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const rollDice = () => {
    const newRoll = Math.floor(Math.random() * 6) + 1;
    setGameState(prev => ({
      ...prev,
      shared: {
        ...prev.shared,
        diceRoll: newRoll
      }
    }));
  };

  // Helper to get current character state
  const getCurrentCharacter = () => {
    const charName = gameState[activeGame].currentCharacterName;
    return charName && gameState[activeGame].characters[charName]
      ? gameState[activeGame].characters[charName]
      : { attributes: DEFAULT_ATTRIBUTES, abilities: [], weaknesses: [], items: [], secrets: [] };
  };

  const handleCharacterSelect = (character: CharacterType, mode: 'restart' | 'load') => {
    setGameState(prev => {
      const currentGame = prev[activeGame];
      const newCharacters = { ...currentGame.characters };
      
      if (mode === 'restart') {
        // Restart mode: overwrite with character defaults
        newCharacters[character.name] = {
          attributes: character.attributes,
          abilities: character.abilities,
          weaknesses: character.weaknesses,
          items: character.items,
          secrets: []
        };
      }
      // Load mode: character already exists in map, just switch to it
      
      return {
        ...prev,
        [activeGame]: {
          ...currentGame,
          currentCharacterName: character.name,
          characters: newCharacters
        }
      };
    });
  };

  const updateAttribute = (attrName: keyof typeof DEFAULT_ATTRIBUTES, value: number) => {
    setGameState(prev => {
      const charName = prev[activeGame].currentCharacterName;
      if (!charName) return prev;
      
      return {
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          characters: {
            ...prev[activeGame].characters,
            [charName]: {
              ...prev[activeGame].characters[charName],
              attributes: {
                ...prev[activeGame].characters[charName].attributes,
                [attrName]: value
              }
            }
          }
        }
      };
    });
  };

  const updateItems = (items: string[]) => {
    setGameState(prev => {
      const charName = prev[activeGame].currentCharacterName;
      if (!charName) return prev;
      
      return {
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          characters: {
            ...prev[activeGame].characters,
            [charName]: {
              ...prev[activeGame].characters[charName],
              items
            }
          }
        }
      };
    });
  };

  const updateAbilities = (abilities: string[]) => {
    setGameState(prev => {
      const charName = prev[activeGame].currentCharacterName;
      if (!charName) return prev;
      
      return {
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          characters: {
            ...prev[activeGame].characters,
            [charName]: {
              ...prev[activeGame].characters[charName],
              abilities
            }
          }
        }
      };
    });
  };

  const updateWeaknesses = (weaknesses: string[]) => {
    setGameState(prev => {
      const charName = prev[activeGame].currentCharacterName;
      if (!charName) return prev;
      
      return {
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          characters: {
            ...prev[activeGame].characters,
            [charName]: {
              ...prev[activeGame].characters[charName],
              weaknesses
            }
          }
        }
      };
    });
  };

  const updateSecrets = (secrets: string[]) => {
    setGameState(prev => {
      const charName = prev[activeGame].currentCharacterName;
      if (!charName) return prev;
      
      return {
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          characters: {
            ...prev[activeGame].characters,
            [charName]: {
              ...prev[activeGame].characters[charName],
              secrets
            }
          }
        }
      };
    });
  };

  const handleFinishRun = () => {
    const charName = gameState[activeGame].currentCharacterName;
    if (!charName) return;
    
    setSelectedStars(0); // Reset to 0 stars
    setFinishRunModalOpen(true);
  };

  const confirmFinishRun = () => {
    const charName = gameState[activeGame].currentCharacterName;
    if (!charName) return;
    
    setGameState(prev => {
      const character = prev[activeGame].characters[charName];
      const newCharacters = { ...prev[activeGame].characters };
      delete newCharacters[charName];
      
      // Add character's secrets to foundSecrets
      const currentFoundSecrets = prev[activeGame].foundSecrets;
      const newFoundSecrets = [...new Set([...currentFoundSecrets, ...(character?.secrets || [])])];
      
      // Create completed run entry
      const completedRun = {
        characterName: charName,
        timestamp: Date.now(),
        secrets: character?.secrets || [],
        stars: selectedStars
      };
      
      return {
        ...prev,
        [activeGame]: {
          currentCharacterName: '',
          characters: newCharacters,
          foundSecrets: newFoundSecrets,
          bookmark: 0,
          completedRuns: [...prev[activeGame].completedRuns, completedRun]
        }
      };
    });
    
    setFinishRunModalOpen(false);
    setShowRunHistoryModal(true);
  };

  const cancelFinishRun = () => {
    setFinishRunModalOpen(false);
  };

  const clearFoundSecrets = () => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        foundSecrets: []
      }
    }));
  };

  const openBookmarkModal = () => {
    setBookmarkInput(gameState[activeGame].bookmark > 0 ? gameState[activeGame].bookmark.toString() : '');
    setBookmarkModalOpen(true);
  };

  const saveBookmark = () => {
    const value = parseInt(bookmarkInput, 10);
    if (!isNaN(value) && value >= 0) {
      setGameState(prev => ({
        ...prev,
        [activeGame]: {
          ...prev[activeGame],
          bookmark: value
        }
      }));
    }
    setBookmarkModalOpen(false);
  };

  const cancelBookmark = () => {
    setBookmarkModalOpen(false);
  };

  return (
    <div className="app-container">
      <GameTabs activeGame={activeGame} onGameChange={setActiveGame} />

      <div className="header">
        <h1 className="title">{GAME_TITLES[activeGame]}</h1>
        <ButtonGroup variant="contained" className="button-group">
          <Button className="bookmark-button" onClick={openBookmarkModal} title="Save Your Place">
            🔖
          </Button>
          <DiceRoller value={gameState.shared.diceRoll} onRoll={rollDice} />
        </ButtonGroup>
      </div>

      <div className="content">
        <Character
          characterName={gameState[activeGame].currentCharacterName}
          savedCharacters={Object.keys(gameState[activeGame].characters)}
          currentAttributes={getCurrentCharacter().attributes}
          currentAbilities={getCurrentCharacter().abilities}
          currentWeaknesses={getCurrentCharacter().weaknesses}
          currentItems={getCurrentCharacter().items}
          onCharacterSelect={handleCharacterSelect}
        />        <AttributesSection
          attributes={getCurrentCharacter().attributes}
          onAttributeChange={updateAttribute}
          onRollDice={rollDice}
          diceValue={gameState.shared.diceRoll}
          currentAbilities={getCurrentCharacter().abilities}
          currentWeaknesses={getCurrentCharacter().weaknesses}
          currentItems={getCurrentCharacter().items}
        />

        <AbilitiesSection
          items={getCurrentCharacter().abilities}
          onItemsChange={updateAbilities}
        />

        <WeaknessesSection
          items={getCurrentCharacter().weaknesses}
          onItemsChange={updateWeaknesses}
        />

        <ItemsSection
          items={getCurrentCharacter().items}
          onItemsChange={updateItems}
        />

        <SecretsSection
          items={getCurrentCharacter().secrets}
          onItemsChange={updateSecrets}
          campaign={activeGame}
          onShowSecretsView={() => setShowSecretsView(true)}
        />
        
        {gameState[activeGame].currentCharacterName && (
          <button className="finish-run-button" onClick={handleFinishRun}>
            Finish Run
          </button>
        )}
      </div>

      {showSecretsView && (
        <div className="secrets-view-overlay" onClick={() => setShowSecretsView(false)}>
          <div className="secrets-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSecretsView(false)}>✕</button>
            <div className="secrets-view-header">
              <h2 className="secrets-view-title">Secrets Found</h2>
              <p className="secrets-view-campaign">{GAME_TITLES[activeGame]}</p>
            </div>
            
            {gameState[activeGame].foundSecrets.length === 0 ? (
              <p className="secrets-view-empty">No secrets found yet. Complete runs to discover secrets!</p>
            ) : (
              <div className="secrets-view-list">
                {gameState[activeGame].foundSecrets.map((secret, index) => (
                  <div key={index} className="secret-item">{secret}</div>
                ))}
              </div>
            )}
            
            <div className="secrets-view-actions">
              {gameState[activeGame].foundSecrets.length > 0 && (
                <button className="secrets-clear-button" onClick={clearFoundSecrets}>
                  Clear All Secrets
                </button>
              )}
              <button className="secrets-close-button" onClick={() => setShowSecretsView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {bookmarkModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Save Your Place</h3>
            <input
              type="number"
              className="bookmark-input"
              value={bookmarkInput}
              onChange={(e) => setBookmarkInput(e.target.value)}
              placeholder="Enter page number"
              min="0"
              autoFocus
            />
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={cancelBookmark}>Cancel</button>
              <button className="modal-btn increment-btn" onClick={saveBookmark}>Save</button>
            </div>
          </div>
        </div>
      )}

      {finishRunModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">
              Are you sure you want to finish your run?
              <br />
              <br />
              All saved data for <strong>{gameState[activeGame].currentCharacterName}</strong> in {GAME_TITLES[activeGame]} will be cleared.
            </p>
            <div className="star-selection">
              <p className="star-label">How many stars did you earn?</p>
              <ButtonGroup variant="contained" className="star-button-group">
                {[0, 1, 2, 3, 4].map(stars => (
                  <Button
                    key={stars}
                    className={`star-btn ${selectedStars === stars ? 'selected' : ''}`}
                    onClick={() => setSelectedStars(stars)}
                  >
                    {stars}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={cancelFinishRun}>Cancel</button>
              <button className="modal-btn increment-btn" onClick={confirmFinishRun}>Finish Run</button>
            </div>
          </div>
        </div>
      )}

      {showRunHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowRunHistoryModal(false)}>
          <div className="modal-content run-history-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRunHistoryModal(false)}>✕</button>
            <h2 className="modal-title">Run History - {GAME_TITLES[activeGame]}</h2>
            
            {gameState[activeGame].completedRuns.length === 0 ? (
              <p className="run-history-empty">No completed runs yet.</p>
            ) : (
              <div className="run-history-list">
                {gameState[activeGame].completedRuns.map((run, index) => (
                  <div key={index} className="run-history-item">
                    <div className="run-history-header">
                      <h3 className="run-character-name">{run.characterName}</h3>
                      <div className="run-stars">
                        {'⭐'.repeat(run.stars)}
                        {run.stars === 0 && <span className="no-stars">No stars</span>}
                      </div>
                    </div>
                    <p className="run-timestamp">
                      {new Date(run.timestamp).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    {run.secrets.length > 0 ? (
                      <div className="run-secrets">
                        <p className="run-secrets-label">Secrets discovered:</p>
                        <ul className="run-secrets-list">
                          {run.secrets.map((secret, secretIndex) => (
                            <li key={secretIndex}>{secret}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="run-no-secrets">No secrets discovered</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <button className="modal-btn increment-btn" onClick={() => setShowRunHistoryModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
