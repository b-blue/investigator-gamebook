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
  secrets: string[]; // Array of secret names for this character's run
}

export interface CompletedRun {
  characterName: string;
  timestamp: number; // Unix timestamp
  secrets: string[]; // Secrets found in this run
  stars: number; // 0-4 stars
}

export interface GameState {
  currentCharacterName: string;
  characters: Record<string, CharacterState>; // Map of character name to their state
  foundSecrets: string[]; // All secrets found across all runs in this campaign
  bookmark: number; // Saved page number for this campaign
  completedRuns: CompletedRun[]; // History of completed runs
}

export interface SharedState {
  diceRoll: number;
}

export interface AppState {
  TDOA: GameState;
  TTOI: GameState;
  shared: SharedState;
}
