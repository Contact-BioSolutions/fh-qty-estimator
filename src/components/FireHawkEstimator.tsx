// Main FireHawk Estimator Component - Root container

import React, { useState, useCallback, useMemo } from 'react';
import { FireHawkEstimatorProps, UnitSystem, EstimatorValues } from '../types';
import { EstimatorForm } from './EstimatorForm';
import { CalculationDisplay } from './CalculationDisplay';
import { AddToCartSection } from './AddToCartSection';
import { useFireHawkCalculator, useRealtimeCalculation, useEstimatorValues } from '../hooks/useFireHawkCalculator';
import { 
  DEFAULT_ESTIMATOR_VALUES, 
  WEED_SIZE_CONFIG, 
  DEFAULT_APPLICATION_RATES
} from '../constants';
import { brandColors, typography, spacing, borderRadius, boxShadow } from '../constants/brandTokens';

export const FireHawkEstimator: React.FC<FireHawkEstimatorProps> = ({
  productInfo,
  initialUnitSystem = UnitSystem.IMPERIAL,
  onAddToCart,
  onCalculationChange,
  className = ''
}) => {
  // State management
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialUnitSystem);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Initialize calculator and form values
  const { calculator, isCalculating, error: calculatorError } = useFireHawkCalculator(productInfo);
  
  const [estimatorValues, updateEstimatorValues, resetValues, validationErrors] = useEstimatorValues(
    {
      ...DEFAULT_ESTIMATOR_VALUES,
      unitSystem
    },
    productInfo
  );

  // Real-time calculation
  const { calculation, error: calculationError } = useRealtimeCalculation(
    estimatorValues,
    calculator
  );

  // Combine all errors
  const allErrors = useMemo(() => {
    const errors = [
      ...validationErrors,
      calculatorError,
      calculationError,
      error
    ].filter(Boolean);
    return errors.length > 0 ? errors : null;
  }, [validationErrors, calculatorError, calculationError, error]);

  // Handle unit system change
  const handleUnitSystemChange = useCallback((newUnitSystem: UnitSystem) => {
    setUnitSystem(newUnitSystem);
    updateEstimatorValues({ unitSystem: newUnitSystem });
  }, [updateEstimatorValues]);

  // Handle form values change
  const handleValuesChange = useCallback((newValues: Partial<EstimatorValues>) => {
    updateEstimatorValues(newValues);
    setError(null); // Clear errors when user makes changes
  }, [updateEstimatorValues]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (cartItem: any) => {
    if (!onAddToCart) return;

    setIsAddingToCart(true);
    setError(null);

    try {
      await onAddToCart(cartItem);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  }, [onAddToCart]);

  // Notify parent of calculation changes
  React.useEffect(() => {
    if (calculation && onCalculationChange) {
      onCalculationChange(calculation);
    }
  }, [calculation, onCalculationChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetValues();
    setError(null);
  }, [resetValues]);

  // Determine layout based on screen size (you might want to use a responsive hook here)
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`firehawk-estimator ${className}`.trim()}>
      {/* Error Display */}
      {allErrors && (
        <div className="firehawk-estimator__error-banner" role="alert">
          <div className="firehawk-estimator__error-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="firehawk-estimator__error-content">
            <h4>Calculation Error</h4>
            <ul className="firehawk-estimator__error-list">
              {allErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
          <button 
            className="firehawk-estimator__error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.5 4.5a.5.5 0 01.8-.4L8 6.866l2.7-2.266a.5.5 0 11.6.8L8.634 8l2.666 2.6a.5.5 0 11-.6.8L8 9.134 5.3 11.4a.5.5 0 11-.6-.8L7.366 8 4.7 5.4a.5.5 0 01.8-.9z" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="firehawk-estimator__content">
        {/* Form Section */}
        <div className="firehawk-estimator__form-section">
          <EstimatorForm
            onValuesChange={handleValuesChange}
            unitSystem={unitSystem}
            weedSizeConfig={WEED_SIZE_CONFIG}
            applicationRates={DEFAULT_APPLICATION_RATES}
            initialValues={estimatorValues}
          />
          
          {/* Reset Button */}
          <div className="firehawk-estimator__actions">
            <button
              type="button"
              className="firehawk-estimator__reset-button"
              onClick={handleReset}
              aria-label="Reset all values to defaults"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4.5v.793l.854-.853a.5.5 0 11.707.707l-1.5 1.5a.5.5 0 01-.707 0l-1.5-1.5a.5.5 0 11.707-.707L8 5.293V4a.5.5 0 01.5-.5z" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="firehawk-estimator__results-section">
          {/* Calculation Display */}
          <div className="firehawk-estimator__calculation">
            {isCalculating && (
              <div className="firehawk-estimator__loading-overlay">
                <div className="firehawk-estimator__spinner">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                <span>Calculating...</span>
              </div>
            )}
            
            <CalculationDisplay
              calculation={calculation}
              unitSystem={unitSystem}
              showBreakdown={true}
              showCostAnalysis={true}
            />
          </div>

          {/* Add to Cart Section */}
          {calculation && onAddToCart && (
            <div className="firehawk-estimator__cart">
              <AddToCartSection
                calculation={calculation}
                productInfo={productInfo}
                onAddToCart={handleAddToCart}
                isLoading={isAddingToCart}
                disabled={!!allErrors}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Information Footer */}
      <div className="firehawk-estimator__footer">
        <div className="firehawk-estimator__product-info">
          <h4>{productInfo.name}</h4>
          <p>Professional herbicide concentrate • {productInfo.concentrationRatio}% active ingredient</p>
        </div>
        
        <div className="firehawk-estimator__disclaimer">
          <p>
            <strong>Important:</strong> Always read and follow label directions. 
            Application rates may vary based on specific weed species, environmental conditions, and local regulations.
          </p>
        </div>
      </div>

      <style jsx>{`
        .firehawk-estimator {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing[4]};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.neutral[900]};
          background: ${brandColors.neutral[50]};
        }

        .firehawk-estimator__error-banner {
          display: flex;
          align-items: flex-start;
          gap: ${spacing[3]};
          padding: ${spacing[4]};
          margin-bottom: ${spacing[6]};
          background: ${brandColors.semantic.error[50]};
          border: 1px solid ${brandColors.semantic.error[500]};
          border-radius: ${borderRadius.lg};
          color: ${brandColors.semantic.error[600]};
          box-shadow: ${boxShadow.sm};
        }

        .firehawk-estimator__error-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .firehawk-estimator__error-content h4 {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .firehawk-estimator__error-list {
          margin: 0;
          padding-left: 1rem;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .firehawk-estimator__error-dismiss {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: background-color 0.15s ease;
        }

        .firehawk-estimator__error-dismiss:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        .firehawk-estimator__content {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr 1fr;
          align-items: flex-start;
        }

        .firehawk-estimator__form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .firehawk-estimator__actions {
          display: flex;
          justify-content: flex-end;
        }

        .firehawk-estimator__reset-button {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
          padding: ${spacing[2]} ${spacing[4]};
          background: ${brandColors.neutral[100]};
          border: 1px solid ${brandColors.neutral[300]};
          border-radius: ${borderRadius.md};
          color: ${brandColors.neutral[700]};
          font-size: ${typography.fontSize.sm[0]};
          font-weight: ${typography.fontWeight.medium};
          font-family: ${typography.fontFamily.sans.join(', ')};
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: ${boxShadow.sm};
        }

        .firehawk-estimator__reset-button:hover {
          background: ${brandColors.neutral[200]};
          border-color: ${brandColors.neutral[400]};
          box-shadow: ${boxShadow.md};
        }

        .firehawk-estimator__results-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .firehawk-estimator__calculation {
          position: relative;
        }

        .firehawk-estimator__loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          z-index: 10;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .firehawk-estimator__spinner {
          color: #2563eb;
        }

        .firehawk-estimator__footer {
          margin-top: ${spacing[8]};
          padding: ${spacing[6]};
          background: ${brandColors.primary[50]};
          border: 1px solid ${brandColors.primary[200]};
          border-radius: ${borderRadius.xl};
          box-shadow: ${boxShadow.sm};
        }

        .firehawk-estimator__product-info {
          margin-bottom: ${spacing[4]};
        }

        .firehawk-estimator__product-info h4 {
          margin: 0 0 ${spacing[1]};
          font-size: ${typography.fontSize.lg[0]};
          font-weight: ${typography.fontWeight.semibold};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.primary[800]};
        }

        .firehawk-estimator__product-info p {
          margin: 0;
          font-size: ${typography.fontSize.sm[0]};
          color: ${brandColors.primary[600]};
        }

        .firehawk-estimator__disclaimer {
          padding: ${spacing[4]};
          background: ${brandColors.secondary[50]};
          border: 1px solid ${brandColors.secondary[200]};
          border-radius: ${borderRadius.lg};
        }

        .firehawk-estimator__disclaimer p {
          margin: 0;
          font-size: ${typography.fontSize.xs[0]};
          color: ${brandColors.secondary[700]};
          line-height: 1.4;
          font-family: ${typography.fontFamily.sans.join(', ')};
        }

        @media (max-width: 1024px) {
          .firehawk-estimator__content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .firehawk-estimator {
            padding: 0.5rem;
          }
          
          .firehawk-estimator__content {
            gap: 1rem;
          }
          
          .firehawk-estimator__footer {
            padding: 1rem;
            margin-top: 1rem;
          }
          
          .firehawk-estimator__error-banner {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .firehawk-estimator {
            padding: 0.25rem;
          }
          
          .firehawk-estimator__actions {
            justify-content: center;
          }
          
          .firehawk-estimator__reset-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default FireHawkEstimator;