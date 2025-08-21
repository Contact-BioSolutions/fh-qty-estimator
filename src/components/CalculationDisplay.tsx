// Calculation Display Component

import React, { useState } from 'react';
import { CalculationDisplayProps } from '../types';
import { unitConverter } from '../utils/UnitConverter';
import { brandColors, typography, spacing, borderRadius, boxShadow } from '../constants/brandTokens';

export const CalculationDisplay: React.FC<CalculationDisplayProps> = ({
  calculation,
  unitSystem,
  showBreakdown = true,
  showCostAnalysis = true
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'breakdown' | 'recommendations'>('results');
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  if (!calculation) {
    return (
      <div className="calculation-display calculation-display--empty">
        <div className="calculation-display__placeholder">
          <div className="calculation-display__placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
              <polyline points="9,11 12,14 15,11" />
              <path d="M12 2v12" />
            </svg>
          </div>
          <h3>Ready to Calculate</h3>
          <p>Adjust the parameters above to see your FireHawk quantity estimation</p>
        </div>
      </div>
    );
  }

  const formattedProduct = unitConverter.formatVolume(calculation.requiredProduct, calculation.productUnit);
  const formattedMixture = unitConverter.formatVolume(calculation.totalMixture, calculation.mixtureUnit);
  const formattedArea = unitConverter.formatArea(calculation.coverageArea, calculation.coverageUnit);

  return (
    <div className="calculation-display">
      {/* Navigation Tabs */}
      <div className="calculation-display__tabs">
        <button
          className={`calculation-display__tab ${activeTab === 'results' ? 'calculation-display__tab--active' : ''}`}
          onClick={() => setActiveTab('results')}
          aria-selected={activeTab === 'results'}
        >
          Results
        </button>
        
        {showBreakdown && (
          <button
            className={`calculation-display__tab ${activeTab === 'breakdown' ? 'calculation-display__tab--active' : ''}`}
            onClick={() => setActiveTab('breakdown')}
            aria-selected={activeTab === 'breakdown'}
          >
            Breakdown
          </button>
        )}
        
        <button
          className={`calculation-display__tab ${activeTab === 'recommendations' ? 'calculation-display__tab--active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
          aria-selected={activeTab === 'recommendations'}
        >
          Packages
        </button>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="calculation-display__content">
          <div className="calculation-display__results">
            {/* Primary Results */}
            <div className="calculation-display__primary-results">
              <div className="calculation-display__result-card calculation-display__result-card--primary">
                <div className="calculation-display__result-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <div className="calculation-display__result-content">
                  <h3>FireHawk Needed</h3>
                  <div className="calculation-display__result-value">{formattedProduct}</div>
                  <div className="calculation-display__result-description">
                    Concentrate required for {formattedArea}
                  </div>
                </div>
              </div>

              <div className="calculation-display__result-card">
                <div className="calculation-display__result-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 7h14l-1 10H6L5 7z" />
                    <path d="M5 7L3 5h2l2 2" />
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="15" cy="20" r="1" />
                  </svg>
                </div>
                <div className="calculation-display__result-content">
                  <h3>Total Mixture</h3>
                  <div className="calculation-display__result-value">{formattedMixture}</div>
                  <div className="calculation-display__result-description">
                    Ready-to-spray volume
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            {showCostAnalysis && (
              <div className="calculation-display__cost-analysis">
                <div className="calculation-display__result-card calculation-display__result-card--cost">
                  <div className="calculation-display__result-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="calculation-display__result-content">
                    <h3>Estimated Cost</h3>
                    <div className="calculation-display__result-value">
                      {calculation.currency} {calculation.estimatedCost.toFixed(2)}
                    </div>
                    <div className="calculation-display__result-description">
                      Most cost-effective package option
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coverage Summary */}
            <div className="calculation-display__coverage-summary">
              <h4>Coverage Summary</h4>
              <div className="calculation-display__coverage-details">
                <div className="calculation-display__coverage-item">
                  <span className="calculation-display__coverage-label">Area:</span>
                  <span className="calculation-display__coverage-value">{formattedArea}</span>
                </div>
                <div className="calculation-display__coverage-item">
                  <span className="calculation-display__coverage-label">Weed Size:</span>
                  <span className="calculation-display__coverage-value">
                    {calculation.breakdown.factors.weedSizeMultiplier}x multiplier
                  </span>
                </div>
                <div className="calculation-display__coverage-item">
                  <span className="calculation-display__coverage-label">Application Rate:</span>
                  <span className="calculation-display__coverage-value">
                    {calculation.breakdown.factors.applicationRate.toFixed(1)} fl oz/1000 sq ft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Tab */}
      {activeTab === 'breakdown' && showBreakdown && (
        <div className="calculation-display__content">
          <div className="calculation-display__breakdown">
            <h4>Calculation Steps</h4>
            
            <div className="calculation-display__steps">
              {calculation.breakdown.steps.map((step, index) => (
                <div key={step.id} className="calculation-display__step">
                  <div className="calculation-display__step-number">{index + 1}</div>
                  <div className="calculation-display__step-content">
                    <div className="calculation-display__step-description">
                      {step.description}
                    </div>
                    <div className="calculation-display__step-formula">
                      {step.formula}
                    </div>
                    <div className="calculation-display__step-result">
                      {step.input} → <strong>{step.output} {step.unit}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="calculation-display__assumptions">
              <button
                className="calculation-display__assumptions-toggle"
                onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                aria-expanded={isBreakdownExpanded}
              >
                <span>Assumptions & Factors</span>
                <svg
                  className={`calculation-display__toggle-icon ${isBreakdownExpanded ? 'calculation-display__toggle-icon--open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4.5 6a.5.5 0 01.8-.4L8 7.866l2.7-2.266a.5.5 0 11.6.8l-3 2.5a.5.5 0 01-.6 0l-3-2.5A.5.5 0 014.5 6z" />
                </svg>
              </button>
              
              {isBreakdownExpanded && (
                <div className="calculation-display__assumptions-content">
                  <ul className="calculation-display__assumptions-list">
                    {calculation.breakdown.assumptions.map((assumption, index) => (
                      <li key={index} className="calculation-display__assumption">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="calculation-display__content">
          <div className="calculation-display__recommendations">
            <h4>Package Recommendations</h4>
            
            <div className="calculation-display__packages">
              {calculation.recommendations.map((rec, index) => (
                <div
                  key={rec.packageId}
                  className={`calculation-display__package ${rec.isOptimal ? 'calculation-display__package--optimal' : ''}`}
                >
                  {rec.isOptimal && (
                    <div className="calculation-display__optimal-badge">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.5.5 0 00-.688-.727L7.5 9.025 6.344 7.865a.5.5 0 10-.688.726l1.5 1.5a.5.5 0 00.688 0l4-4z" />
                      </svg>
                      Best Value
                    </div>
                  )}
                  
                  <div className="calculation-display__package-content">
                    <div className="calculation-display__package-quantity">
                      {rec.quantity} package{rec.quantity > 1 ? 's' : ''}
                    </div>
                    <div className="calculation-display__package-cost">
                      {calculation.currency} {rec.totalCost.toFixed(2)}
                    </div>
                    <div className="calculation-display__package-efficiency">
                      {calculation.currency} {rec.efficiency.toFixed(3)}/fl oz
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calculation-display {
          background: ${brandColors.neutral[50]};
          border: 1px solid ${brandColors.neutral[200]};
          border-radius: ${borderRadius.xl};
          overflow: hidden;
          box-shadow: ${boxShadow.lg};
        }

        .calculation-display--empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }

        .calculation-display__placeholder {
          text-align: center;
          color: #6b7280;
        }

        .calculation-display__placeholder-icon {
          margin: 0 auto 1rem;
          width: 48px;
          height: 48px;
          color: #d1d5db;
        }

        .calculation-display__placeholder h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        .calculation-display__placeholder p {
          margin: 0;
          font-size: 0.875rem;
        }

        .calculation-display__tabs {
          display: flex;
          border-bottom: 1px solid ${brandColors.neutral[200]};
          background: ${brandColors.neutral[100]};
        }

        .calculation-display__tab {
          flex: 1;
          padding: ${spacing[3]} ${spacing[4]};
          border: none;
          background: none;
          font-size: ${typography.fontSize.sm[0]};
          font-weight: ${typography.fontWeight.medium};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.neutral[600]};
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 2px solid transparent;
        }

        .calculation-display__tab:hover {
          color: ${brandColors.neutral[800]};
          background: ${brandColors.neutral[200]};
        }

        .calculation-display__tab--active {
          color: ${brandColors.primary[600]};
          border-bottom-color: ${brandColors.primary[500]};
          background: ${brandColors.neutral[50]};
        }

        .calculation-display__content {
          padding: 1.5rem;
        }

        .calculation-display__primary-results {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .calculation-display__result-card {
          display: flex;
          align-items: flex-start;
          gap: ${spacing[4]};
          padding: ${spacing[5]};
          background: ${brandColors.neutral[100]};
          border: 1px solid ${brandColors.neutral[300]};
          border-radius: ${borderRadius.lg};
          transition: all 0.15s ease;
          box-shadow: ${boxShadow.sm};
        }

        .calculation-display__result-card--primary {
          background: linear-gradient(135deg, ${brandColors.primary[50]} 0%, ${brandColors.primary[100]} 100%);
          border-color: ${brandColors.primary[300]};
        }

        .calculation-display__result-card--cost {
          background: linear-gradient(135deg, ${brandColors.accent[50]} 0%, ${brandColors.accent[100]} 100%);
          border-color: ${brandColors.accent[300]};
        }

        .calculation-display__result-icon {
          flex-shrink: 0;
          color: ${brandColors.primary[600]};
        }

        .calculation-display__result-card--cost .calculation-display__result-icon {
          color: ${brandColors.accent[600]};
        }

        .calculation-display__result-content h3 {
          margin: 0 0 ${spacing[2]};
          font-size: ${typography.fontSize.sm[0]};
          font-weight: ${typography.fontWeight.semibold};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.neutral[700]};
          text-transform: uppercase;
          letter-spacing: ${typography.letterSpacing.wide};
        }

        .calculation-display__result-value {
          font-size: ${typography.fontSize['2xl'][0]};
          font-weight: ${typography.fontWeight.bold};
          font-family: ${typography.fontFamily.sans.join(', ')};
          color: ${brandColors.neutral[900]};
          margin-bottom: ${spacing[1]};
        }

        .calculation-display__result-description {
          font-size: ${typography.fontSize.xs[0]};
          color: ${brandColors.neutral[600]};
          font-family: ${typography.fontFamily.sans.join(', ')};
        }

        .calculation-display__cost-analysis {
          margin-bottom: 1.5rem;
        }

        .calculation-display__coverage-summary h4 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .calculation-display__coverage-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .calculation-display__coverage-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .calculation-display__coverage-item:last-child {
          border-bottom: none;
        }

        .calculation-display__coverage-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .calculation-display__coverage-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }

        .calculation-display__breakdown h4 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .calculation-display__steps {
          margin-bottom: 1.5rem;
        }

        .calculation-display__step {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .calculation-display__step:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .calculation-display__step-number {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
          color: #ffffff;
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .calculation-display__step-content {
          flex: 1;
        }

        .calculation-display__step-description {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .calculation-display__step-formula {
          font-size: 0.75rem;
          color: #6b7280;
          font-family: 'Monaco', 'Menlo', monospace;
          background: #f9fafb;
          padding: 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .calculation-display__step-result {
          font-size: 0.875rem;
          color: #111827;
        }

        .calculation-display__assumptions-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          transition: all 0.15s ease;
        }

        .calculation-display__assumptions-toggle:hover {
          background: #f3f4f6;
        }

        .calculation-display__toggle-icon {
          transition: transform 0.15s ease;
        }

        .calculation-display__toggle-icon--open {
          transform: rotate(180deg);
        }

        .calculation-display__assumptions-content {
          margin-top: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
        }

        .calculation-display__assumptions-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .calculation-display__assumption {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .calculation-display__assumption:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #2563eb;
        }

        .calculation-display__assumption:last-child {
          margin-bottom: 0;
        }

        .calculation-display__recommendations h4 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .calculation-display__packages {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .calculation-display__package {
          position: relative;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: #ffffff;
          transition: all 0.15s ease;
        }

        .calculation-display__package--optimal {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
        }

        .calculation-display__optimal-badge {
          position: absolute;
          top: -0.5rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #10b981;
          color: #ffffff;
          border-radius: 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .calculation-display__package-content {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 1rem;
          align-items: center;
        }

        .calculation-display__package-quantity {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .calculation-display__package-cost {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .calculation-display__package-efficiency {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .calculation-display__primary-results {
            grid-template-columns: 1fr;
          }
          
          .calculation-display__result-card {
            padding: 1rem;
          }
          
          .calculation-display__package-content {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }
          
          .calculation-display__content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalculationDisplay;