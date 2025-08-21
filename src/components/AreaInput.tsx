// Area Input Component with Slider and Manual Entry

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AreaInputProps } from '../types';
import { unitConverter } from '../utils/UnitConverter';
import { UNIT_SYSTEM_DEFAULTS, VALIDATION_RULES, ARIA_LABELS } from '../constants';

export const AreaInput: React.FC<AreaInputProps> = ({
  value,
  onChange,
  unitSystem,
  min = VALIDATION_RULES.area.min,
  max = VALIDATION_RULES.area.max,
  step = VALIDATION_RULES.area.step,
  label = 'Coverage Area',
  showSlider = true,
  showManualInput = true
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const systemDefaults = UNIT_SYSTEM_DEFAULTS[unitSystem];
  const areaUnit = systemDefaults.areaUnit;
  const formattedValue = unitConverter.formatArea(value, areaUnit);

  // Update input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  // Handle slider change
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  }, [onChange]);

  // Handle manual input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setInputValue(rawValue);

    // Only update if it's a valid number
    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue) && numericValue >= min && numericValue <= max) {
      onChange(numericValue);
    }
  }, [onChange, min, max]);

  // Handle input blur - validate and clean up value
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const numericValue = parseFloat(inputValue);
    
    if (isNaN(numericValue)) {
      // Reset to current valid value
      setInputValue(value.toString());
    } else {
      // Clamp to valid range
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      setInputValue(clampedValue.toString());
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  }, [inputValue, value, onChange, min, max]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInputBlur();
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setInputValue(value.toString());
      inputRef.current?.blur();
    }
  }, [handleInputBlur, value]);

  // Calculate appropriate slider range based on unit
  const getSliderRange = () => {
    // Adjust range based on area unit for better UX
    switch (areaUnit) {
      case 'acres':
        return { min: 0.1, max: 100, step: 0.1 };
      case 'hectares':
        return { min: 0.1, max: 50, step: 0.1 };
      case 'sq_m':
        return { min: 100, max: 50000, step: 100 };
      default: // sq_ft
        return { min: min, max: max, step: step };
    }
  };

  const sliderRange = getSliderRange();

  return (
    <div className="area-input">
      <label htmlFor="area-input" className="area-input__label">
        {label}
      </label>
      
      <div className="area-input__container">
        {showSlider && (
          <div className="area-input__slider-container">
            <input
              ref={sliderRef}
              type="range"
              id="area-slider"
              className="area-input__slider"
              min={sliderRange.min}
              max={sliderRange.max}
              step={sliderRange.step}
              value={Math.max(sliderRange.min, Math.min(sliderRange.max, value))}
              onChange={handleSliderChange}
              aria-label={ARIA_LABELS.areaSlider}
              aria-describedby="area-display"
            />
            
            <div className="area-input__slider-labels">
              <span className="area-input__slider-label--min">
                {unitConverter.formatArea(sliderRange.min, areaUnit)}
              </span>
              <span className="area-input__slider-label--max">
                {unitConverter.formatArea(sliderRange.max, areaUnit)}
              </span>
            </div>
          </div>
        )}

        <div className="area-input__value-container">
          {showManualInput ? (
            <div className="area-input__manual-input">
              <input
                ref={inputRef}
                type="number"
                id="area-input"
                className="area-input__input"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                min={min}
                max={max}
                step={step}
                aria-label={ARIA_LABELS.areaInput}
                aria-describedby="area-unit area-error"
              />
              <span id="area-unit" className="area-input__unit">
                {areaUnit.replace('_', ' ')}
              </span>
            </div>
          ) : (
            <div id="area-display" className="area-input__display">
              {formattedValue}
            </div>
          )}
        </div>
      </div>

      {/* Validation feedback */}
      <div id="area-error" className="area-input__validation" role="status" aria-live="polite">
        {value < min && (
          <span className="area-input__error">
            Minimum area: {unitConverter.formatArea(min, areaUnit)}
          </span>
        )}
        {value > max && (
          <span className="area-input__error">
            Maximum area: {unitConverter.formatArea(max, areaUnit)}
          </span>
        )}
      </div>

      <style jsx>{`
        .area-input {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .area-input__label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .area-input__container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .area-input__slider-container {
          position: relative;
        }

        .area-input__slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }

        .area-input__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.15s ease;
        }

        .area-input__slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .area-input__slider::-webkit-slider-thumb:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .area-input__slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .area-input__slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .area-input__value-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .area-input__manual-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: #ffffff;
          transition: border-color 0.15s ease;
        }

        .area-input__manual-input:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .area-input__input {
          border: none;
          outline: none;
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          background: transparent;
          width: 6rem;
          text-align: right;
        }

        .area-input__input::-webkit-outer-spin-button,
        .area-input__input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .area-input__input[type="number"] {
          -moz-appearance: textfield;
        }

        .area-input__unit {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }

        .area-input__display {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .area-input__validation {
          min-height: 1.25rem;
        }

        .area-input__error {
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .area-input__container {
            gap: 0.75rem;
          }
          
          .area-input__manual-input {
            padding: 0.625rem 0.875rem;
          }
          
          .area-input__input {
            width: 5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AreaInput;