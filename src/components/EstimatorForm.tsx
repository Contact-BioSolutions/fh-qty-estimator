// Estimator Form Component - Main form container

import React, { useCallback, useMemo } from 'react';
import { EstimatorFormProps, WeedSize } from '../types';
import { AreaInput } from './AreaInput';
import { WeedSizeSelector } from './WeedSizeSelector';
import { ApplicationRateSlider } from './ApplicationRateSlider';
import { unitConverter } from '../utils/UnitConverter';
import { UNIT_SYSTEM_DEFAULTS, ARIA_LABELS } from '../constants';
import { brandColors, typography, spacing, borderRadius, boxShadow } from '../constants/brandTokens';

export const EstimatorForm: React.FC<EstimatorFormProps> = ({
  onValuesChange,
  unitSystem,
  weedSizeConfig,
  applicationRates,
  initialValues
}) => {
  const [formValues, setFormValues] = React.useState(() => ({
    area: initialValues?.area || 1000,
    areaUnit: initialValues?.areaUnit || UNIT_SYSTEM_DEFAULTS[unitSystem].areaUnit,
    weedSize: initialValues?.weedSize || WeedSize.MEDIUM,
    applicationRate: initialValues?.applicationRate || applicationRates[WeedSize.MEDIUM].default,
    applicationUnit: initialValues?.applicationUnit || UNIT_SYSTEM_DEFAULTS[unitSystem].volumeUnit,
    unitSystem: initialValues?.unitSystem || unitSystem
  }));

  // Memoize system defaults to prevent unnecessary re-renders
  const systemDefaults = useMemo(() => UNIT_SYSTEM_DEFAULTS[unitSystem], [unitSystem]);

  // Update form values when unit system changes
  React.useEffect(() => {
    if (formValues.unitSystem !== unitSystem) {
      const convertedValues = unitConverter.convertToSystem(formValues, unitSystem);
      setFormValues(convertedValues);
      onValuesChange(convertedValues);
    }
  }, [unitSystem, formValues, onValuesChange]);

  // Handle area input change
  const handleAreaChange = useCallback((newArea: number) => {
    const updatedValues = {
      ...formValues,
      area: newArea
    };
    setFormValues(updatedValues);
    onValuesChange(updatedValues);
  }, [formValues, onValuesChange]);

  // Handle weed size change
  const handleWeedSizeChange = useCallback((newWeedSize: WeedSize) => {
    // Auto-adjust application rate based on new weed size
    const newRate = applicationRates[newWeedSize].default;
    const updatedValues = {
      ...formValues,
      weedSize: newWeedSize,
      applicationRate: newRate
    };
    setFormValues(updatedValues);
    onValuesChange(updatedValues);
  }, [formValues, applicationRates, onValuesChange]);

  // Handle application rate change
  const handleApplicationRateChange = useCallback((newRate: number) => {
    const updatedValues = {
      ...formValues,
      applicationRate: newRate
    };
    setFormValues(updatedValues);
    onValuesChange(updatedValues);
  }, [formValues, onValuesChange]);

  // Handle unit system toggle
  const handleUnitSystemToggle = useCallback(() => {
    const newUnitSystem = unitSystem === 'imperial' ? 'metric' : 'imperial';
    const convertedValues = unitConverter.convertToSystem(formValues, newUnitSystem);
    setFormValues(convertedValues);
    onValuesChange(convertedValues);
  }, [unitSystem, formValues, onValuesChange]);

  // Get application rate bounds for current weed size
  const rateBounds = useMemo(() => {
    return applicationRates[formValues.weedSize];
  }, [applicationRates, formValues.weedSize]);

  return (
    <form className="estimator-form" onSubmit={(e) => e.preventDefault()}>
      <div className="estimator-form__header">
        <h2 className="estimator-form__title">FireHawk Quantity Estimator</h2>
        <button
          type="button"
          className="estimator-form__unit-toggle"
          onClick={handleUnitSystemToggle}
          aria-label={ARIA_LABELS.unitSystemToggle}
          title={`Switch to ${unitSystem === 'imperial' ? 'metric' : 'US'} units`}
        >
          <span className={`estimator-form__unit-option ${unitSystem === 'imperial' ? 'estimator-form__unit-option--active' : ''}`}>
            US
          </span>
          <div className="estimator-form__unit-slider">
            <div className={`estimator-form__unit-slider-handle ${unitSystem === 'metric' ? 'estimator-form__unit-slider-handle--metric' : ''}`} />
          </div>
          <span className={`estimator-form__unit-option ${unitSystem === 'metric' ? 'estimator-form__unit-option--active' : ''}`}>
            Metric
          </span>
        </button>
      </div>

      <div className="estimator-form__content">
        {/* Area Input Section */}
        <div className="estimator-form__section">
          <AreaInput
            value={formValues.area}
            onChange={handleAreaChange}
            unitSystem={unitSystem}
            min={100}
            max={100000}
            step={unitSystem === 'imperial' ? 100 : 10}
            label="Coverage Area"
            showSlider={true}
            showManualInput={true}
          />
        </div>

        {/* Weed Size Selection */}
        <div className="estimator-form__section">
          <WeedSizeSelector
            value={formValues.weedSize}
            onChange={handleWeedSizeChange}
            options={weedSizeConfig}
            layout="cards"
          />
        </div>

        {/* Application Rate Slider */}
        <div className="estimator-form__section">
          <ApplicationRateSlider
            value={formValues.applicationRate}
            onChange={handleApplicationRateChange}
            min={rateBounds.min}
            max={rateBounds.max}
            step={0.1}
            unit={formValues.applicationUnit}
            weedSize={formValues.weedSize}
            showMarkers={true}
          />
        </div>

        {/* Summary Info */}
        <div className="estimator-form__summary">
          <div className="estimator-form__summary-card">
            <h4>Current Settings</h4>
            <div className="estimator-form__summary-items">
              <div className="estimator-form__summary-item">
                <span className="estimator-form__summary-label">Area:</span>
                <span className="estimator-form__summary-value">
                  {unitConverter.formatArea(formValues.area, formValues.areaUnit)}
                </span>
              </div>
              <div className="estimator-form__summary-item">
                <span className="estimator-form__summary-label">Weed Size:</span>
                <span className="estimator-form__summary-value">
                  {weedSizeConfig.find(w => w.id === formValues.weedSize)?.label}
                </span>
              </div>
              <div className="estimator-form__summary-item">
                <span className="estimator-form__summary-label">Rate:</span>
                <span className="estimator-form__summary-value">
                  {formValues.applicationRate.toFixed(1)} L/100L
                </span>
              </div>
              <div className="estimator-form__summary-item">
                <span className="estimator-form__summary-label">Units:</span>
                <span className="estimator-form__summary-value">
                  {unitSystem === 'imperial' ? 'US' : 'Metric'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .estimator-form {
          background: ${brandColors.neutral[50]};
          border: 1px solid ${brandColors.neutral[200]};
          border-radius: ${borderRadius.xl};
          overflow: hidden;
          box-shadow: ${boxShadow.lg};
        }

        .estimator-form__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing[6]};
          background: linear-gradient(135deg, ${brandColors.primary[50]} 0%, ${brandColors.primary[100]} 100%);
          border-bottom: 1px solid ${brandColors.primary[200]};
        }

        .estimator-form__title {
          margin: 0;
          font-size: ${typography.fontSize['2xl'][0]};
          font-weight: ${typography.fontWeight.bold};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.primary[800]};
          background: linear-gradient(135deg, ${brandColors.primary[600]} 0%, ${brandColors.primary[700]} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .estimator-form__unit-toggle {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
          padding: ${spacing[2]};
          background: ${brandColors.neutral[50]};
          border: 1px solid ${brandColors.primary[300]};
          border-radius: ${borderRadius.full};
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: ${boxShadow.sm};
        }

        .estimator-form__unit-toggle:hover {
          border-color: ${brandColors.primary[500]};
          box-shadow: ${boxShadow.md};
          background: ${brandColors.neutral[100]};
        }

        .estimator-form__unit-option {
          font-size: ${typography.fontSize.xs[0]};
          font-weight: ${typography.fontWeight.semibold};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.neutral[500]};
          transition: color 0.15s ease;
          text-transform: uppercase;
          letter-spacing: ${typography.letterSpacing.wide};
          padding: ${spacing[1]} ${spacing[2]};
        }

        .estimator-form__unit-option--active {
          color: ${brandColors.primary[600]};
        }

        .estimator-form__unit-slider {
          position: relative;
          width: ${spacing[10]};
          height: ${spacing[5]};
          background: ${brandColors.neutral[300]};
          border-radius: ${borderRadius.full};
          transition: background-color 0.15s ease;
        }

        .estimator-form__unit-slider-handle {
          position: absolute;
          top: ${spacing[0.5]};
          left: ${spacing[0.5]};
          width: ${spacing[4]};
          height: ${spacing[4]};
          background: ${brandColors.primary[500]};
          border-radius: 50%;
          transition: transform 0.15s ease;
          box-shadow: ${boxShadow.md};
        }

        .estimator-form__unit-slider-handle--metric {
          transform: translateX(${spacing[5]});
        }

        .estimator-form__content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .estimator-form__section {
          padding: 1.5rem;
          background: #fafbfc;
          border: 1px solid #f1f3f4;
          border-radius: 0.75rem;
          transition: all 0.15s ease;
        }

        .estimator-form__section:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .estimator-form__summary {
          margin-top: 1rem;
        }

        .estimator-form__summary-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 0.75rem;
        }

        .estimator-form__summary-card h4 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #1e40af;
        }

        .estimator-form__summary-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .estimator-form__summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(191, 219, 254, 0.5);
        }

        .estimator-form__summary-item:last-child {
          border-bottom: none;
        }

        .estimator-form__summary-label {
          font-size: 0.875rem;
          color: #1e40af;
          font-weight: 500;
        }

        .estimator-form__summary-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        @media (max-width: 768px) {
          .estimator-form__header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .estimator-form__title {
            font-size: 1.25rem;
          }
          
          .estimator-form__content {
            padding: 1.5rem;
            gap: 1.5rem;
          }
          
          .estimator-form__section {
            padding: 1rem;
          }
          
          .estimator-form__summary-items {
            grid-template-columns: 1fr;
          }
          
          .estimator-form__summary-item {
            padding: 0.75rem 0;
          }
        }

        @media (max-width: 480px) {
          .estimator-form__header {
            padding: 1rem;
          }
          
          .estimator-form__content {
            padding: 1rem;
            gap: 1rem;
          }
          
          .estimator-form__section {
            padding: 0.75rem;
          }
          
          .estimator-form__summary-card {
            padding: 1rem;
          }
        }
      `}</style>
    </form>
  );
};

export default EstimatorForm;