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
  const [gameState, setGameState] = useState<AppState>(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultState: AppState = {
      TDOA: { currentCharacterName: '', characters: {} },
      TTOI: { currentCharacterName: '', characters: {} },
      shared: { diceRoll: 1, secrets: [] }
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Check if it's the new format
        if (parsed.TDOA?.characters !== undefined) {
          return {
            TDOA: {
              currentCharacterName: parsed.TDOA?.currentCharacterName || '',
              characters: parsed.TDOA?.characters || {}
            },
            TTOI: {
              currentCharacterName: parsed.TTOI?.currentCharacterName || '',
              characters: parsed.TTOI?.characters || {}
            },
            shared: {
              diceRoll: parsed.shared?.diceRoll || 1,
              secrets: parsed.shared?.secrets || []
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
              items: oldGame?.items || []
            };
          }
          return {
            currentCharacterName: charName,
            characters
          };
        };
        
        return {
          TDOA: migrateGame(parsed.TDOA),
          TTOI: migrateGame(parsed.TTOI),
          shared: {
            diceRoll: parsed.shared?.diceRoll || parsed.TDOA?.diceRoll || 1,
            secrets: parsed.shared?.secrets || parsed.TDOA?.secrets || []
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
      : { attributes: DEFAULT_ATTRIBUTES, abilities: [], weaknesses: [], items: [] };
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
          items: character.items
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
    setGameState(prev => ({
      ...prev,
      shared: {
        ...prev.shared,
        secrets
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
          items={gameState.shared.secrets}
          onItemsChange={updateSecrets}
        />
      </div>
    </div>
  )
}

export default App
