import { useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import type { Attributes } from '../types';
import charactersData from '../data/characters.json';

interface CharacterData {
  name: string;
  description: string;
  attributes: Attributes;
  abilities: string[];
  weaknesses: string[];
  items: string[];
}

interface CharacterProps {
  characterName: string;
  savedCharacters: string[]; // Array of character names that have been played in this game
  currentAttributes: Attributes;
  currentAbilities: string[];
  currentWeaknesses: string[];
  currentItems: string[];
  onCharacterSelect: (character: CharacterData, mode: 'restart' | 'load') => void;
}

export default function Character({ 
  characterName, 
  savedCharacters,
  currentAttributes: _currentAttributes,
  currentAbilities: _currentAbilities,
  currentWeaknesses: _currentWeaknesses,
  currentItems: _currentItems,
  onCharacterSelect 
}: CharacterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loadRestartModalOpen, setLoadRestartModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);

  const characters: CharacterData[] = charactersData as CharacterData[];

  const handleCharacterClick = (character: CharacterData) => {
    if (characterName === '') {
      // No character selected, load new character directly
      onCharacterSelect(character, 'restart');
      setDropdownOpen(false);
    } else if (savedCharacters.includes(character.name)) {
      // This character has been played before in this game - ask load or restart
      setSelectedCharacter(character);
      setLoadRestartModalOpen(true);
      setDropdownOpen(false);
    } else if (characterName !== character.name) {
      // Switching to a different character that hasn't been played - show confirmation
      setSelectedCharacter(character);
      setConfirmModalOpen(true);
      setDropdownOpen(false);
    } else {
      // Same character, no action needed
      setDropdownOpen(false);
    }
  };

  const handleConfirmChange = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter, 'restart');
      setSelectedCharacter(null);
      setConfirmModalOpen(false);
    }
  };

  const handleLoadCharacter = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter, 'load');
      setSelectedCharacter(null);
      setLoadRestartModalOpen(false);
    }
  };

  const handleRestartCharacter = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter, 'restart');
      setSelectedCharacter(null);
      setLoadRestartModalOpen(false);
    }
  };

  const handleCancelChange = () => {
    setSelectedCharacter(null);
    setConfirmModalOpen(false);
  };

  const displayText = useMemo(() => {
    if (characterName === '') {
      return 'Select Character';
    }
    const character = characters.find(c => c.name === characterName);
    return character ? `${character.name} - ${character.description}` : characterName;
  }, [characterName, characters]);

  return (
    <>
      <div className="character-section">
        <Autocomplete
          options={characters}
          getOptionLabel={(option) => `${option.name} - ${option.description}`}
          value={null}
          open={dropdownOpen}
          onOpen={() => setDropdownOpen(true)}
          onClose={() => setDropdownOpen(false)}
          onChange={(_, newValue) => {
            if (newValue) {
              handleCharacterClick(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              placeholder={displayText}
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'rgba(255, 255, 255, 0.87)',
                  backgroundColor: '#1a1a1a',
                  '& fieldset': {
                    borderColor: '#333',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#444',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#646cff',
                  },
                },
                '& .MuiInputBase-input': {
                  cursor: 'pointer',
                  caretColor: 'transparent',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.87)',
                  opacity: 1,
                },
              }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#1a1a1a',
                color: 'rgba(255, 255, 255, 0.87)',
                border: '2px solid #333',
                borderRadius: '8px',
                '& .MuiAutocomplete-listbox': {
                  '& .MuiAutocomplete-option': {
                    color: 'rgba(255, 255, 255, 0.87)',
                    '&:hover': {
                      backgroundColor: '#242424',
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: '#242424',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#242424',
                    },
                  },
                },
              },
            },
          }}
        />
      </div>

      {confirmModalOpen && selectedCharacter && (
        <div className="modal-overlay" onClick={handleCancelChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCancelChange}>✕</button>
            
            <h2 className="modal-title">Switch Character?</h2>
            
            <p className="modal-message">
              Switching to <strong>{selectedCharacter.name}</strong> will replace all current attributes, abilities, weaknesses, and items. This cannot be undone.
            </p>
            
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={handleCancelChange}>
                Cancel
              </button>
              <button className="modal-btn increment-btn" onClick={handleConfirmChange}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {loadRestartModalOpen && selectedCharacter && (
        <div className="modal-overlay" onClick={() => setLoadRestartModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLoadRestartModalOpen(false)}>✕</button>
            
            <h2 className="modal-title">Load or Restart Character?</h2>
            
            <p className="modal-message">
              You've played <strong>{selectedCharacter.name}</strong> before in this game. Would you like to load your saved progress or restart with fresh stats?
            </p>
            
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={handleRestartCharacter}>
                Restart Fresh
              </button>
              <button className="modal-btn increment-btn" onClick={handleLoadCharacter}>
                Load Saved
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
