import React from 'react';
import { FireHawkEstimator } from '../src';
import type { ProductInfo, CartItem } from '../src/types';

// Example product configuration for FireHawk herbicide
const productInfo: ProductInfo = {
  name: "FireHawk Herbicide",
  packages: [
    { id: "fh-5l", name: "5L Container", size: 5, unit: "L", price: 89.99, sku: "FH-5L-001" },
    { id: "fh-20l", name: "20L Drum", size: 20, unit: "L", price: 299.99, sku: "FH-20L-001" },
    { id: "fh-100l", name: "100L Bulk", size: 100, unit: "L", price: 1299.99, sku: "FH-100L-001" }
  ],
  applicationRateRange: {
    min: 1.0,
    max: 5.0,
    default: 2.5,
    unit: "L/ha"
  },
  description: "Premium selective herbicide for effective weed control"
};

// Basic usage example
export function BasicExample() {
  const handleAddToCart = (cartItem: CartItem) => {
    console.log('Adding to cart:', cartItem);
    // Integration with your e-commerce platform
    // e.g., Shopify.addToCart(cartItem);
  };

  const handleCalculationChange = (calculation: any) => {
    console.log('Calculation updated:', calculation);
    // Track calculation changes for analytics
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>FireHawk Quantity Estimator - Basic Usage</h1>
      
      <FireHawkEstimator
        productInfo={productInfo}
        initialUnitSystem="metric"
        onAddToCart={handleAddToCart}
        onCalculationChange={handleCalculationChange}
        theme={{
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          borderRadius: '8px',
          spacing: 'comfortable'
        }}
      />
    </div>
  );
}

export default BasicExample;