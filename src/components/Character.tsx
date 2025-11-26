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
  onCharacterSelect: (character: CharacterData) => void;
}

export default function Character({ characterName, onCharacterSelect }: CharacterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);

  const characters: CharacterData[] = charactersData as CharacterData[];

  const handleCharacterClick = (character: CharacterData) => {
    if (characterName === '') {
      // No confirmation needed if current character is empty
      onCharacterSelect(character);
      setDropdownOpen(false);
    } else {
      // Show confirmation modal
      setSelectedCharacter(character);
      setConfirmModalOpen(true);
      setDropdownOpen(false);
    }
  };

  const handleConfirmChange = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter);
      setSelectedCharacter(null);
      setConfirmModalOpen(false);
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
    </>
  );
}
