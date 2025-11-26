import { useState, useEffect } from 'react';
import type { Attributes } from '../types';

interface AttributesSectionProps {
  attributes: Attributes;
  onAttributeChange: (attrName: keyof Attributes, value: number) => void;
  onRollDice: () => void;
  diceValue: number;
}

export default function AttributesSection({ attributes, onAttributeChange, onRollDice, diceValue }: AttributesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
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
          <button className="attribute-btn" onClick={() => openModal('willpower')}>
            <span className={showValues.willpower ? 'fade-out' : 'fade-in'}>{attributeLabels.willpower}</span>
            <span className={showValues.willpower ? 'fade-in' : 'fade-out'}>{attributes.willpower}</span>
          </button>
          <button className="attribute-btn" onClick={() => openModal('intellect')}>
            <span className={showValues.intellect ? 'fade-out' : 'fade-in'}>{attributeLabels.intellect}</span>
            <span className={showValues.intellect ? 'fade-in' : 'fade-out'}>{attributes.intellect}</span>
          </button>
          <button className="attribute-btn" onClick={() => openModal('combat')}>
            <span className={showValues.combat ? 'fade-out' : 'fade-in'}>{attributeLabels.combat}</span>
            <span className={showValues.combat ? 'fade-in' : 'fade-out'}>{attributes.combat}</span>
          </button>
        </div>

        <div className="attribute-row">
          <button className="attribute-btn" onClick={() => openModal('health')}>
            <span className={showValues.health ? 'fade-out' : 'fade-in'}>{attributeLabels.health}</span>
            <span className={showValues.health ? 'fade-in' : 'fade-out'}>{attributes.health}</span>
          </button>
          <button className="attribute-btn" onClick={() => openModal('sanity')}>
            <span className={showValues.sanity ? 'fade-out' : 'fade-in'}>{attributeLabels.sanity}</span>
            <span className={showValues.sanity ? 'fade-in' : 'fade-out'}>{attributes.sanity}</span>
          </button>
        </div>

        <div className="attribute-row">
          <button className="attribute-btn" onClick={() => openModal('resources')}>
            <span className={showValues.resources ? 'fade-out' : 'fade-in'}>{attributeLabels.resources}</span>
            <span className={showValues.resources ? 'fade-in' : 'fade-out'}>{attributes.resources}</span>
          </button>
          <button className="attribute-btn" onClick={() => openModal('clues')}>
            <span className={showValues.clues ? 'fade-out' : 'fade-in'}>{attributeLabels.clues}</span>
            <span className={showValues.clues ? 'fade-in' : 'fade-out'}>{attributes.clues}</span>
          </button>
          <button className="attribute-btn" onClick={() => openModal('doom')}>
            <span className={showValues.doom ? 'fade-out' : 'fade-in'}>{attributeLabels.doom}</span>
            <span className={showValues.doom ? 'fade-in' : 'fade-out'}>{attributes.doom}</span>
          </button>
        </div>
      </div>

      {modalOpen && selectedAttribute && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <h2 className="modal-title">{attributeLabels[selectedAttribute]}</h2>
            
            <div className="modal-value">{attributes[selectedAttribute]}</div>
            
            <div className="modal-controls">
              <button className="modal-btn decrement-btn" onClick={decrement}>−</button>
              <button className="modal-btn increment-btn" onClick={increment}>+</button>
            </div>

            <div className="modal-dice">
              <button className="dice-button" onClick={onRollDice}>
                {diceValue}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
