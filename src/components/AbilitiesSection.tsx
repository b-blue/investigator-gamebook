import { useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import type { Ability } from '../types';
import abilitiesData from '../data/abilities.json';

interface AbilitiesSectionProps {
  abilities: string[];
  onAbilitiesChange: (abilities: string[]) => void;
}

export default function AbilitiesSection({ abilities, onAbilitiesChange }: AbilitiesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const availableAbilities: Ability[] = abilitiesData as Ability[];

  // Filter out already selected abilities from suggestions
  const suggestionAbilities = useMemo(() => {
    return availableAbilities.filter(ability => !abilities.includes(ability.name));
  }, [abilities, availableAbilities]);

  const handleAddAbility = (abilityName: string | null) => {
    if (abilityName && !abilities.includes(abilityName)) {
      onAbilitiesChange([...abilities, abilityName]);
      setSearchValue('');
    }
  };

  const handleRemoveAbility = (abilityName: string) => {
    onAbilitiesChange(abilities.filter(ability => ability !== abilityName));
  };

  return (
    <div className="abilities-section">
      <div 
        className={`abilities-collapsed-wrapper ${!expanded && abilities.length > 0 ? 'has-abilities' : ''}`}
      >
        <div 
          className="abilities-header"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded && (
            <div className="abilities-title fade-in">Abilities</div>
          )}
          {!expanded && abilities.length === 0 && (
            <div className="abilities-title">Abilities</div>
          )}
          {!expanded && abilities.length > 0 && (
            <div className={`collapsed-ability first-ability ${abilities.length > 1 ? 'has-multiple' : ''}`}>
              <div className="ability-name">{abilities[0]}</div>
              {availableAbilities.find(ability => ability.name === abilities[0])?.description && (
                <div className="ability-description">
                  {availableAbilities.find(ability => ability.name === abilities[0])?.description}
                </div>
              )}
            </div>
          )}
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▶</span>
        </div>

        {!expanded && abilities.length > 1 && (
          <div 
            className="abilities-collapsed-list"
            onClick={() => setExpanded(!expanded)}
          >
            {abilities.slice(1).map((abilityName, index) => {
              const abilityData = availableAbilities.find(ability => ability.name === abilityName);
              return (
                <div key={index + 1} className="collapsed-ability">
                  <div className="ability-name">{abilityName}</div>
                  {abilityData?.description && (
                    <div className="ability-description">{abilityData.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {expanded && (
        <div className="abilities-content">
          <Autocomplete
            options={suggestionAbilities.map(ability => ability.name)}
            value={null}
            inputValue={searchValue}
            onInputChange={(_, newValue) => setSearchValue(newValue)}
            onChange={(_, newValue) => handleAddAbility(newValue)}
            filterOptions={(options, state) => {
              // Only show suggestions if user has typed 3 or more characters
              if (state.inputValue.length < 3) {
                return [];
              }
              return options.filter(option =>
                option.toLowerCase().startsWith(state.inputValue.toLowerCase())
              );
            }}
            open={searchValue.length >= 3}
            noOptionsText="No matching abilities"
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search for abilities..."
                variant="outlined"
                size="small"
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
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
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
                  '& .MuiAutocomplete-noOptions': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                },
              },
            }}
            sx={{
              marginBottom: '1rem',
            }}
          />

          {abilities.length > 0 && (
            <div className="abilities-list">
              {abilities.map((abilityName, index) => {
                const abilityData = availableAbilities.find(ability => ability.name === abilityName);
                return (
                  <div key={index} className="ability-card">
                    <div className="ability-info">
                      <span className="ability-name">{abilityName}</span>
                      {abilityData?.description && (
                        <span className="ability-description">{abilityData.description}</span>
                      )}
                    </div>
                    <button 
                      className="ability-remove-btn"
                      onClick={() => handleRemoveAbility(abilityName)}
                      aria-label={`Remove ${abilityName}`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
