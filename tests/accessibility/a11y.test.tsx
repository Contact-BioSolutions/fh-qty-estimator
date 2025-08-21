// Accessibility tests using jest-axe
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FireHawkEstimator } from '../../src/components/FireHawkEstimator';
import { EstimatorForm } from '../../src/components/EstimatorForm';
import { CalculationDisplay } from '../../src/components/CalculationDisplay';
import { AddToCartSection } from '../../src/components/AddToCartSection';
import { 
  ProductInfo, 
  UnitSystem, 
  WeedSize, 
  AreaUnit, 
  VolumeUnit,
  CalculationResult 
} from '../../src/types';
import { WEED_SIZE_CONFIG, DEFAULT_APPLICATION_RATES } from '../../src/constants';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  const mockProductInfo: ProductInfo = {
    id: 'firehawk-a11y-test',
    name: 'FireHawk Accessibility Test',
    sku: 'FH-A11Y-001',
    basePrice: 45.99,
    currency: 'USD',
    concentrationRatio: 2.5,
    packageSizes: [
      {
        id: 'test-16oz',
        volume: 16,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 45.99,
        isPopular: true
      }
    ],
    applicationRates: {
      [WeedSize.SMALL]: { min: 1.0, max: 2.0, default: 1.5 },
      [WeedSize.MEDIUM]: { min: 1.5, max: 3.0, default: 2.0 },
      [WeedSize.LARGE]: { min: 2.0, max: 4.0, default: 3.0 },
      [WeedSize.EXTRA_LARGE]: { min: 3.0, max: 6.0, default: 4.0 }
    }
  };

  const mockCalculationResult: CalculationResult = {
    requiredProduct: 2.5,
    productUnit: VolumeUnit.FLUID_OUNCES,
    totalMixture: 2.0,
    mixtureUnit: VolumeUnit.GALLONS,
    coverageArea: 1000,
    coverageUnit: AreaUnit.SQUARE_FEET,
    estimatedCost: 45.99,
    currency: 'USD',
    recommendations: [
      {
        packageId: 'test-16oz',
        quantity: 1,
        totalCost: 45.99,
        efficiency: 2.87,
        isOptimal: true
      }
    ],
    breakdown: {
      steps: [
        {
          id: 'test-step',
          description: 'Test calculation step',
          formula: '1000 × 2.5',
          input: '1000 sq ft',
          output: '2.5',
          unit: 'fl oz'
        }
      ],
      assumptions: ['Test assumption'],
      factors: {
        weedSizeMultiplier: 1.25,
        applicationRate: 2.0,
        concentrationRatio: 2.5
      }
    }
  };

  describe('FireHawk Estimator Main Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with add to cart functionality', async () => {
      const { container } = render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in metric system', async () => {
      const { container } = render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          initialUnitSystem={UnitSystem.METRIC}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with error states', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      // Component should handle error states accessibly
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Estimator Form Component', () => {
    const formProps = {
      onValuesChange: jest.fn(),
      unitSystem: UnitSystem.IMPERIAL,
      weedSizeConfig: WEED_SIZE_CONFIG,
      applicationRates: DEFAULT_APPLICATION_RATES
    };

    it('should not have accessibility violations', async () => {
      const { container } = render(<EstimatorForm {...formProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in vertical layout', async () => {
      const { container } = render(
        <EstimatorForm {...formProps} layout="vertical" />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in grid layout', async () => {
      const { container } = render(
        <EstimatorForm {...formProps} layout="grid" />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in compact mode', async () => {
      const { container } = render(
        <EstimatorForm {...formProps} compactMode={true} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with metric system', async () => {
      const { container } = render(
        <EstimatorForm {...formProps} unitSystem={UnitSystem.METRIC} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Calculation Display Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <CalculationDisplay 
          calculation={mockCalculationResult}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with breakdown shown', async () => {
      const { container } = render(
        <CalculationDisplay 
          calculation={mockCalculationResult}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with cost analysis', async () => {
      const { container } = render(
        <CalculationDisplay 
          calculation={mockCalculationResult}
          unitSystem={UnitSystem.IMPERIAL}
          showCostAnalysis={true}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in metric system', async () => {
      const { container } = render(
        <CalculationDisplay 
          calculation={mockCalculationResult}
          unitSystem={UnitSystem.METRIC}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with null calculation', async () => {
      const { container } = render(
        <CalculationDisplay 
          calculation={null}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Add to Cart Section Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AddToCartSection 
          calculation={mockCalculationResult}
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations when loading', async () => {
      const { container } = render(
        <AddToCartSection 
          calculation={mockCalculationResult}
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
          isLoading={true}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations when disabled', async () => {
      const { container } = render(
        <AddToCartSection 
          calculation={mockCalculationResult}
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
          disabled={true}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Individual Form Controls', () => {
    it('should have accessible area input', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have accessible weed size selector', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'form-field-multiple-labels': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have accessible application rate slider', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dynamic Content and State Changes', () => {
    it('should maintain accessibility during unit system changes', async () => {
      const { container, rerender } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      // Test initial state
      let results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Test after unit system change
      rerender(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.METRIC}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility with validation errors', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      // Component should handle error states accessibly
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility during loading states', async () => {
      const { container } = render(
        <AddToCartSection 
          calculation={mockCalculationResult}
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
          isLoading={true}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should not rely solely on color for information', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper tab order', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'tabindex': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have visible focus indicators', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading structure', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
          'empty-heading': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark roles', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'landmark-one-main': { enabled: true },
          'landmark-complementary-is-top-level': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have proper live regions for dynamic content', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'aria-live-region-attr': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labeling', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'form-field-multiple-labels': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have proper error association', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'aria-describedby': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have proper fieldset and legend structure', async () => {
      const { container } = render(
        <EstimatorForm 
          onValuesChange={jest.fn()}
          unitSystem={UnitSystem.IMPERIAL}
          weedSizeConfig={WEED_SIZE_CONFIG}
          applicationRates={DEFAULT_APPLICATION_RATES}
        />
      );
      
      const results = await axe(container, {
        rules: {
          'fieldset-legend': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should be accessible on mobile viewports', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient touch target sizes', async () => {
      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container, {
        rules: {
          'target-size': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('High Contrast Mode', () => {
    it('should work in high contrast mode', async () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', async () => {
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});