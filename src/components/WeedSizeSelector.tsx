// Weed Size Selector Component

import React, { useCallback, useRef, useState } from 'react';
import { WeedSizeSelectorProps, WeedSize } from '../types';
import { ARIA_LABELS } from '../constants';

export const WeedSizeSelector: React.FC<WeedSizeSelectorProps> = ({
  value,
  onChange,
  options,
  layout = 'cards'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.id === value);

  // Handle selection change
  const handleSelectionChange = useCallback((weedSize: WeedSize) => {
    onChange(weedSize);
    if (layout === 'dropdown') {
      setIsDropdownOpen(false);
      buttonRef.current?.focus();
    }
  }, [onChange, layout]);

  // Handle dropdown toggle
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (layout !== 'dropdown') return;

    switch (event.key) {
      case 'Escape':
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
        } else {
          // Focus next option
          const currentIndex = options.findIndex(opt => opt.id === value);
          const nextIndex = (currentIndex + 1) % options.length;
          handleSelectionChange(options[nextIndex].id);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isDropdownOpen) {
          // Focus previous option
          const currentIndex = options.findIndex(opt => opt.id === value);
          const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
          handleSelectionChange(options[prevIndex].id);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
        }
        break;
    }
  }, [layout, isDropdownOpen, options, value, handleSelectionChange]);

  // Handle radio button change
  const handleRadioChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectionChange(event.target.value as WeedSize);
  }, [handleSelectionChange]);

  // Handle card click
  const handleCardClick = useCallback((weedSize: WeedSize) => {
    handleSelectionChange(weedSize);
  }, [handleSelectionChange]);

  // Handle card keyboard interaction
  const handleCardKeyDown = useCallback((event: React.KeyboardEvent, weedSize: WeedSize) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectionChange(weedSize);
    }
  }, [handleSelectionChange]);

  // Render dropdown layout
  if (layout === 'dropdown') {
    return (
      <div className="weed-size-selector weed-size-selector--dropdown">
        <label htmlFor="weed-size-dropdown" className="weed-size-selector__label">
          Weed Size
        </label>
        
        <div className="weed-size-selector__dropdown-container" ref={dropdownRef}>
          <button
            ref={buttonRef}
            type="button"
            id="weed-size-dropdown"
            className="weed-size-selector__dropdown-button"
            onClick={toggleDropdown}
            onKeyDown={handleDropdownKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label={ARIA_LABELS.weedSizeSelector}
          >
            <span className="weed-size-selector__selected-value">
              {selectedOption?.label || 'Select weed size'}
            </span>
            <svg
              className={`weed-size-selector__dropdown-icon ${isDropdownOpen ? 'weed-size-selector__dropdown-icon--open' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="weed-size-selector__dropdown-menu" role="listbox">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`weed-size-selector__dropdown-option ${value === option.id ? 'weed-size-selector__dropdown-option--selected' : ''}`}
                  onClick={() => handleSelectionChange(option.id)}
                  role="option"
                  aria-selected={value === option.id}
                >
                  <div className="weed-size-selector__option-content">
                    <span className="weed-size-selector__option-label">{option.label}</span>
                    <span className="weed-size-selector__option-description">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render radio button layout
  if (layout === 'radio') {
    return (
      <fieldset className="weed-size-selector weed-size-selector--radio">
        <legend className="weed-size-selector__label">Weed Size</legend>
        
        <div className="weed-size-selector__radio-group">
          {options.map((option) => (
            <label
              key={option.id}
              className="weed-size-selector__radio-option"
            >
              <input
                type="radio"
                name="weed-size"
                value={option.id}
                checked={value === option.id}
                onChange={handleRadioChange}
                className="weed-size-selector__radio-input"
                aria-describedby={`weed-size-${option.id}-description`}
              />
              <div className="weed-size-selector__radio-content">
                <span className="weed-size-selector__option-label">{option.label}</span>
                <span
                  id={`weed-size-${option.id}-description`}
                  className="weed-size-selector__option-description"
                >
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  // Render card layout (default)
  return (
    <div className="weed-size-selector weed-size-selector--cards">
      <h3 className="weed-size-selector__label">Weed Size</h3>
      
      <div className="weed-size-selector__cards-grid">
        {options.map((option) => (
          <div
            key={option.id}
            className={`weed-size-selector__card ${value === option.id ? 'weed-size-selector__card--selected' : ''}`}
            onClick={() => handleCardClick(option.id)}
            onKeyDown={(e) => handleCardKeyDown(e, option.id)}
            tabIndex={0}
            role="button"
            aria-pressed={value === option.id}
            aria-label={`${option.label}: ${option.description}`}
          >
            <div className="weed-size-selector__card-content">
              <span className="weed-size-selector__option-label">{option.label}</span>
              <span className="weed-size-selector__option-description">{option.description}</span>
              <div className="weed-size-selector__multiplier">
                Rate: {option.minRate}-{option.maxRate} fl oz
              </div>
            </div>
            
            {value === option.id && (
              <div className="weed-size-selector__selected-indicator">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeedSizeSelector;