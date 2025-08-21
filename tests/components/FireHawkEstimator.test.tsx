// Component tests for FireHawkEstimator
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FireHawkEstimator } from '../../src/components/FireHawkEstimator';
import { ProductInfo, UnitSystem, WeedSize, AreaUnit, VolumeUnit } from '../../src/types';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('FireHawkEstimator Component', () => {
  const mockProductInfo: ProductInfo = {
    id: 'firehawk-test',
    name: 'FireHawk Test Herbicide',
    sku: 'FH-TEST-001',
    basePrice: 45.99,
    currency: 'USD',
    concentrationRatio: 2.5,
    packageSizes: [
      {
        id: 'small-8oz',
        volume: 8,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 24.99,
        isPopular: false
      },
      {
        id: 'medium-16oz',
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

  const mockOnAddToCart = jest.fn();
  const mockOnCalculationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Basic Rendering', () => {
    it('should render the estimator component', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
      expect(screen.getByText(/Professional herbicide concentrate/)).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <FireHawkEstimator 
          productInfo={mockProductInfo} 
          className="custom-estimator" 
        />
      );
      
      expect(container.firstChild).toHaveClass('firehawk-estimator', 'custom-estimator');
    });

    it('should render all main sections', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Form section should be present
      expect(screen.getByRole('form', { name: /quantity estimator form/i })).toBeInTheDocument();
      
      // Reset button should be present
      expect(screen.getByRole('button', { name: /reset all values/i })).toBeInTheDocument();
      
      // Product info footer should be present
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
    });

    it('should show disclaimer', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.getByText(/Always read and follow label directions/)).toBeInTheDocument();
    });
  });

  describe('Unit System', () => {
    it('should initialize with imperial system by default', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Should show imperial units
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument(); // Default area
      expect(screen.getByText(/sq ft/i)).toBeInTheDocument();
    });

    it('should initialize with specified unit system', () => {
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo} 
          initialUnitSystem={UnitSystem.METRIC} 
        />
      );
      
      // Should show metric units
      expect(screen.getByText(/sq m/i)).toBeInTheDocument();
    });

    it('should handle unit system changes', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Find and click unit system toggle
      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      await user.click(unitToggle);
      
      // Should convert to metric units
      expect(screen.getByText(/sq m/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle area input changes', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');
      
      expect(areaInput).toHaveValue(2000);
    });

    it('should handle weed size selection', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);
      
      expect(weedSizeSelector).toHaveValue(WeedSize.LARGE);
    });

    it('should handle application rate changes', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      fireEvent.change(rateSlider, { target: { value: '2.5' } });
      
      expect(rateSlider).toHaveValue('2.5');
    });

    it('should auto-adjust application rate when weed size changes', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);
      
      // Application rate should update to default for large weeds (3.0)
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      await waitFor(() => {
        expect(rateSlider).toHaveValue('3');
      });
    });
  });

  describe('Real-time Calculations', () => {
    it('should display calculation results', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Should show required product amount
      expect(screen.getByText(/fl oz/i)).toBeInTheDocument();
    });

    it('should update calculations when inputs change', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Wait for initial calculation
      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });
      
      // Change area
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');
      
      // Should trigger new calculation
      await waitFor(() => {
        // Results should update (doubled area should roughly double product needed)
        expect(screen.getByText(/fl oz/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during calculations', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Should show calculating indicator initially
      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
      
      // Should disappear after calculation completes
      await waitFor(() => {
        expect(screen.queryByText(/calculating/i)).not.toBeInTheDocument();
      });
    });

    it('should call onCalculationChange callback', async () => {
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo} 
          onCalculationChange={mockOnCalculationChange} 
        />
      );
      
      await waitFor(() => {
        expect(mockOnCalculationChange).toHaveBeenCalled();
      });
      
      const lastCall = mockOnCalculationChange.mock.calls[mockOnCalculationChange.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('requiredProduct');
      expect(lastCall[0]).toHaveProperty('totalMixture');
    });
  });

  describe('Error Handling', () => {
    it('should display validation errors', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Enter invalid area (below minimum)
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/area must be at least/i)).toBeInTheDocument();
      });
    });

    it('should display multiple errors', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Enter multiple invalid values
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '0');
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      fireEvent.change(rateSlider, { target: { value: '0.5' } }); // Below minimum for medium weeds
      
      await waitFor(() => {
        const errorBanner = screen.getByRole('alert');
        expect(errorBanner).toBeInTheDocument();
        
        const errorList = within(errorBanner).getAllByRole('listitem');
        expect(errorList.length).toBeGreaterThan(1);
      });
    });

    it('should allow error dismissal', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Create an error
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Dismiss error
      const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
      await user.click(dismissButton);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should clear errors when user makes corrections', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Create an error
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Fix the error
      await user.clear(areaInput);
      await user.type(areaInput, '1000');
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add to Cart Functionality', () => {
    it('should render add to cart section when callback provided', async () => {
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo} 
          onAddToCart={mockOnAddToCart} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
      });
    });

    it('should not render add to cart section when callback not provided', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    });

    it('should handle add to cart action', async () => {
      const user = userEvent.setup();
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
      
      expect(mockOnAddToCart).toHaveBeenCalled();
    });

    it('should show loading state when adding to cart', async () => {
      const user = userEvent.setup();
      mockOnAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
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
      
      // Should show loading state
      expect(addToCartButton).toBeDisabled();
    });

    it('should handle add to cart errors', async () => {
      const user = userEvent.setup();
      mockOnAddToCart.mockRejectedValue(new Error('Failed to add to cart'));
      
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
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to add item to cart/i)).toBeInTheDocument();
      });
    });

    it('should disable add to cart when there are validation errors', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo} 
          onAddToCart={mockOnAddToCart} 
        />
      );
      
      // Create validation error
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        expect(addToCartButton).toBeDisabled();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form to default values', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Change some values
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);
      
      // Reset
      const resetButton = screen.getByRole('button', { name: /reset all values/i });
      await user.click(resetButton);
      
      // Should return to defaults
      await waitFor(() => {
        expect(areaInput).toHaveValue(1000);
        expect(weedSizeSelector).toHaveValue(WeedSize.MEDIUM);
      });
    });

    it('should clear errors when resetting', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Create an error
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Reset
      const resetButton = screen.getByRole('button', { name: /reset all values/i });
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Component should still render and be functional
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
    });

    it('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
    });

    it('should handle desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
    });

    it('should respond to window resize events', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      
      fireEvent(window, new Event('resize'));
      
      // Component should still be functional
      expect(screen.getByText('FireHawk Test Herbicide')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      expect(screen.getByLabelText(/coverage area input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weed size selector/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/application rate slider/i)).toBeInTheDocument();
    });

    it('should use proper alert role for errors', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Create an error
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/area must be at least/i);
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();
      
      await user.tab();
      expect(document.activeElement).toBeTruthy();
      
      // Should be able to interact with focused elements
      if (document.activeElement) {
        await user.keyboard('[Enter]');
      }
    });

    it('should have proper heading structure', () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Product name should be a heading
      expect(screen.getByRole('heading', { name: /firehawk test herbicide/i })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render within reasonable time', () => {
      const start = performance.now();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      
      // Rapid changes should be handled smoothly
      for (let i = 0; i < 10; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, `${1000 + i * 100}`);
      }
      
      // Should still be responsive
      expect(areaInput).toHaveValue(1900);
    });
  });
});