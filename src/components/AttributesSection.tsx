import { useState, useEffect, useMemo } from 'react';
import type { Attributes } from '../types';
import abilitiesData from '../data/abilities.json';
import itemsData from '../data/items.json';

interface AbilityData {
  name: string;
  description: string;
  isWeakness: boolean;
}

interface ItemData {
  name: string;
  description: string;
  isEquipped: boolean;
}

interface AttributesSectionProps {
  attributes: Attributes;
  onAttributeChange: (attrName: keyof Attributes, value: number) => void;
  onRollDice: () => void;
  diceValue: number;
  currentAbilities: string[];
  currentWeaknesses: string[];
  currentItems: string[];
}

export default function AttributesSection({ 
  attributes, 
  onAttributeChange, 
  onRollDice, 
  diceValue,
  currentAbilities,
  currentWeaknesses,
  currentItems
}: AttributesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(1);
  const [rolledDiceValue, setRolledDiceValue] = useState(1);
  const [penalty, setPenalty] = useState<{ type: 'health' | 'sanity' | null, value: number }>({ type: null, value: 0 });
  const [selectedAttribute, setSelectedAttribute] = useState<keyof Attributes | null>(null);
  const [showValues, setShowValues] = useState<Record<keyof Attributes, boolean>>({
    willpower: false,
    intellect: false,
    combat: false,
    health: false,
    sanity: false,
    resources: false,
    clues: false,
    doom: false
  });

  const allAbilities: AbilityData[] = abilitiesData as AbilityData[];
  const allItems: ItemData[] = itemsData as ItemData[];

  // Filter abilities, weaknesses, and items that mention the selected attribute
  const relatedItems = useMemo(() => {
    if (!selectedAttribute) return { abilities: [], weaknesses: [], items: [] };
    
    const attributeName = selectedAttribute.toLowerCase();
    
    // Get ability/weakness data for current character's abilities and weaknesses
    const abilities = allAbilities
      .filter(ability => 
        !ability.isWeakness && 
        currentAbilities.includes(ability.name) &&
        ability.description.toLowerCase().includes(attributeName)
      );
    
    const weaknesses = allAbilities
      .filter(ability => 
        ability.isWeakness && 
        currentWeaknesses.includes(ability.name) &&
        ability.description.toLowerCase().includes(attributeName)
      );
    
    // Get item data for current character's items
    const items = allItems
      .filter(item => 
        currentItems.includes(item.name) &&
        item.description.toLowerCase().includes(attributeName)
      );
    
    return { abilities, weaknesses, items };
  }, [selectedAttribute, currentAbilities, currentWeaknesses, currentItems, allAbilities, allItems]);

  // Cycle through showing name (5s) and value (3s) for each attribute
  useEffect(() => {
    const attributeKeys: (keyof Attributes)[] = [
      'willpower', 'intellect', 'combat', 'health', 
      'sanity', 'resources', 'clues', 'doom'
    ];

    const timers: number[] = [];

    attributeKeys.forEach((attr, index) => {
      // Stagger the start time for each attribute slightly for visual variety
      const offset = index * 500;
      
      const cycleFn = () => {
        setShowValues(prev => ({ ...prev, [attr]: false })); // Show name
        
        const valueTimer = window.setTimeout(() => {
          setShowValues(prev => ({ ...prev, [attr]: true })); // Show value
        }, 5000); // Show name for 5 seconds
        
        timers.push(valueTimer);
      };

      // Initial cycle
      const initialTimer = window.setTimeout(cycleFn, offset);
      timers.push(initialTimer);

      // Repeat cycle every 8 seconds (5s name + 3s value)
      const intervalTimer = window.setInterval(cycleFn, 8000);
      timers.push(intervalTimer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const openModal = (attrName: keyof Attributes) => {
    setSelectedAttribute(attrName);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAttribute(null);
  };

  const handleAttributeRoll = () => {
    if (!selectedAttribute) return;
    
    // Roll the die
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    setRolledDiceValue(diceRoll);
    onRollDice(); // Update global dice display
    
    // Calculate base result
    let result = attributes[selectedAttribute] + diceRoll;
    let penaltyInfo: { type: 'health' | 'sanity' | null, value: number } = { type: null, value: 0 };
    
    // Apply combat penalty if health is below zero
    if (selectedAttribute === 'combat' && attributes.health < 0) {
      result += attributes.health; // Add negative health (subtracts from result)
      penaltyInfo = { type: 'health', value: attributes.health };
    }
    
    // Apply willpower penalty if sanity is below zero
    if (selectedAttribute === 'willpower' && attributes.sanity < 0) {
      result += attributes.sanity; // Add negative sanity (subtracts from result)
      penaltyInfo = { type: 'sanity', value: attributes.sanity };
    }
    
    setPenalty(penaltyInfo);
    setResultModalOpen(true);
    
    // Animate cycling through random values
    let cycleCount = 0;
    const maxCycles = 10;
    const cycleInterval = setInterval(() => {
      setAnimatedValue(Math.floor(Math.random() * 6) + 1);
      cycleCount++;
      
      if (cycleCount >= maxCycles) {
        clearInterval(cycleInterval);
        setAnimatedValue(result);
      }
    }, 100);
  };

  const increment = () => {
    if (selectedAttribute) {
      onAttributeChange(selectedAttribute, attributes[selectedAttribute] + 1);
    }
  };

  const decrement = () => {
    if (selectedAttribute) {
      onAttributeChange(selectedAttribute, attributes[selectedAttribute] - 1);
    }
  };

  const attributeLabels: Record<keyof Attributes, string> = {
    willpower: 'Willpower',
    intellect: 'Intellect',
    combat: 'Combat',
    health: 'Health',
    sanity: 'Sanity',
    resources: 'Resources',
    clues: 'Clues',
    doom: 'Doom'
  };

  return (
    <>
      <div className="attributes-section">
        <div className="attribute-row">
          <button className="attribute-btn willpower" onClick={() => openModal('willpower')}>
            <span className={showValues.willpower ? 'fade-out' : 'fade-in'}>{attributeLabels.willpower}</span>
            <span className={showValues.willpower ? 'fade-in' : 'fade-out'}>{attributes.willpower}</span>
          </button>
          <button className="attribute-btn intellect" onClick={() => openModal('intellect')}>
            <span className={showValues.intellect ? 'fade-out' : 'fade-in'}>{attributeLabels.intellect}</span>
            <span className={showValues.intellect ? 'fade-in' : 'fade-out'}>{attributes.intellect}</span>
          </button>
          <button className="attribute-btn combat" onClick={() => openModal('combat')}>
            <span className={showValues.combat ? 'fade-out' : 'fade-in'}>{attributeLabels.combat}</span>
            <span className={showValues.combat ? 'fade-in' : 'fade-out'}>{attributes.combat}</span>
          </button>
        </div>

        <div className="attribute-row">
          <button className="attribute-btn health" onClick={() => openModal('health')}>
            <span className={showValues.health ? 'fade-out' : 'fade-in'}>{attributeLabels.health}</span>
            <span className={showValues.health ? 'fade-in' : 'fade-out'}>{attributes.health}</span>
          </button>
          <button className="attribute-btn sanity" onClick={() => openModal('sanity')}>
            <span className={showValues.sanity ? 'fade-out' : 'fade-in'}>{attributeLabels.sanity}</span>
            <span className={showValues.sanity ? 'fade-in' : 'fade-out'}>{attributes.sanity}</span>
          </button>
        </div>

        <div className="attribute-row">
          <button className="attribute-btn resources" onClick={() => openModal('resources')}>
            <span className={showValues.resources ? 'fade-out' : 'fade-in'}>{attributeLabels.resources}</span>
            <span className={showValues.resources ? 'fade-in' : 'fade-out'}>{attributes.resources}</span>
          </button>
          <button className="attribute-btn clues" onClick={() => openModal('clues')}>
            <span className={showValues.clues ? 'fade-out' : 'fade-in'}>{attributeLabels.clues}</span>
            <span className={showValues.clues ? 'fade-in' : 'fade-out'}>{attributes.clues}</span>
          </button>
          <button className="attribute-btn doom" onClick={() => openModal('doom')}>
            <span className={showValues.doom ? 'fade-out' : 'fade-in'}>{attributeLabels.doom}</span>
            <span className={showValues.doom ? 'fade-in' : 'fade-out'}>{attributes.doom}</span>
          </button>
        </div>
      </div>

      {modalOpen && selectedAttribute && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-content ${selectedAttribute}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <h2 className="modal-title">{attributeLabels[selectedAttribute]}</h2>
            
            <div className="modal-value">{attributes[selectedAttribute]}</div>
            
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={decrement}>−</button>
              <button className="modal-btn increment-btn" onClick={increment}>+</button>
            </div>

            <div className="modal-dice">
              <button className="dice-button" onClick={handleAttributeRoll}>
                {diceValue}
              </button>
            </div>

            {(relatedItems.abilities.length > 0 || relatedItems.weaknesses.length > 0 || relatedItems.items.length > 0) && (
              <div className="modal-related-items">
                <h3 className="modal-related-title">Related Cards</h3>
                <div className="items-list">
                  {relatedItems.abilities.map((ability, index) => (
                    <div key={`ability-${index}`} className="item-card abilities-item">
                      <div className="item-info">
                        <span className="item-name">{ability.name}</span>
                        <span className="item-description">{ability.description}</span>
                      </div>
                    </div>
                  ))}
                  {relatedItems.weaknesses.map((weakness, index) => (
                    <div key={`weakness-${index}`} className="item-card weaknesses-item">
                      <div className="item-info">
                        <span className="item-name">{weakness.name}</span>
                        <span className="item-description">{weakness.description}</span>
                      </div>
                    </div>
                  ))}
                  {relatedItems.items.map((item, index) => (
                    <div key={`item-${index}`} className="item-card items-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-description">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {resultModalOpen && selectedAttribute && (
        <div className="modal-overlay" onClick={() => setResultModalOpen(false)}>
          <div className="modal-content result-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setResultModalOpen(false)}>✕</button>
            
            <h2 className="modal-title">Roll Result</h2>
            
            <div className="result-breakdown">
              <div className="result-line">
                <span className="result-label">{attributeLabels[selectedAttribute]}:</span>
                <span className="result-number">{attributes[selectedAttribute]}</span>
              </div>
              <div className="result-line">
                <span className="result-label">Die Roll:</span>
                <span className="result-number">{rolledDiceValue}</span>
              </div>
              {penalty.type && (
                <div className="result-line penalty">
                  <span className="result-label">
                    {penalty.type === 'health' ? 'Loss of Health:' : 'Loss of Sanity:'}
                  </span>
                  <span className="result-number">{penalty.value}</span>
                </div>
              )}
            </div>
            
            <div className="result-divider"></div>
            
            <div className="result-final">
              <span className="result-final-label">Total:</span>
              <span className="result-final-value">{animatedValue}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
