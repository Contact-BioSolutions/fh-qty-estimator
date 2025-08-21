// Integration tests for complete user workflows
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FireHawkEstimator } from '../../src/components/FireHawkEstimator';
import { ProductInfo, UnitSystem, WeedSize, AreaUnit, VolumeUnit } from '../../src/types';

describe('User Workflow Integration Tests', () => {
  const mockProductInfo: ProductInfo = {
    id: 'firehawk-integration-test',
    name: 'FireHawk Professional Herbicide',
    sku: 'FH-PRO-001',
    basePrice: 45.99,
    currency: 'USD',
    concentrationRatio: 2.5,
    packageSizes: [
      {
        id: 'trial-4oz',
        volume: 4,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 15.99,
        isPopular: false
      },
      {
        id: 'standard-8oz',
        volume: 8,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 28.99,
        isPopular: false
      },
      {
        id: 'popular-16oz',
        volume: 16,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 52.99,
        isPopular: true
      },
      {
        id: 'bulk-32oz',
        volume: 32,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 95.99,
        isPopular: false
      },
      {
        id: 'professional-64oz',
        volume: 64,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 175.99,
        isPopular: false
      }
    ],
    applicationRates: {
      [WeedSize.SMALL]: { min: 1.0, max: 2.0, default: 1.5 },
      [WeedSize.MEDIUM]: { min: 1.5, max: 3.0, default: 2.0 },
      [WeedSize.LARGE]: { min: 2.0, max: 4.0, default: 3.0 },
      [WeedSize.EXTRA_LARGE]: { min: 3.0, max: 6.0, default: 4.0 }
    }
  };

  const mockOnAddToCart = jest.fn();
  const mockOnCalculationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Complete Estimation Workflow', () => {
    it('should handle basic lawn treatment estimation', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
          onCalculationChange={mockOnCalculationChange}
        />
      );

      // Step 1: User enters their lawn area (2500 sq ft)
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2500');

      // Step 2: User selects medium weed size
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.MEDIUM);

      // Step 3: User adjusts application rate to 2.5 oz per 1000 sq ft
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '2.5');

      // Wait for calculation to complete
      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });

      // Verify calculation results
      await waitFor(() => {
        // Should show required product amount (approximately 7.8 fl oz for 2500 sq ft at 2.5 rate with medium multiplier)
        const productAmount = screen.getByText(/fl oz/i);
        expect(productAmount).toBeInTheDocument();
        
        // Should show total mixture volume (approximately 5 gallons)
        const mixtureVolume = screen.getByText(/gal/i);
        expect(mixtureVolume).toBeInTheDocument();
      });

      // Verify package recommendations
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeInTheDocument();
      expect(addToCartButton).not.toBeDisabled();

      // Step 4: User adds to cart
      await user.click(addToCartButton);

      expect(mockOnAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: mockProductInfo.id,
          sku: expect.any(String),
          quantity: expect.any(Number),
          totalPrice: expect.any(Number),
          metadata: expect.objectContaining({
            estimatorValues: expect.objectContaining({
              area: 2500,
              weedSize: WeedSize.MEDIUM,
              applicationRate: 2.5
            })
          })
        })
      );
    });

    it('should handle large commercial area estimation', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Commercial scenario: 5 acres with large weeds
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '5');

      // Change to acres
      const areaUnitSelector = screen.getByRole('combobox', { name: /area unit/i });
      await user.selectOptions(areaUnitSelector, AreaUnit.ACRES);

      // Select large weeds
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);

      // Use higher application rate for large weeds
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '3.5');

      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });

      // Should recommend multiple packages or larger package sizes
      await waitFor(() => {
        const packageRecommendations = screen.getAllByText(/fl oz/i);
        expect(packageRecommendations.length).toBeGreaterThan(0);
      });

      // Should show significant product requirement
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addToCartButton).toBeInTheDocument();
    });

    it('should handle metric system workflow', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          initialUnitSystem={UnitSystem.METRIC}
        />
      );

      // Verify metric units are displayed
      expect(screen.getByText(/sq m/i)).toBeInTheDocument();
      expect(screen.getByText(/ml/i)).toBeInTheDocument();

      // Enter area in square meters
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '500');

      // Select small weeds
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.SMALL);

      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });

      // Results should be displayed in metric units
      await waitFor(() => {
        expect(screen.getByText(/ml/i)).toBeInTheDocument();
        expect(screen.getByText(/L/i)).toBeInTheDocument();
      });
    });

    it('should handle unit system conversion mid-workflow', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onCalculationChange={mockOnCalculationChange}
        />
      );

      // Start with imperial units
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '1000');

      // Wait for initial calculation
      await waitFor(() => {
        expect(mockOnCalculationChange).toHaveBeenCalled();
      });

      const initialCallCount = mockOnCalculationChange.mock.calls.length;

      // Switch to metric
      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      await user.click(unitToggle);

      // Verify conversion
      await waitFor(() => {
        expect(screen.getByText(/sq m/i)).toBeInTheDocument();
      });

      // Area should be converted (1000 sq ft ≈ 92.9 sq m)
      await waitFor(() => {
        const convertedAreaInput = screen.getByLabelText(/coverage area input/i);
        expect(parseFloat(convertedAreaInput.value)).toBeCloseTo(92.9, 0);
      });

      // Should trigger new calculation with converted values
      await waitFor(() => {
        expect(mockOnCalculationChange.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle validation errors and recovery', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Enter invalid area (below minimum)
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/area must be at least/i)).toBeInTheDocument();
      });

      // Add to cart should be disabled
      await waitFor(() => {
        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        expect(addToCartButton).toBeDisabled();
      });

      // Correct the error
      await user.clear(areaInput);
      await user.type(areaInput, '1500');

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Add to cart should be enabled
      await waitFor(() => {
        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        expect(addToCartButton).not.toBeDisabled();
      });
    });

    it('should handle application rate boundary violations', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      // Select small weeds (max rate 2.0)
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.SMALL);

      // Try to set rate above maximum
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '3.0');

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/application rate.*must be between/i)).toBeInTheDocument();
      });

      // Correct the rate
      await user.clear(rateSlider);
      await user.type(rateSlider, '1.8');

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should handle add to cart failures gracefully', async () => {
      const user = userEvent.setup();
      mockOnAddToCart.mockRejectedValue(new Error('Network error'));

      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
      });

      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(addToCartButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to add item to cart/i)).toBeInTheDocument();
      });

      // User should be able to retry
      expect(addToCartButton).not.toBeDisabled();
    });
  });

  describe('Reset and Start Over Workflows', () => {
    it('should handle complete form reset', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      // Make changes to all inputs
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '5000');

      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);

      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '3.5');

      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset all values/i });
      await user.click(resetButton);

      // All values should return to defaults
      await waitFor(() => {
        expect(areaInput).toHaveValue(1000);
        expect(weedSizeSelector).toHaveValue(WeedSize.MEDIUM);
        expect(rateSlider).toHaveValue('2');
      });
    });

    it('should handle reset after validation errors', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      // Create validation errors
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset all values/i });
      await user.click(resetButton);

      // Errors should be cleared
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Values should be back to defaults
      expect(areaInput).toHaveValue(1000);
    });
  });

  describe('Multi-Step Complex Scenarios', () => {
    it('should handle multi-area treatment planning', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Scenario: Front yard (1500 sq ft, medium weeds)
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '1500');

      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.MEDIUM);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
      });

      // Add front yard to cart
      await user.click(screen.getByRole('button', { name: /add to cart/i }));
      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);

      // Reset for back yard
      await user.click(screen.getByRole('button', { name: /reset all values/i }));

      // Back yard (3000 sq ft, large weeds)
      await user.clear(areaInput);
      await user.type(areaInput, '3000');
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
      });

      // Add back yard to cart
      await user.click(screen.getByRole('button', { name: /add to cart/i }));
      expect(mockOnAddToCart).toHaveBeenCalledTimes(2);

      // Verify different calculations for different scenarios
      const calls = mockOnAddToCart.mock.calls;
      expect(calls[0][0].metadata.estimatorValues.area).toBe(1500);
      expect(calls[0][0].metadata.estimatorValues.weedSize).toBe(WeedSize.MEDIUM);
      expect(calls[1][0].metadata.estimatorValues.area).toBe(3000);
      expect(calls[1][0].metadata.estimatorValues.weedSize).toBe(WeedSize.LARGE);
    });

    it('should handle seasonal treatment planning', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Spring treatment (light application for small weeds)
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');

      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.SMALL);

      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '1.2');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      // Summer follow-up (stronger application)
      await user.selectOptions(weedSizeSelector, WeedSize.MEDIUM);
      await user.clear(rateSlider);
      await user.type(rateSlider, '2.5');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      expect(mockOnAddToCart).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onCalculationChange={mockOnCalculationChange}
        />
      );

      const areaInput = screen.getByLabelText(/coverage area input/i);
      const rateSlider = screen.getByLabelText(/application rate slider/i);

      // Rapid input changes
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, `${1000 + i * 100}`);
        await user.clear(rateSlider);
        await user.type(rateSlider, `${2.0 + i * 0.1}`);
      }

      const endTime = performance.now();

      // Should complete rapidly
      expect(endTime - startTime).toBeLessThan(5000);

      // Should still be responsive
      expect(areaInput).toHaveValue(1900);
      expect(parseFloat(rateSlider.value)).toBeCloseTo(2.9, 1);
    });

    it('should maintain calculation accuracy under stress', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onCalculationChange={mockOnCalculationChange}
        />
      );

      // Set known values for verification
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');

      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);

      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await user.clear(rateSlider);
      await user.type(rateSlider, '3.0');

      // Wait for final calculation
      await waitFor(() => {
        expect(mockOnCalculationChange).toHaveBeenCalled();
      });

      // Verify calculation accuracy
      const lastCall = mockOnCalculationChange.mock.calls[mockOnCalculationChange.mock.calls.length - 1];
      const calculation = lastCall[0];

      // Large weeds: 3.0 * 1.5 multiplier = 4.5 fl oz per 1000 sq ft
      // For 2000 sq ft: 4.5 * 2 = 9.0 fl oz
      expect(calculation.requiredProduct).toBeCloseTo(9.0, 1);
      expect(calculation.coverageArea).toBe(2000);
    });
  });

  describe('Accessibility Workflows', () => {
    it('should support complete keyboard-only workflow', async () => {
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Navigate through form using keyboard only
      await userEvent.tab(); // Area input
      expect(document.activeElement).toBeTruthy();

      await userEvent.keyboard('{Control>}a{/Control}2500{Enter}');

      await userEvent.tab(); // Weed size selector
      await userEvent.keyboard('{ArrowDown}'); // Change selection

      await userEvent.tab(); // Application rate slider
      await userEvent.keyboard('{ArrowRight}{ArrowRight}'); // Adjust rate

      // Continue to add to cart button
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();

      const addToCartButton = document.activeElement as HTMLElement;
      expect(addToCartButton).toHaveTextContent(/add to cart/i);

      await userEvent.keyboard('{Enter}');
      expect(mockOnAddToCart).toHaveBeenCalled();
    });

    it('should announce calculation updates to screen readers', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      // Look for aria-live regions
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();

      // Make a change that should trigger announcement
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '3000');

      // Live region should be updated
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/calculation updated/i);
      });
    });
  });
});