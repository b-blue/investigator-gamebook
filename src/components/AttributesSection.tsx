import { useState } from 'react';
import type { Attributes } from '../types';

interface AttributesSectionProps {
  attributes: Attributes;
  onAttributeChange: (attrName: keyof Attributes, value: number) => void;
}

export default function AttributesSection({ attributes, onAttributeChange }: AttributesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="attributes-section">
      <div 
        className="attributes-header"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded && (
          <div className="attributes-title fade-in">Attributes</div>
        )}
        {!expanded && (
          <div className="attributes-summary">
            <span>W:{attributes.willpower}</span>
            <span>I:{attributes.intellect}</span>
            <span>C:{attributes.combat}</span>
            <span>H:{attributes.health}</span>
            <span>S:{attributes.sanity}</span>
            <span>R:{attributes.resources}</span>
            <span>Cl:{attributes.clues}</span>
            <span>D:{attributes.doom}</span>
          </div>
        )}
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▶</span>
      </div>

      {expanded && (
        <div className="attributes-content">
          <div className="attribute-group">
            <div className="attribute-item">
              <label>Willpower</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.willpower}
                onChange={(e) => onAttributeChange('willpower', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="attribute-item">
              <label>Intellect</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.intellect}
                onChange={(e) => onAttributeChange('intellect', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="attribute-item">
              <label>Combat</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.combat}
                onChange={(e) => onAttributeChange('combat', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="attribute-group">
            <div className="attribute-item">
              <label>Health</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.health}
                onChange={(e) => onAttributeChange('health', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="attribute-item">
              <label>Sanity</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.sanity}
                onChange={(e) => onAttributeChange('sanity', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="attribute-item">
              <label>Resources</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.resources}
                onChange={(e) => onAttributeChange('resources', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="attribute-group">
            <div className="attribute-item">
              <label>Clues</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.clues}
                onChange={(e) => onAttributeChange('clues', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="attribute-item">
              <label>Doom</label>
              <input
                type="number"
                className="attribute-input"
                value={attributes.doom}
                onChange={(e) => onAttributeChange('doom', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
