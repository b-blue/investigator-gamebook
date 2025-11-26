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

export interface GameState {
  characterName: string;
  diceRoll: number;
  attributes: Attributes;
  abilities: string[]; // Array of ability names
  items: string[]; // Array of item names
  // Additional character sheet data will be added in future prompts
}

export interface AppState {
  TDOA: GameState;
  TTOI: GameState;
}
