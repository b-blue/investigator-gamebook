export type GameType = 'TDOA' | 'TTOI';

export interface Attributes {
  willpower: number;
  intellect: number;
  combat: number;
  health: number;
  sanity: number;
  resources: number;
  clues: number;
  doom: number;
}

export interface Item {
  name: string;
  description: string;
  isEquipped: boolean;
}

export interface Ability {
  name: string;
  description: string;
  isWeakness: boolean;
}

export interface Secret {
  name: string;
  campaign: 'TDOA' | 'TTOI';
}

export interface Character {
  name: string;
  description: string;
  attributes: Attributes;
  abilities: string[];
  weaknesses: string[];
  items: string[];
}

export interface CharacterState {
  attributes: Attributes;
  abilities: string[]; // Array of ability names
  weaknesses: string[]; // Array of weakness names
  items: string[]; // Array of item names
}

export interface GameState {
  currentCharacterName: string;
  characters: Record<string, CharacterState>; // Map of character name to their state
}

export interface SharedState {
  diceRoll: number;
  secrets: string[]; // Array of secret names - shared across both games
}

export interface AppState {
  TDOA: GameState;
  TTOI: GameState;
  shared: SharedState;
}
