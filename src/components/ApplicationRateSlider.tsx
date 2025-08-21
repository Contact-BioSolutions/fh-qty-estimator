// Application Rate Slider Component

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ApplicationRateSliderProps } from '../types';
import { unitConverter } from '../utils/UnitConverter';
import { ARIA_LABELS } from '../constants';

export const ApplicationRateSlider: React.FC<ApplicationRateSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  unit,
  weedSize,
  showMarkers = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toFixed(1));
    }
  }, [value, isFocused]);

  // Handle slider change
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  }, [onChange]);

  // Handle slider mouse/touch events
  const handleSliderMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle manual input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setInputValue(rawValue);

    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue) && numericValue >= min && numericValue <= max) {
      onChange(numericValue);
    }
  }, [onChange, min, max]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const numericValue = parseFloat(inputValue);
    
    if (isNaN(numericValue)) {
      setInputValue(value.toFixed(1));
    } else {
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      setInputValue(clampedValue.toFixed(1));
      if (Math.abs(clampedValue - value) > 0.001) {
        onChange(clampedValue);
      }
    }
  }, [inputValue, value, onChange, min, max]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInputBlur();
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setInputValue(value.toFixed(1));
      inputRef.current?.blur();
    }
  }, [handleInputBlur, value]);

  // Calculate slider fill percentage
  const fillPercentage = ((value - min) / (max - min)) * 100;

  // Generate marker positions
  const getMarkers = () => {
    const markerCount = 5;
    const markers = [];
    
    for (let i = 0; i <= markerCount; i++) {
      const markerValue = min + (max - min) * (i / markerCount);
      const position = (i / markerCount) * 100;
      
      markers.push({
        value: markerValue,
        position,
        isActive: Math.abs(markerValue - value) < step
      });
    }
    
    return markers;
  };

  const markers = showMarkers ? getMarkers() : [];

  // Format unit display
  const unitDisplay = unit.replace('_', ' ');
  const formattedValue = unitConverter.formatVolume(value, unit);

  return (
    <div className="application-rate-slider">
      <div className="application-rate-slider__header">
        <label htmlFor="application-rate-slider" className="application-rate-slider__label">
          Application Rate
        </label>
        <div className="application-rate-slider__weed-size">
          for {weedSize} weeds
        </div>
      </div>

      <div className="application-rate-slider__container">
        <div className="application-rate-slider__track-container">
          <div 
            className="application-rate-slider__track"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${fillPercentage}%, #e5e7eb ${fillPercentage}%, #e5e7eb 100%)`
            }}
          >
            <input
              ref={sliderRef}
              type="range"
              id="application-rate-slider"
              className="application-rate-slider__slider"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onTouchStart={handleSliderMouseDown}
              onTouchEnd={handleSliderMouseUp}
              aria-label={ARIA_LABELS.applicationRateSlider}
              aria-describedby="rate-value rate-range"
            />
          </div>

          {showMarkers && (
            <div className="application-rate-slider__markers">
              {markers.map((marker, index) => (
                <div
                  key={index}
                  className={`application-rate-slider__marker ${marker.isActive ? 'application-rate-slider__marker--active' : ''}`}
                  style={{ left: `${marker.position}%` }}
                >
                  <div className="application-rate-slider__marker-dot" />
                  <div className="application-rate-slider__marker-label">
                    {marker.value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="application-rate-slider__value-container">
          <div className="application-rate-slider__manual-input">
            <input
              ref={inputRef}
              type="number"
              className="application-rate-slider__input"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              min={min}
              max={max}
              step={step}
              aria-label="Manual application rate input"
            />
            <span className="application-rate-slider__unit">{unitDisplay}</span>
          </div>
        </div>

        <div className="application-rate-slider__info">
          <div id="rate-value" className="application-rate-slider__current-value">
            Current: {formattedValue}
          </div>
          <div id="rate-range" className="application-rate-slider__range">
            Range: {min}-{max} {unitDisplay}
          </div>
        </div>
      </div>

      <style jsx>{`
        .application-rate-slider {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .application-rate-slider__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .application-rate-slider__label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }

        .application-rate-slider__weed-size {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          text-transform: capitalize;
        }

        .application-rate-slider__container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .application-rate-slider__track-container {
          position: relative;
          padding: 1rem 0;
        }

        .application-rate-slider__track {
          position: relative;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .application-rate-slider__slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: transparent;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }

        .application-rate-slider__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.15s ease;
          position: relative;
          z-index: 10;
        }

        .application-rate-slider__slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .application-rate-slider__slider::-webkit-slider-thumb:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .application-rate-slider__slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .application-rate-slider__markers {
          position: absolute;
          top: 2rem;
          left: 0;
          right: 0;
          height: 2rem;
          pointer-events: none;
        }

        .application-rate-slider__marker {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateX(-50%);
        }

        .application-rate-slider__marker-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d1d5db;
          transition: background-color 0.15s ease;
        }

        .application-rate-slider__marker--active .application-rate-slider__marker-dot {
          background: #2563eb;
          transform: scale(1.5);
        }

        .application-rate-slider__marker-label {
          font-size: 0.625rem;
          color: #9ca3af;
          margin-top: 0.25rem;
          white-space: nowrap;
        }

        .application-rate-slider__marker--active .application-rate-slider__marker-label {
          color: #2563eb;
          font-weight: 500;
        }

        .application-rate-slider__value-container {
          display: flex;
          justify-content: center;
        }

        .application-rate-slider__manual-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          background: #ffffff;
          transition: border-color 0.15s ease;
          min-width: 8rem;
        }

        .application-rate-slider__manual-input:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .application-rate-slider__input {
          border: none;
          outline: none;
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          background: transparent;
          width: 3rem;
          text-align: right;
        }

        .application-rate-slider__input::-webkit-outer-spin-button,
        .application-rate-slider__input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .application-rate-slider__input[type="number"] {
          -moz-appearance: textfield;
        }

        .application-rate-slider__unit {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }

        .application-rate-slider__info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .application-rate-slider__current-value {
          font-weight: 500;
          color: #374151;
        }

        .application-rate-slider__range {
          text-align: right;
        }

        @media (max-width: 768px) {
          .application-rate-slider__header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .application-rate-slider__info {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }
          
          .application-rate-slider__range {
            text-align: center;
          }
          
          .application-rate-slider__markers {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationRateSlider;