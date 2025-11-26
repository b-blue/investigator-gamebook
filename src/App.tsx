import { useState, useEffect } from 'react'
import './App.css'
import type { GameType, AppState } from './types'
import GameTabs from './components/GameTabs'
import DiceRoller from './components/DiceRoller'
import CharacterName from './components/CharacterName'
import AttributesSection from './components/AttributesSection'
import ItemsSection from './components/ItemsSection'
import AbilitiesSection from './components/AbilitiesSection'
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
    const defaultState = {
      TDOA: { characterName: '', diceRoll: 1, attributes: DEFAULT_ATTRIBUTES, abilities: [], items: [], secrets: [] },
      TTOI: { characterName: '', diceRoll: 1, attributes: DEFAULT_ATTRIBUTES, abilities: [], items: [], secrets: [] }
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all properties exist for backward compatibility
        return {
          TDOA: {
            characterName: parsed.TDOA?.characterName || '',
            diceRoll: parsed.TDOA?.diceRoll || 1,
            attributes: parsed.TDOA?.attributes || DEFAULT_ATTRIBUTES,
            abilities: parsed.TDOA?.abilities || [],
            items: parsed.TDOA?.items || [],
            secrets: parsed.TDOA?.secrets || []
          },
          TTOI: {
            characterName: parsed.TTOI?.characterName || '',
            diceRoll: parsed.TTOI?.diceRoll || 1,
            attributes: parsed.TTOI?.attributes || DEFAULT_ATTRIBUTES,
            abilities: parsed.TTOI?.abilities || [],
            items: parsed.TTOI?.items || [],
            secrets: parsed.TTOI?.secrets || []
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
      [activeGame]: {
        ...prev[activeGame],
        diceRoll: newRoll
      }
    }));
  };

  const updateCharacterName = (name: string) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        characterName: name
      }
    }));
  };

  const updateAttribute = (attrName: keyof typeof DEFAULT_ATTRIBUTES, value: number) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        attributes: {
          ...prev[activeGame].attributes,
          [attrName]: value
        }
      }
    }));
  };

  const updateItems = (items: string[]) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        items
      }
    }));
  };

  const updateAbilities = (abilities: string[]) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        abilities
      }
    }));
  };

  const updateSecrets = (secrets: string[]) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        secrets
      }
    }));
  };

  return (
    <div className="app-container">
      <GameTabs activeGame={activeGame} onGameChange={setActiveGame} />

      <div className="header">
        <h1 className="title">{GAME_TITLES[activeGame]}</h1>
        <DiceRoller value={gameState[activeGame].diceRoll} onRoll={rollDice} />
      </div>

      <div className="content">
        <CharacterName 
          value={gameState[activeGame].characterName}
          onChange={updateCharacterName}
        />

        <AttributesSection
          attributes={gameState[activeGame].attributes}
          onAttributeChange={updateAttribute}
        />

        <AbilitiesSection
          items={gameState[activeGame].abilities}
          onItemsChange={updateAbilities}
        />

        <ItemsSection
          items={gameState[activeGame].items}
          onItemsChange={updateItems}
        />

        <SecretsSection
          items={gameState[activeGame].secrets}
          onItemsChange={updateSecrets}
        />
      </div>
    </div>
  )
}

export default App
