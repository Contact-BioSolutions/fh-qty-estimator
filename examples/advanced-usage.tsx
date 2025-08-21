import React, { useState, useCallback } from 'react';
import { FireHawkEstimator } from '../src';
import type { ProductInfo, CartItem, EstimatorValues, UnitSystem } from '../src/types';

// Advanced product configuration with multiple variants
const advancedProductInfo: ProductInfo = {
  name: "FireHawk Pro Herbicide",
  packages: [
    { id: "fhp-1l", name: "1L Trial Size", size: 1, unit: "L", price: 24.99, sku: "FHP-1L-001" },
    { id: "fhp-5l", name: "5L Standard", size: 5, unit: "L", price: 99.99, sku: "FHP-5L-001" },
    { id: "fhp-20l", name: "20L Professional", size: 20, unit: "L", price: 349.99, sku: "FHP-20L-001" },
    { id: "fhp-100l", name: "100L Commercial", size: 100, unit: "L", price: 1499.99, sku: "FHP-100L-001" },
    { id: "fhp-200l", name: "200L Bulk", size: 200, unit: "L", price: 2799.99, sku: "FHP-200L-001" }
  ],
  applicationRateRange: {
    min: 0.5,
    max: 8.0,
    default: 3.0,
    unit: "L/ha"
  },
  description: "Professional-grade herbicide with enhanced performance"
};

// Advanced usage with state management and validation
export function AdvancedExample() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [calculations, setCalculations] = useState<any>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [errors, setErrors] = useState<string[]>([]);

  // Enhanced cart handling with validation
  const handleAddToCart = useCallback((cartItem: CartItem) => {
    try {
      // Validate cart item
      if (cartItem.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Add to cart with duplicate checking
      const existingIndex = cartItems.findIndex(item => item.packageId === cartItem.packageId);
      
      if (existingIndex >= 0) {
        const updatedItems = [...cartItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + cartItem.quantity
        };
        setCartItems(updatedItems);
      } else {
        setCartItems(prev => [...prev, cartItem]);
      }

      // Send to analytics/tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: cartItem.totalPrice,
          items: [{
            item_id: cartItem.sku,
            item_name: cartItem.productName,
            quantity: cartItem.quantity,
            price: cartItem.unitPrice
          }]
        });
      }

      setErrors([]);
    } catch (error) {
      setErrors(prev => [...prev, (error as Error).message]);
    }
  }, [cartItems]);

  // Advanced calculation tracking
  const handleCalculationChange = useCallback((calculation: any) => {
    setCalculations(calculation);
    
    // Custom validation rules
    const newErrors: string[] = [];
    
    if (calculation.area > 1000) {
      newErrors.push('Large area detected - consider professional application');
    }
    
    if (calculation.applicationRate > 5.0) {
      newErrors.push('High application rate - verify with product guidelines');
    }

    if (calculation.totalCost > 10000) {
      newErrors.push('High cost calculation - consider bulk pricing options');
    }

    setErrors(newErrors);
  }, []);

  // Remove item from cart
  const removeFromCart = (packageId: string) => {
    setCartItems(prev => prev.filter(item => item.packageId !== packageId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', padding: '20px' }}>
      {/* Main Calculator */}
      <div>
        <h1>FireHawk Pro Quantity Estimator - Advanced Features</h1>
        
        {/* Unit System Toggle */}
        <div style={{ marginBottom: '20px' }}>
          <label>
            <input
              type="radio"
              name="unitSystem"
              value="metric"
              checked={unitSystem === 'metric'}
              onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            />
            Metric System
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              name="unitSystem"
              value="imperial"
              checked={unitSystem === 'imperial'}
              onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            />
            Imperial System
          </label>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h4>Warnings:</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Calculator Component */}
        <FireHawkEstimator
          productInfo={advancedProductInfo}
          initialUnitSystem={unitSystem}
          onAddToCart={handleAddToCart}
          onCalculationChange={handleCalculationChange}
          theme={{
            primaryColor: '#059669',
            secondaryColor: '#6b7280',
            borderRadius: '12px',
            spacing: 'comfortable'
          }}
          features={{
            showCalculationBreakdown: true,
            enableRealtimeValidation: true,
            showCostComparison: true,
            enablePackageRecommendations: true
          }}
        />

        {/* Calculation Details */}
        {calculations && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            <h3>Current Calculation</h3>
            <p><strong>Area:</strong> {calculations.area} {calculations.areaUnit}</p>
            <p><strong>Weed Size:</strong> {calculations.weedSize}</p>
            <p><strong>Application Rate:</strong> {calculations.applicationRate} {calculations.applicationRateUnit}</p>
            <p><strong>FireHawk Required:</strong> {calculations.fireHawkQuantity} {calculations.outputUnit}</p>
            <p><strong>Water Required:</strong> {calculations.waterVolume} {calculations.outputUnit}</p>
            <p><strong>Total Spray Volume:</strong> {calculations.totalSprayVolume} {calculations.outputUnit}</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px',
        height: 'fit-content'
      }}>
        <h3>Shopping Cart ({cartItems.length})</h3>
        
        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <div key={index} style={{ 
                padding: '10px', 
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '10px'
              }}>
                <h4>{item.productName}</h4>
                <p>Package: {item.packageSize} {item.packageUnit}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.totalPrice.toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item.packageId)}
                  style={{ 
                    color: '#dc2626', 
                    background: 'none', 
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div style={{ 
              borderTop: '2px solid #374151', 
              paddingTop: '10px',
              marginTop: '10px'
            }}>
              <h4>Total: ${cartTotal.toFixed(2)}</h4>
              <button 
                onClick={clearCart}
                style={{ 
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdvancedExample;