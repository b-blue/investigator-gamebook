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
    const defaultState = {
      TDOA: { characterName: '', diceRoll: 1, attributes: DEFAULT_ATTRIBUTES, abilities: [], weaknesses: [], items: [], secrets: [] },
      TTOI: { characterName: '', diceRoll: 1, attributes: DEFAULT_ATTRIBUTES, abilities: [], weaknesses: [], items: [], secrets: [] }
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
            weaknesses: parsed.TDOA?.weaknesses || [],
            items: parsed.TDOA?.items || [],
            secrets: parsed.TDOA?.secrets || []
          },
          TTOI: {
            characterName: parsed.TTOI?.characterName || '',
            diceRoll: parsed.TTOI?.diceRoll || 1,
            attributes: parsed.TTOI?.attributes || DEFAULT_ATTRIBUTES,
            abilities: parsed.TTOI?.abilities || [],
            weaknesses: parsed.TTOI?.weaknesses || [],
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

  const handleCharacterSelect = (character: CharacterType) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        characterName: character.name,
        attributes: character.attributes,
        abilities: character.abilities,
        weaknesses: character.weaknesses,
        items: character.items
        // secrets remain unchanged
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

  const updateWeaknesses = (weaknesses: string[]) => {
    setGameState(prev => ({
      ...prev,
      [activeGame]: {
        ...prev[activeGame],
        weaknesses
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
        <Character 
          characterName={gameState[activeGame].characterName}
          onCharacterSelect={handleCharacterSelect}
        />

        <AttributesSection
          attributes={gameState[activeGame].attributes}
          onAttributeChange={updateAttribute}
          onRollDice={rollDice}
          diceValue={gameState[activeGame].diceRoll}
        />

        <AbilitiesSection
          items={gameState[activeGame].abilities}
          onItemsChange={updateAbilities}
        />

        <WeaknessesSection
          items={gameState[activeGame].weaknesses}
          onItemsChange={updateWeaknesses}
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
