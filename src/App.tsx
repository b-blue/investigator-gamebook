import { useState, useEffect } from 'react'
import './App.css'
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
  const [gameState, setGameState] = useState<AppState>(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultState: AppState = {
      TDOA: { currentCharacterName: '', characters: {}, foundSecrets: [] },
      TTOI: { currentCharacterName: '', characters: {}, foundSecrets: [] },
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
              foundSecrets: parsed.TDOA?.foundSecrets || []
            },
            TTOI: {
              currentCharacterName: parsed.TTOI?.currentCharacterName || '',
              characters: parsed.TTOI?.characters || {},
              foundSecrets: parsed.TTOI?.foundSecrets || []
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
            foundSecrets: [] // Initialize empty foundSecrets
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
      
      return {
        ...prev,
        [activeGame]: {
          currentCharacterName: '',
          characters: newCharacters,
          foundSecrets: newFoundSecrets
        }
      };
    });
    
    setFinishRunModalOpen(false);
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

  return (
    <div className="app-container">
      <GameTabs activeGame={activeGame} onGameChange={setActiveGame} />

      <div className="header">
        <h1 className="title">{GAME_TITLES[activeGame]}</h1>
        <DiceRoller value={gameState.shared.diceRoll} onRoll={rollDice} />
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
        />
        
        {gameState[activeGame].currentCharacterName && (
          <>
            <button className="finish-run-button" onClick={handleFinishRun}>
              Finish Run
            </button>
            <button className="secrets-view-button" onClick={() => setShowSecretsView(true)}>
              ?
            </button>
          </>
        )}
      </div>

      {showSecretsView && (
        <div className="secrets-view-overlay" onClick={() => setShowSecretsView(false)}>
          <div className="secrets-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSecretsView(false)}>✕</button>
            <h2 className="secrets-view-title">Secrets Found - {GAME_TITLES[activeGame]}</h2>
            
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

      {finishRunModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">
              Are you sure you want to finish your run?
              <br />
              <br />
              All saved data for <strong>{gameState[activeGame].currentCharacterName}</strong> in {GAME_TITLES[activeGame]} will be cleared.
            </p>
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={cancelFinishRun}>Cancel</button>
              <button className="modal-btn increment-btn" onClick={confirmFinishRun}>Finish Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
