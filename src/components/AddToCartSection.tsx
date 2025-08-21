// Add to Cart Section Component

import React, { useState, useCallback, useMemo } from 'react';
import { AddToCartSectionProps, PackageSize, ProductRecommendation, CartItem } from '../types';
import { unitConverter } from '../utils/UnitConverter';

export const AddToCartSection: React.FC<AddToCartSectionProps> = ({
  calculation,
  productInfo,
  onAddToCart,
  isLoading = false,
  disabled = false
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Get optimal recommendation as default
  const optimalRecommendation = useMemo(() => {
    return calculation.recommendations.find(rec => rec.isOptimal) || calculation.recommendations[0];
  }, [calculation.recommendations]);

  // Set default selection to optimal package
  React.useEffect(() => {
    if (optimalRecommendation && !selectedPackageId) {
      setSelectedPackageId(optimalRecommendation.packageId);
      setQuantity(optimalRecommendation.quantity);
    }
  }, [optimalRecommendation, selectedPackageId]);

  // Get selected package details
  const selectedPackage = useMemo(() => {
    return productInfo.packageSizes.find(pkg => pkg.id === selectedPackageId);
  }, [productInfo.packageSizes, selectedPackageId]);

  const selectedRecommendation = useMemo(() => {
    return calculation.recommendations.find(rec => rec.packageId === selectedPackageId);
  }, [calculation.recommendations, selectedPackageId]);

  // Handle package selection change
  const handlePackageChange = useCallback((packageId: string) => {
    setSelectedPackageId(packageId);
    const recommendation = calculation.recommendations.find(rec => rec.packageId === packageId);
    if (recommendation) {
      setQuantity(recommendation.quantity);
    }
  }, [calculation.recommendations]);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  }, []);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (!selectedPackage) return 0;
    return selectedPackage.price * quantity;
  }, [selectedPackage, quantity]);

  // Calculate total product amount
  const totalProductAmount = useMemo(() => {
    if (!selectedPackage) return 0;
    return selectedPackage.volume * quantity;
  }, [selectedPackage, quantity]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (!selectedPackage || !calculation) return;

    const cartItem: CartItem = {
      productId: productInfo.id,
      sku: selectedPackage.id,
      name: `${productInfo.name} - ${unitConverter.formatVolume(selectedPackage.volume, selectedPackage.unit)}`,
      quantity,
      unitPrice: selectedPackage.price,
      totalPrice: totalCost,
      metadata: {
        estimatorValues: {
          area: calculation.coverageArea,
          areaUnit: calculation.coverageUnit,
          weedSize: calculation.breakdown.factors.weedSizeMultiplier > 1 ? 'medium' : 'small',
          applicationRate: calculation.breakdown.factors.applicationRate,
          applicationUnit: calculation.productUnit,
          unitSystem: 'imperial'
        },
        calculationId: `calc_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };

    onAddToCart(cartItem);
  }, [selectedPackage, calculation, productInfo, quantity, totalCost, onAddToCart]);

  if (!calculation || !selectedPackage) {
    return (
      <div className="add-to-cart-section add-to-cart-section--loading">
        <div className="add-to-cart-section__placeholder">
          <div className="add-to-cart-section__placeholder-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <p>Complete calculation to add to cart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-to-cart-section">
      <div className="add-to-cart-section__header">
        <h3>Add to Cart</h3>
        <button
          className="add-to-cart-section__expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Toggle package details"
        >
          <svg
            className={`add-to-cart-section__expand-icon ${isExpanded ? 'add-to-cart-section__expand-icon--open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M4.5 6a.5.5 0 01.8-.4L8 7.866l2.7-2.266a.5.5 0 11.6.8l-3 2.5a.5.5 0 01-.6 0l-3-2.5A.5.5 0 014.5 6z" />
          </svg>
        </button>
      </div>

      {/* Quick Add (Optimal Recommendation) */}
      {!isExpanded && (
        <div className="add-to-cart-section__quick-add">
          <div className="add-to-cart-section__recommendation">
            <div className="add-to-cart-section__recommendation-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.5.5 0 00-.688-.727L7.5 9.025 6.344 7.865a.5.5 0 10-.688.726l1.5 1.5a.5.5 0 00.688 0l4-4z" />
              </svg>
              Recommended
            </div>
            <div className="add-to-cart-section__product-info">
              <div className="add-to-cart-section__product-name">
                {productInfo.name} - {unitConverter.formatVolume(selectedPackage.volume, selectedPackage.unit)}
              </div>
              <div className="add-to-cart-section__product-details">
                {quantity} package{quantity > 1 ? 's' : ''} • Total: {unitConverter.formatVolume(totalProductAmount, selectedPackage.unit)}
              </div>
            </div>
          </div>

          <div className="add-to-cart-section__price-summary">
            <div className="add-to-cart-section__total-cost">
              {calculation.currency} {totalCost.toFixed(2)}
            </div>
            <div className="add-to-cart-section__unit-cost">
              {calculation.currency} {selectedPackage.price.toFixed(2)} each
            </div>
          </div>
        </div>
      )}

      {/* Expanded Package Selection */}
      {isExpanded && (
        <div className="add-to-cart-section__expanded">
          <div className="add-to-cart-section__package-selector">
            <label className="add-to-cart-section__label">Package Size</label>
            <div className="add-to-cart-section__packages">
              {productInfo.packageSizes.map((packageSize) => {
                const recommendation = calculation.recommendations.find(rec => rec.packageId === packageSize.id);
                const isSelected = selectedPackageId === packageSize.id;
                const isOptimal = recommendation?.isOptimal;

                return (
                  <div
                    key={packageSize.id}
                    className={`add-to-cart-section__package ${isSelected ? 'add-to-cart-section__package--selected' : ''} ${isOptimal ? 'add-to-cart-section__package--optimal' : ''}`}
                    onClick={() => handlePackageChange(packageSize.id)}
                  >
                    {isOptimal && (
                      <div className="add-to-cart-section__optimal-badge">Best Value</div>
                    )}
                    
                    <div className="add-to-cart-section__package-size">
                      {unitConverter.formatVolume(packageSize.volume, packageSize.unit)}
                    </div>
                    <div className="add-to-cart-section__package-price">
                      {calculation.currency} {packageSize.price.toFixed(2)}
                    </div>
                    {recommendation && (
                      <div className="add-to-cart-section__package-recommendation">
                        {recommendation.quantity} needed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="add-to-cart-section__quantity-selector">
            <label className="add-to-cart-section__label">Quantity</label>
            <div className="add-to-cart-section__quantity-controls">
              <button
                type="button"
                className="add-to-cart-section__quantity-button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M2 8a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11A.5.5 0 012 8z" />
                </svg>
              </button>
              
              <input
                type="number"
                className="add-to-cart-section__quantity-input"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                aria-label="Package quantity"
              />
              
              <button
                type="button"
                className="add-to-cart-section__quantity-button"
                onClick={() => handleQuantityChange(quantity + 1)}
                aria-label="Increase quantity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="add-to-cart-section__summary">
            <div className="add-to-cart-section__summary-row">
              <span>Total Product:</span>
              <span>{unitConverter.formatVolume(totalProductAmount, selectedPackage.unit)}</span>
            </div>
            <div className="add-to-cart-section__summary-row">
              <span>Required:</span>
              <span>{unitConverter.formatVolume(calculation.requiredProduct, calculation.productUnit)}</span>
            </div>
            <div className="add-to-cart-section__summary-row add-to-cart-section__summary-row--total">
              <span>Total Cost:</span>
              <span>{calculation.currency} {totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        className="add-to-cart-section__add-button"
        onClick={handleAddToCart}
        disabled={disabled || isLoading || !selectedPackage}
        aria-label={`Add ${quantity} ${productInfo.name} package${quantity > 1 ? 's' : ''} to cart`}
      >
        {isLoading ? (
          <div className="add-to-cart-section__loading">
            <svg className="add-to-cart-section__spinner" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite" />
              </circle>
            </svg>
            Adding...
          </div>
        ) : (
          <div className="add-to-cart-section__button-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart • {calculation.currency} {totalCost.toFixed(2)}
          </div>
        )}
      </button>

      <style jsx>{`
        .add-to-cart-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .add-to-cart-section--loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
        }

        .add-to-cart-section__placeholder {
          text-align: center;
          color: #6b7280;
        }

        .add-to-cart-section__placeholder-icon {
          margin: 0 auto 0.5rem;
          color: #d1d5db;
        }

        .add-to-cart-section__placeholder p {
          margin: 0;
          font-size: 0.875rem;
        }

        .add-to-cart-section__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .add-to-cart-section__header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .add-to-cart-section__expand-toggle {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.15s ease;
        }

        .add-to-cart-section__expand-toggle:hover {
          color: #374151;
        }

        .add-to-cart-section__expand-icon {
          transition: transform 0.15s ease;
        }

        .add-to-cart-section__expand-icon--open {
          transform: rotate(180deg);
        }

        .add-to-cart-section__quick-add {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .add-to-cart-section__recommendation {
          flex: 1;
        }

        .add-to-cart-section__recommendation-badge {
          display: inline-flex;
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
          margin-bottom: 0.5rem;
        }

        .add-to-cart-section__product-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .add-to-cart-section__product-details {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .add-to-cart-section__price-summary {
          text-align: right;
        }

        .add-to-cart-section__total-cost {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }

        .add-to-cart-section__unit-cost {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .add-to-cart-section__expanded {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .add-to-cart-section__label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .add-to-cart-section__packages {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .add-to-cart-section__package {
          position: relative;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .add-to-cart-section__package:hover {
          border-color: #2563eb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .add-to-cart-section__package--selected {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 0 0 1px #2563eb;
        }

        .add-to-cart-section__package--optimal {
          border-color: #10b981;
        }

        .add-to-cart-section__package--optimal.add-to-cart-section__package--selected {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 0 0 1px #10b981;
        }

        .add-to-cart-section__optimal-badge {
          position: absolute;
          top: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.125rem 0.375rem;
          background: #10b981;
          color: #ffffff;
          border-radius: 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .add-to-cart-section__package-size {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .add-to-cart-section__package-price {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .add-to-cart-section__package-recommendation {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 500;
        }

        .add-to-cart-section__quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .add-to-cart-section__quantity-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: #ffffff;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .add-to-cart-section__quantity-button:hover:not(:disabled) {
          border-color: #2563eb;
          color: #2563eb;
        }

        .add-to-cart-section__quantity-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-to-cart-section__quantity-input {
          width: 4rem;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          text-align: center;
          font-size: 1rem;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .add-to-cart-section__quantity-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .add-to-cart-section__summary {
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }

        .add-to-cart-section__summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .add-to-cart-section__summary-row:last-child {
          margin-bottom: 0;
        }

        .add-to-cart-section__summary-row--total {
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
          font-weight: 600;
          color: #111827;
          font-size: 1rem;
        }

        .add-to-cart-section__add-button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 0;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-to-cart-section__add-button:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .add-to-cart-section__add-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .add-to-cart-section__button-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-to-cart-section__loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-to-cart-section__spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .add-to-cart-section__quick-add {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .add-to-cart-section__price-summary {
            text-align: left;
            width: 100%;
          }
          
          .add-to-cart-section__packages {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartSection;