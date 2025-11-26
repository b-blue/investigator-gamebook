import { useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import type { Secret, GameType } from '../types';
import secretsData from '../data/secrets.json';

interface ItemsSectionProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  campaign: GameType;
}

export default function SecretsSection({ items, onItemsChange, campaign }: ItemsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const availableSecrets: Secret[] = secretsData as Secret[];

  // Filter secrets by campaign
  const campaignSecrets = useMemo(() => {
    return availableSecrets.filter(secret => secret.campaign === campaign);
  }, [availableSecrets, campaign]);

  // Filter out already selected items from suggestions
  const suggestionItems = useMemo(() => {
    return campaignSecrets.filter(secret => !items.includes(secret.name));
  }, [items, campaignSecrets]);

  const handleAddItem = (itemName: string | null) => {
    if (itemName && !items.includes(itemName)) {
      onItemsChange([...items, itemName]);
      setSearchValue('');
    }
  };

  const handleRemoveItem = (itemName: string) => {
    onItemsChange(items.filter(item => item !== itemName));
  };

  return (
    <div className="items-section secrets-section">
      <div 
        className={`items-collapsed-wrapper ${!expanded && items.length > 0 ? 'has-items' : ''}`}
      >
        <div 
          className="items-header"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded && (
            <div className="items-title fade-in">Secrets</div>
          )}
          {!expanded && items.length === 0 && (
            <div className="items-title">Secrets</div>
          )}
          {!expanded && items.length > 0 && (
            <div className={`collapsed-item first-item ${items.length > 1 ? 'has-multiple' : ''}`}>
              <div className="item-name">{items[0]}</div>
            </div>
          )}
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▶</span>
        </div>

        {!expanded && items.length > 1 && (
          <div 
            className="items-collapsed-list"
            onClick={() => setExpanded(!expanded)}
          >
            {items.slice(1).map((itemName, index) => (
              <div key={index + 1} className="collapsed-item">
                <div className="item-name">{itemName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <div className="items-content">
          <Autocomplete
            options={suggestionItems.map(item => item.name)}
            value={null}
            inputValue={searchValue}
            onInputChange={(_, newValue) => setSearchValue(newValue)}
            onChange={(_, newValue) => handleAddItem(newValue)}
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
            noOptionsText="No matching secrets"
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search for secrets..."
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

          {items.length > 0 && (
            <div className="items-list">
              {items.map((itemName, index) => (
                <div key={index} className="item-card">
                  <div className="item-info">
                    <span className="item-name">{itemName}</span>
                  </div>
                  <button 
                    className="item-remove-btn"
                    onClick={() => handleRemoveItem(itemName)}
                    aria-label={`Remove ${itemName}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
