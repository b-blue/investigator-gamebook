import { useState, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import type { Item } from '../types';
import itemsData from '../data/items.json';

interface ItemsSectionProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
}

export default function ItemsSection({ items, onItemsChange }: ItemsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const availableItems: Item[] = itemsData as Item[];

  // Filter out already selected items from suggestions
  const suggestionItems = useMemo(() => {
    return availableItems.filter(item => !items.includes(item.name));
  }, [items, availableItems]);

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
    <div className="items-section">
      <div 
        className="items-header"
        onClick={() => setExpanded(!expanded)}
      >
        {!expanded && items.length === 0 && (
          <span className="items-title">Items</span>
        )}
        {!expanded && items.length > 0 && (
          <div className="collapsed-item first-item">
            {items[0]}
          </div>
        )}
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      {!expanded && items.length > 1 && (
        <div className="items-collapsed-list">
          {items.slice(1).map((item, index) => (
            <div key={index + 1} className="collapsed-item">
              {item}
            </div>
          ))}
        </div>
      )}

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
            noOptionsText="No matching items"
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search for items..."
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
              {items.map((itemName, index) => {
                const itemData = availableItems.find(item => item.name === itemName);
                return (
                  <div key={index} className="item-card">
                    <div className="item-info">
                      <span className="item-name">{itemName}</span>
                      {itemData?.description && (
                        <span className="item-description">{itemData.description}</span>
                      )}
                    </div>
                    <button 
                      className="item-remove-btn"
                      onClick={() => handleRemoveItem(itemName)}
                      aria-label={`Remove ${itemName}`}
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
